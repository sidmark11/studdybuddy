import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import Calendar from "./Calendar";

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date) => date), // Mock conversion for simplicity
  },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { displayName: 'TestUser' },
  })),
}));

jest.mock('../context/GroupContext', () => ({
  useGroup: jest.fn(() => ({
    currentGroup: 'test-group',
  })),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(() => jest.fn()),
}));


describe("Calendar Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the calendar correctly", () => {
    render(<Calendar />);

    // Check for header and navigation buttons
    expect(screen.getByText(/Add Study Session/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "<" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ">" })).toBeInTheDocument();

    // Check for weekdays
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test("navigates between months", () => {
    render(<Calendar />);

    // Get current month
    const currentMonth = new Date().toLocaleString("default", { month: "long" });

    // Navigate to previous month
    fireEvent.click(screen.getByRole("button", { name: "<" }));
    const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString(
      "default",
      { month: "long" }
    );
    expect(screen.getByText(prevMonth)).toBeInTheDocument();

    // Navigate to next month
    fireEvent.click(screen.getByRole("button", { name: ">" }));
    fireEvent.click(screen.getByRole("button", { name: ">" }));
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString(
      "default",
      { month: "long" }
    );
    expect(screen.getByText(nextMonth)).toBeInTheDocument();
  });

  test("loads events for a selected date", async () => {
    const mockEvents = [
      {
        id: "1",
        title: "Event 1",
        description: "Description 1",
        location: "Location 1",
        date: new Date(),
      },
    ];

    getDocs.mockResolvedValueOnce({
      docs: mockEvents.map((event) => ({
        id: event.id,
        data: () => event,
      })),
    });

    render(<Calendar />);

    // Simulate selecting a day
    fireEvent.click(screen.getByText("15"));

    // Individual assertions in separate `waitFor` blocks
    await waitFor(() => {
      expect(screen.getByText("Event 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Description 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Location 1")).toBeInTheDocument();
    });
  });

  test("adds a study session", async () => {
    addDoc.mockResolvedValueOnce({});

    render(<Calendar />);

    // Show form
    fireEvent.click(screen.getByText(/Add Study Session/i));

    // Fill out form
    fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "New Session" } });
    fireEvent.change(screen.getByPlaceholderText("Description"), { target: { value: "Session Description" } });
    fireEvent.change(screen.getByPlaceholderText("Location"), { target: { value: "Library" } });
    fireEvent.change(screen.getByPlaceholderText("Date"), { target: { value: "2024-01-01" } });
    fireEvent.change(screen.getByPlaceholderText("Time"), { target: { value: "14:00" } });

    // Submit form
    fireEvent.click(screen.getByText("Save Session"));

    // Verify API call
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
        title: "New Session",
        description: "Session Description",
        location: "Library",
        date: expect.any(Date), // Timestamp is mocked to return the same Date
        groupID: "test-group",
        participants: ["TestUser"],
      });
    });
  });

  test("handles empty user and group gracefully when loading events", async () => {
    jest.mock("../context/AuthContext", () => ({
      useAuth: jest.fn(() => ({ user: null })),
    }));
    jest.mock("../context/GroupContext", () => ({
      useGroup: jest.fn(() => ({ currentGroup: null })),
    }));

    render(<Calendar />);

    // Simulate selecting a day
    fireEvent.click(screen.getByText("15"));

    // Verify that no API calls are made
    await waitFor(() => {
      expect(getDocs).not.toHaveBeenCalled();
    });
  });

  test("renders 'No events for this day' message when no events exist", async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<Calendar />);

    // Simulate selecting a day
    fireEvent.click(screen.getByText("15"));

    // Individual assertions in separate `waitFor` blocks
    await waitFor(() => {
      expect(screen.getByText("No events for this day.")).toBeInTheDocument();
    });
  });
});
