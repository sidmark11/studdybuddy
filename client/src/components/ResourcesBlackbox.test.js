import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Resources from './Resources';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GroupContext } from '../context/GroupContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import axios from 'axios';

jest.mock('../firebaseConfig', () => ({
    db: {},
    auth: { currentUser: { displayName: 'TestUser' } }
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn()
}));

jest.mock('axios');

const mockRoom = 'TestRoom';

const renderWithProviders = (ui) => {
    return render(
        <Router>
            <AuthContext.Provider value={{ user: { displayName: 'TestUser' } }}>
                <GroupContext.Provider value={{ currentGroup: mockRoom }}>
                    {ui}
                </GroupContext.Provider>
            </AuthContext.Provider>
        </Router>
    );
};

describe('Resources Component', () => {
    test('loads resources and displays them for a room', async () => {
        const mockResources = [
            {
                id: '1',
                fileName: 'Resource 1',
                driveURL: 'http://example.com/resource1',
                uploadedBy: 'User1'
            },
            {
                id: '2',
                fileName: 'Resource 2',
                driveURL: 'http://example.com/resource2',
                uploadedBy: 'User2'
            }
        ];

        getDocs.mockResolvedValueOnce({ docs: mockResources.map((resource) => ({
            id: resource.id,
            data: () => resource
        })) });

        renderWithProviders(<Resources />);

        await waitFor(() => {
            const resourceLink1 = screen.getByText('Resource 1');
            expect(resourceLink1).toBeInTheDocument();
        });

        await waitFor(() => {
            const resourceLink2 = screen.getByText('Resource 2');
            expect(resourceLink2).toBeInTheDocument();
        });
    });

    test('uploads a file to Google Drive', async () => {
        const mockFile = new File(['sample content'], 'example.pdf', { type: 'application/pdf' });

        axios.get.mockResolvedValueOnce({ data: { requiresAuth: false } });
        axios.post.mockResolvedValueOnce({ data: { webViewLink: 'http://drive.google.com/example.pdf' } });
        addDoc.mockResolvedValueOnce({});

        renderWithProviders(<Resources />);

        const fileInput = screen.getByLabelText(/file/i);
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload to Google Drive');
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3000/upload',
                expect.any(FormData),
                expect.any(Object)
            );
        });

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
                fileName: 'example.pdf',
                groupID: mockRoom,
                driveURL: 'http://drive.google.com/example.pdf',
                uploadedBy: 'TestUser'
            });
        });
    });
});
