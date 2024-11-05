import express from "express";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDc6k4qbaudVVfjE6j_C60rNVFhf4gfp2s",
  authDomain: "studdybuddy-a1cdf.firebaseapp.com",
  projectId: "studdybuddy-a1cdf",
  storageBucket: "studdybuddy-a1cdf.firebasestorage.app",
  messagingSenderId: "389963669454",
  appId: "1:389963669454:web:75a46ee371b9c8911bd59f",
  measurementId: "G-MCLJLEYJDC"
};

const db = getFirestore(initializeApp(firebaseConfig));

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});

app.listen(port, () => {
  console.log(db)
  console.log(`Server is running on port ${port}`);
});