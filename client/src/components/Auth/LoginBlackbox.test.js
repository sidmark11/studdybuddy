import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from '../../context/AuthContext';
import { auth, googleProvider } from '../../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

jest.mock('../../firebaseConfig', () => ({
    auth: { signOut: jest.fn() },
    googleProvider: {},
    db: {}
}));

jest.mock('firebase/auth', () => ({
    signInWithPopup: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

const renderWithProviders = (ui, { user = null } = {}) => {
    const mockSetUser = jest.fn();
    return render(
        <Router>
            <AuthContext.Provider value={{ setUser: mockSetUser, user }}>
                {ui}
            </AuthContext.Provider>
        </Router>
    );
};

describe('Login Component', () => {
    test('redirects to Google sign-in page when sign-in button is clicked', async () => {
    const mockUser = { email: 'user@usc.edu', uid: '12345', displayName: 'Test User' };
    signInWithPopup.mockResolvedValueOnce({ user: mockUser }); // Mock successful Google sign-in

    renderWithProviders(<Login />);

    const loginButton = screen.getByText('Sign in with USC Google Account');
    fireEvent.click(loginButton);

    await waitFor(() => expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider));
});
});
