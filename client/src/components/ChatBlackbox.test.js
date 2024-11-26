import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Chat from './Chat';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

jest.mock('../firebaseConfig', () => ({
    db: {},
    auth: { currentUser: { displayName: 'TestUser' } }
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn()
}));

const renderWithProviders = (ui, { user = { displayName: 'TestUser' } } = {}) => {
    return render(
        <Router>
            <AuthContext.Provider value={{ user }}>
                {ui}
            </AuthContext.Provider>
        </Router>
    );
};

describe('Chat Component', () => {
    test('renders group list when no room is selected', async () => {
        const mockGroups = ['Group1', 'Group2'];
        getDocs.mockResolvedValueOnce({
            docs: [
                { id: '1', data: () => ({ groupNames: mockGroups }) }
            ]
        });

        renderWithProviders(<Chat />);

        await waitFor(() => {
            expect(screen.getByText('Your Groups')).toBeInTheDocument();
        });

        mockGroups.forEach((group) => {
            expect(screen.getByText(group)).toBeInTheDocument();
        });
    });

    test('renders chat room when room is selected', async () => {
        const mockMessages = [
            { id: '1', text: 'Hello!', user: 'User1' },
            { id: '2', text: 'Hi there!', user: 'User2' }
        ];

        getDocs.mockResolvedValueOnce({
            docs: mockMessages.map((message) => ({
                id: message.id,
                data: () => message
            }))
        });

        renderWithProviders(<Chat />, { location: { search: '?room=TestRoom' } });

        await waitFor(() => {
            expect(screen.getByText('Welcome to TestRoom Chat')).toBeInTheDocument();
        });

        mockMessages.forEach((message) => {
            expect(screen.getByText(message.text)).toBeInTheDocument();
        });
    });

    test('sends a new message', async () => {
        addDoc.mockResolvedValueOnce({ id: 'new-message-id' });
        getDocs.mockResolvedValueOnce({
            docs: [
                { id: 'new-message-id', data: () => ({ text: 'New Message', user: 'TestUser', room: 'TestRoom' }) }
            ]
        });

        renderWithProviders(<Chat />, { location: { search: '?room=TestRoom' } });

        const input = screen.getByPlaceholderText('Type a message...');
        const sendButton = screen.getByText('Send');

        fireEvent.change(input, { target: { value: 'New Message' } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('New Message')).toBeInTheDocument();
        });

        expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
            text: 'New Message',
            createdAt: serverTimestamp(),
            user: 'TestUser',
            room: 'TestRoom'
        });
    });

    test('loads more messages when "Load More Messages" is clicked', async () => {
        const initialMessages = [
            { id: '1', text: 'First message', user: 'User1' }
        ];
        const moreMessages = [
            { id: '2', text: 'Older message', user: 'User2' }
        ];

        getDocs.mockResolvedValueOnce({
            docs: initialMessages.map((message) => ({
                id: message.id,
                data: () => message
            }))
        }).mockResolvedValueOnce({
            docs: moreMessages.map((message) => ({
                id: message.id,
                data: () => message
            }))
        });

        renderWithProviders(<Chat />, { location: { search: '?room=TestRoom' } });

        await waitFor(() => {
            expect(screen.getByText('First message')).toBeInTheDocument();
        });

        const loadMoreButton = screen.getByText('Load More Messages');
        fireEvent.click(loadMoreButton);

        await waitFor(() => {
            expect(screen.getByText('Older message')).toBeInTheDocument();
        });
    });

    test('navigates back to group list when "Back to Groups" is clicked', async () => {
        const mockNavigate = jest.fn();
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: () => mockNavigate
        }));

        renderWithProviders(<Chat />, { location: { search: '?room=TestRoom' } });

        const backButton = screen.getByText('Back to Groups');
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
});
