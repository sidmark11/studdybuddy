import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function App() {
  const { user } = useAuth();

  return (
      <AuthProvider>
        <div className="App">
          {user ? <HomePage /> : <LoginPage />}
        </div>
      </AuthProvider>
  );
}

export default App;
