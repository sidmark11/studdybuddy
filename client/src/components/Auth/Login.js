// client/src/components/Auth/Login.js
import React from 'react';
import { auth, googleProvider } from '../../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "../../styles/Login.css"
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const Login = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    // Function to initialize the user's calendar in Firestore
    const initializeUserCalendar = async (user) => {
        const userCalendarRef = doc(db, 'calendars', user.uid);  // Use the user's uid as the document ID

        // Check if the calendar already exists
        const calendarSnap = await getDoc(userCalendarRef);
        if (!calendarSnap.exists()) {
            // Create a new calendar document for the user
            await setDoc(userCalendarRef, {
                isGroupOwned: false,
                ownerID: user.displayName || user.uid,  // Use displayName if available, otherwise uid
                events: []  // Initialize an empty events array
            });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // Attempt Google login
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if the user's email ends with '@usc.edu'
            if (user.email.endsWith('@usc.edu')) {
                setUser(user);  // Update the context state with the logged-in user

                // Initialize the user's calendar in Firestore
                await initializeUserCalendar(user);

                // Redirect to the homepage after successful login
                navigate('/homepage');
            } else {
                // Sign the user out if they don't have a USC email
                await auth.signOut();
                alert("Please use your USC email to sign in.");
            }
        } catch (error) {
            console.error("Error during Google sign-in:", error.message);
            alert("Failed to log in. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Welcome to StudyBuddy</h2>
            <p className="login-title">
                Please sign in with your USC Google Account to continue.
            </p>
            <button onClick={handleGoogleLogin} className="login-button">
                Sign in with USC Google Account
            </button>
        </div>
    );
};

export default Login;
