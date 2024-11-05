import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDc6k4qbaudVVfjE6j_C60rNVFhf4gfp2s',
  authDomain: 'studdybuddy-a1cdf.firebaseapp.com',
  projectId: 'studdybuddy-a1cdf',
  storageBucket: 'studdybuddy-a1cdf.firebasestorage.app',
  messagingSenderId: '389963669454',
  appId: '1:389963669454:web:75a46ee371b9c8911bd59f',
  measurementId: 'G-MCLJLEYJDC'
};

// Initialize Firebase and services
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp); // Initialize Firebase Auth

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the StudyBuddy server!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Connected to Firestore:', db);
});

export { db, auth }; // Export db and auth for use in other files if needed
