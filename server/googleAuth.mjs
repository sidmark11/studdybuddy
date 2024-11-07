// server/googleAuth.mjs

import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];

// Initialize the OAuth2 client with credentials from .env
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Function to generate the Google authorization URL
export const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
};

// Function to exchange authorization code for tokens
export const getTokens = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
};

// Set credentials for authenticated requests
export const authenticate = async (tokens) => {
    if (tokens) {
        oauth2Client.setCredentials(tokens);
    } else {
        throw new Error("No tokens provided. Redirect user to authenticate.");
    }
    return oauth2Client;
};
export { oauth2Client };
