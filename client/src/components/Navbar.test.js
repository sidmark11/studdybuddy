import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar";
import { auth } from "./../firebaseConfig";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({ search: "?room=test-room" })),
}));

jest.mock("./../firebaseConfig", () => ({
  auth: { signOut: jest.fn() },
}));

jest.mock("./../context/AuthContext", () => ({
  useAuth: jest.fn(() => ({ setUser: jest.fn() })),
}));

describe("Navbar Component Tests", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders all navigation links correctly", () => {
    render(<Navbar />);

    // Check if all links are present
    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });


  test("handles logout correctly and navigates to home page", async () => {
    render(<Navbar />);

    const logoutLink = screen.getByText("Logout");
    fireEvent.click(logoutLink);

    // Check if `auth.signOut` is called
    expect(auth.signOut).toHaveBeenCalled();

    // Check if navigation to "/" occurred
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("does not crash if setUser is not provided", () => {
    // Mock `useAuth` without `setUser`
    jest.mock("./../context/AuthContext", () => ({
      useAuth: jest.fn(() => ({})),
    }));

    expect(() => render(<Navbar />)).not.toThrow();
  });
});
