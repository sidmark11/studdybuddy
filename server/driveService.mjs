import { google } from 'googleapis';
import fs from 'fs';
import { authenticate } from './googleAuth.mjs';

// Google Drive API setup
const drive = google.drive({ version: 'v3' });

// Upload file to Google Drive
export const uploadFileToDrive = async (filePath, fileName, folderId) => {
    try {
        const authClient = await authenticate();
        google.options({ auth: authClient });

        const fileMetadata = {
            name: fileName,
            parents: folderId ? [folderId] : [],
        };
        const media = {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(filePath),
        };

        // Upload the file
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        // Set file permissions to make it publicly accessible
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return {
            id: response.data.id,
            webViewLink: response.data.webViewLink,
            webContentLink: response.data.webContentLink,
        };
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw new Error('Failed to upload to Google Drive');
    }
};

// Download file from Google Drive
export const downloadFileFromDrive = async (fileId, destPath) => {
    try {
        const authClient = await authenticate();
        google.options({ auth: authClient });

        const dest = fs.createWriteStream(destPath);
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        response.data
            .on('end', () => console.log('File downloaded successfully'))
            .on('error', (error) => console.error('Error downloading file:', error))
            .pipe(dest);
    } catch (error) {
        console.error('Error downloading file from Google Drive:', error);
        throw new Error('Failed to download file from Google Drive');
    }
};

// List files in Google Drive
export const listFilesInDrive = async (folderId = null) => {
    try {
        const authClient = await authenticate();
        google.options({ auth: authClient });

        const response = await drive.files.list({
            q: folderId ? `'${folderId}' in parents` : '',
            fields: 'files(id, name, webViewLink)',
        });

        return response.data.files;
    } catch (error) {
        console.error('Error listing files in Google Drive:', error);
        throw new Error('Failed to list files in Google Drive');
    }
};

// Delete file from Google Drive
export const deleteFileFromDrive = async (fileId) => {
    try {
        const authClient = await authenticate();
        google.options({ auth: authClient });

        await drive.files.delete({ fileId });
        console.log(`File with ID ${fileId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting file from Google Drive:', error);
        throw new Error('Failed to delete file from Google Drive');
    }
};
