// client/src/App.js
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Homepage from './components/Homepage';
import Chat from './components/Chat';
import { useAuth } from './context/AuthContext';

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute component={Home} />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/chat" element={<Chat />} />
        </Routes>
    );
}

const Home = () => {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Welcome to StudyBuddy</h1>
            {user ? (
                <div>
                    <p>Welcome, {user.email}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <p>Please <a href="/login">login</a> to access your account.</p>
            )}
        </div>
    );
};

// ProtectedRoute Component
const ProtectedRoute = ({ component: Component }) => {
    const { user } = useAuth();

    return user ? <Component /> : <Navigate to="/login" />;
};

export default App;