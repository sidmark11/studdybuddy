import { render, screen, fireEvent } from "@testing-library/react";
import { getDocs, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Chat from "./Chat";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limitToLast: jest.fn(),
  endBefore: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(() => ({ search: "?room=test-room" })),
  useNavigate: jest.fn(() => jest.fn()),
}));

describe("Chat Component Tests", () => {
  test("loads initial messages for the room", async () => {
    const mockMessages = [
      { id: "1", text: "Hello", user: "User1", createdAt: new Date() },
      { id: "2", text: "Hi", user: "User2", createdAt: new Date() },
    ];

    getDocs.mockResolvedValueOnce({
      docs: mockMessages.map((msg) => ({ id: msg.id, data: () => msg })),
    });

    render(<Chat />);

    expect(await screen.findByText("Hello")).toBeInTheDocument();
    expect(await screen.findByText("Hi")).toBeInTheDocument();
  });

  test("loads more messages when 'Load More Messages' button is clicked", async () => {
    const initialMessages = [
      { id: "1", text: "Initial message", user: "User1", createdAt: new Date() },
    ];
    const additionalMessages = [
      { id: "2", text: "Older message", user: "User2", createdAt: new Date() },
    ];

    getDocs
      .mockResolvedValueOnce({
        docs: initialMessages.map((msg) => ({ id: msg.id, data: () => msg })),
      })
      .mockResolvedValueOnce({
        docs: additionalMessages.map((msg) => ({ id: msg.id, data: () => msg })),
      });

    render(<Chat />);

    expect(await screen.findByText("Initial message")).toBeInTheDocument();

    screen.getByText("Load More Messages").click();
    expect(await screen.findByText("Older message")).toBeInTheDocument();
  });

  test("sends a new message and updates the message list", async () => {
    addDoc.mockResolvedValueOnce({ id: "new-message-id" });

    const mockMessageData = {
      id: "new-message-id",
      text: "New message",
      user: "TestUser",
      createdAt: new Date(),
    };

    getDocs.mockResolvedValueOnce({
      docs: [{ id: "new-message-id", data: () => mockMessageData }],
    });

    render(<Chat />);

    fireEvent.change(screen.getByPlaceholderText("Type a message..."), {
      target: { value: "New message" },
    });
    fireEvent.click(screen.getByText("Send"));

    expect(await screen.findByText("New message")).toBeInTheDocument();
  });

  test("navigates back to groups when 'Back to Groups' button is clicked", () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(<Chat />);

    fireEvent.click(screen.getByText("Back to Groups"));
    expect(mockNavigate).toHaveBeenCalledWith("/chat");
  });
});
