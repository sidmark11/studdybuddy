// client/src/components/Auth/Login.js
import React from 'react';
import { auth, googleProvider } from '../../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { setUser } = useAuth();  // Assuming setUser is exposed by AuthContext
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            // Attempt Google login
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if the user's email ends with '@usc.edu'
            if (user.email.endsWith('@usc.edu')) {
                console.log("Login successful:", user);
                setUser(user);  // Update the context state with the logged-in user
                
                // Redirect to the homepage after successful login
                navigate('/homepage');  // Navigate to the homepage
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
        <div>
            <h2>Login</h2>
            <button onClick={handleGoogleLogin}>Sign in with USC Google Account</button>
        </div>
    );
};

export default Login;
