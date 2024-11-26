import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from './Calendar';
import { AuthContext } from '../context/AuthContext';
import { GroupContext } from '../context/GroupContext';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock Firebase Firestore
jest.mock('../firebaseConfig', () => ({
    db: {}
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn().mockResolvedValue({
        docs: [
            {
                id: '1',
                data: () => ({
                    title: 'Sample Event',
                    description: 'Sample Description',
                    location: 'Room 101',
                    date: new Date(),
                })
            }
        ]
    }),
    addDoc: jest.fn(),
    Timestamp: {
        fromDate: (date) => date
    }
}));

// Mock Contexts
const mockCurrentGroup = 'TestGroup';
const mockUser = { displayName: 'TestUser' };

const renderWithProviders = (ui) => {
    return render(
        <Router>
            <AuthContext.Provider value={{ user: mockUser }}>
                <GroupContext.Provider value={{ currentGroup: mockCurrentGroup }}>
                    {ui}
                </GroupContext.Provider>
            </AuthContext.Provider>
        </Router>
    );
};

describe('Calendar Component', () => {
    test('renders calendar header with current month and year', () => {
        renderWithProviders(<Calendar />);
        const monthYear = screen.getByText(new RegExp(new Date().toLocaleString('default', { month: 'long' })));
        expect(monthYear).toBeInTheDocument();
    });

    test('navigates to the previous month when "previous" button is clicked', () => {
        renderWithProviders(<Calendar />);
        const prevButton = screen.getByText('<');
        fireEvent.click(prevButton);

        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        const updatedMonthYear = screen.getByText(new RegExp(previousMonth.toLocaleString('default', { month: 'long' })));
        expect(updatedMonthYear).toBeInTheDocument();
    });

    test('navigates to the next month when "next" button is clicked', () => {
        renderWithProviders(<Calendar />);
        const nextButton = screen.getByText('>');
        fireEvent.click(nextButton);

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const updatedMonthYear = screen.getByText(new RegExp(nextMonth.toLocaleString('default', { month: 'long' })));
        expect(updatedMonthYear).toBeInTheDocument();
    });

    test('loads and displays events for a selected date', async () => {
        renderWithProviders(<Calendar />);
        const dayElement = screen.getByText('15'); // Assume the 15th is a valid day
        fireEvent.click(dayElement);

        const eventTitle = await screen.findByText('Sample Event');
        expect(eventTitle).toBeInTheDocument();
    });
});
