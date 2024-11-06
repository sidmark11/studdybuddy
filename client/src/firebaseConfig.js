// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAtVsv5kLFDD5ziqvweg0HZfSCGciujxFI",
    authDomain: "studdybuddy-44574.firebaseapp.com",
    projectId: "studdybuddy-44574",
    storageBucket: "studdybuddy-44574.firebasestorage.app",
    messagingSenderId: "624425483332",
    appId: "1:624425483332:web:593ac7b8700db1122f9011"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
