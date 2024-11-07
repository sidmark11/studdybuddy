// server/server.mjs

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {authenticate, getAuthUrl, getTokens, oauth2Client} from './googleAuth.mjs';
import { google } from 'googleapis';
import multer from 'multer';
import { uploadFileToDrive, downloadFileFromDrive } from './driveService.mjs';

dotenv.config();

const upload = multer({ dest: 'uploads/' }); // Temp directory for uploads

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// Route to get Google authentication URL
app.get('/auth/url', (req, res) => {
    const url = getAuthUrl();
    res.send({ url });
});

// Route to handle Google OAuth2 callback and store tokens
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const tokens = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        // Store tokens if necessary and redirect to client
        res.redirect('http://localhost:3000/resources'); // Redirect back to your client
    } catch (error) {
        console.error("Failed to exchange code for tokens:", error);
        res.status(500).send("Authentication failed.");
    }
});

// Route to upload a file to Google Drive
app.post('/upload', async (req, res, next) => {
    console.log('Incoming POST request to /upload');

    try {
        // Check if user is authenticated for Google Drive
        await authenticate();
        next();
    } catch (error) {
        if (error.message.includes("No tokens provided")) {
            console.log("Redirecting user to Google Auth URL for authentication.");
            const authUrl = getAuthUrl();
            return res.status(401).send({ url: authUrl, requiresAuth: true });
        }
        console.error("Authentication error:", error);
        return res.status(500).send('Failed to authenticate.');
    }
}, upload.single('file'), async (req, res) => {
    console.log('Received file upload request.');

    if (!req.file) {
        console.error('No file received in the request');
        return res.status(400).send('No file received.');
    }

    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        console.log(`File received: ${fileName} at path: ${filePath}`);

        // Upload to Google Drive
        const driveResponse = await uploadFileToDrive(filePath, fileName);

        console.log(`File uploaded to Google Drive. WebViewLink: ${driveResponse.webViewLink}`);

        res.status(200).send(driveResponse);
    } catch (error) {
        console.error('File upload failed:', error);
        res.status(500).send('Failed to upload file.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
