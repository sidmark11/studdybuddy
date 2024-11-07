import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { GroupProvider } from './context/GroupContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <GroupProvider>
                    <App />
                </GroupProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
