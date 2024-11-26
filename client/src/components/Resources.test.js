import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import axios from "axios";
import Resources from "./Resources";

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(() => ({ search: '?room=test-room' })),
}));


describe("Resources Component Tests", () => {
  const mockRoom = "test-room";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders resources correctly for a room", async () => {
    const mockResources = [
      {
        id: "1",
        fileName: "Test File 1",
        driveURL: "https://drive.google.com/file1",
        uploadedBy: "User1",
      },
      {
        id: "2",
        fileName: "Test File 2",
        driveURL: "https://drive.google.com/file2",
        uploadedBy: "User2",
      },
    ];

    getDocs.mockResolvedValueOnce({
      docs: mockResources.map((resource) => ({
        id: resource.id,
        data: () => resource,
      })),
    });

    render(<Resources />);

    // Assertions for each resource individually
    await waitFor(() => {
      expect(screen.getByText("Test File 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Test File 2")).toBeInTheDocument();
    });

    // Assertions for uploader information
    await waitFor(() => {
      expect(screen.getByText("Uploaded by: User1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Uploaded by: User2")).toBeInTheDocument();
    });
  });

  test("uploads a file to Google Drive", async () => {
    const file = new File(["test"], "testFile.txt", { type: "text/plain" });

    axios.get.mockResolvedValueOnce({ data: { requiresAuth: false } });
    axios.post.mockResolvedValueOnce({ data: { webViewLink: "https://drive.google.com/testfile" } });
    addDoc.mockResolvedValueOnce({});

    render(<Resources />);

    const fileInput = screen.getByLabelText("Upload a file to Google Drive");
    const uploadButton = screen.getByText("Upload to Google Drive");

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5000/upload",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    });

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
        fileName: "testFile.txt",
        groupID: mockRoom,
        driveURL: "https://drive.google.com/testfile",
        uploadedBy: expect.any(String),
      });
    });
  });

  test("does not upload an empty file", async () => {
    render(<Resources />);

    const uploadButton = screen.getByText("Upload to Google Drive");
    fireEvent.click(uploadButton);

    // No asynchronous assertions required; just ensure the methods are not called
    expect(axios.post).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
  });

  test("handles resource fetching errors gracefully", async () => {
    getDocs.mockRejectedValueOnce(new Error("Fetching error"));

    render(<Resources />);

    await waitFor(() => {
      expect(screen.queryByText("Test File 1")).not.toBeInTheDocument();
    });
  });
});
