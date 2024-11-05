import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    const value = { user, signup, login, logout };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
