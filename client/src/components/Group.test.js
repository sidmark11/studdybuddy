import { render, screen, fireEvent } from '@testing-library/react';
import Homepage from './Homepage';
import { addDoc, updateDoc, query, getDocs } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
}));

// Test Creating a New Group
test('creates a new group if it does not exist', async () => {
  getDocs.mockResolvedValueOnce({ empty: true }); // Mock group does not exist
  render(<Homepage />);

  const input = screen.getByPlaceholderText('Type in a group name');
  const button = screen.getByText('Join Group');

  fireEvent.change(input, { target: { value: 'NewGroup' } });
  fireEvent.click(button);

  expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
    groupID: 'NewGroup',
    members: ['TestUser'],
  });
});

// Test Joining an Existing Group
test('joins an existing group if it exists', async () => {
  getDocs.mockResolvedValueOnce({ empty: false }); // Mock group exists
  render(<Homepage />);

  const input = screen.getByPlaceholderText('Type in a group name');
  const button = screen.getByText('Join Group');

  fireEvent.change(input, { target: { value: 'ExistingGroup' } });
  fireEvent.click(button);

  expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
    members: expect.arrayContaining(['TestUser']),
  });
});

// Test Group Name is Added to User Document
test('adds group name to user document', async () => {
  getDocs.mockResolvedValueOnce({ empty: false }); // Mock group exists
  getDocs.mockResolvedValueOnce({ empty: false }); // Mock user exists

  render(<Homepage />);

  const input = screen.getByPlaceholderText('Type in a group name');
  const button = screen.getByText('Join Group');

  fireEvent.change(input, { target: { value: 'GroupForUser' } });
  fireEvent.click(button);

  expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
    groupNames: expect.arrayContaining(['GroupForUser']),
  });
});

// Test Initial Group Names Fetching
test('fetches and displays user group names on load', async () => {
  getDocs.mockResolvedValueOnce({
    empty: false,
    docs: [{ data: () => ({ groupNames: ['Group1', 'Group2'] }) }],
  });

  render(<Homepage />);

  expect(await screen.findByText('Group1')).toBeInTheDocument();
  expect(screen.getByText('Group2')).toBeInTheDocument();
});

// Test Preventing Empty Group Name Submission
test('does not submit when group name is empty', async () => {
  render(<Homepage />);

  const button = screen.getByText('Join Group');
  fireEvent.click(button);

  expect(addDoc).not.toHaveBeenCalled();
  expect(updateDoc).not.toHaveBeenCalled();
});

