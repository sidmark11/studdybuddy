import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthContext } from './context/AuthContext';

jest.mock('./components/Auth/Login', () => () => <div>Login Page</div>);
jest.mock('./components/Homepage', () => () => <div>Homepage</div>);
jest.mock('./components/Chat', () => () => <div>Chat Page</div>);
jest.mock('./components/Members', () => () => <div>Members Page</div>);
jest.mock('./components/Calendar', () => () => <div>Calendar Page</div>);
jest.mock('./components/Resources', () => () => <div>Resources Page</div>);

const renderWithProviders = (ui, { user = null } = {}) => {
    return render(
        <Router>
            <AuthContext.Provider value={{ user, logout: jest.fn() }}>
                {ui}
            </AuthContext.Provider>
        </Router>
    );
};

describe('App Component', () => {
    test('renders the login page when user is not authenticated and accessing protected routes', () => {
        renderWithProviders(<App />, { user: null });
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
});
