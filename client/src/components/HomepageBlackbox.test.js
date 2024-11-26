import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Homepage from './Homepage';
import { AuthContext } from '../context/AuthContext'; // Mock useAuth
import { GroupContext } from '../context/GroupContext'; // Mock useGroup
import { BrowserRouter as Router } from 'react-router-dom';

// Mock Firebase methods
jest.mock('../firebaseConfig', () => ({
    auth: {
        currentUser: {
            displayName: 'TestUser'
        }
    },
    db: {}
}));

jest.mock('firebase/firestore', () => ({
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    arrayUnion: jest.fn()
}));

// Mock context hooks
const mockUpdateGroup = jest.fn();

const renderWithProviders = (ui) => {
    return render(
        <Router>
            <AuthContext.Provider value={{ user: { displayName: 'TestUser' } }}>
                <GroupContext.Provider value={{ updateGroup: mockUpdateGroup }}>
                    {ui}
                </GroupContext.Provider>
            </AuthContext.Provider>
        </Router>
    );
};

describe('Homepage Component', () => {
    test('renders welcome message with user name', () => {
        renderWithProviders(<Homepage />);
        const welcomeMessage = screen.getByText(/Welcome to StudyBuddy, TestUser!/i);
        expect(welcomeMessage).toBeInTheDocument();
    });

    test('displays "not part of any study group" message if no groups exist', () => {
        renderWithProviders(<Homepage />);
        const noGroupMessage = screen.getByText(/You are not part of any study group yet./i);
        expect(noGroupMessage).toBeInTheDocument();
    });

    test('renders group dropdown when groups exist', () => {
        const mockGroupNames = ['Group1', 'Group2'];
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [mockGroupNames, jest.fn()]); // Mock groupNames

        renderWithProviders(<Homepage />);
        const dropdown = screen.getByLabelText(/Select a Pre-Existing Group:/i);
        expect(dropdown).toBeInTheDocument();
        expect(dropdown).toHaveTextContent('Group1');
        expect(dropdown).toHaveTextContent('Group2');
    });
});
