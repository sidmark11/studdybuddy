
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { addDoc, collection, where, query, getDocs } from 'firebase/firestore';
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import axios from 'axios'; // Import axios for backend communication
import '../styles/Resources.css';

const Resources = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const room = queryParams.get("room");

    const [resources, setResources] = useState([]);
    const [googleDriveLink, setGoogleDriveLink] = useState("");
    const [file, setFile] = useState(null);

    const resourcesRef = collection(db, "resources");

    useEffect(() => {
        if (room) {
            loadResources();
        }
    }, [room]);

    const loadResources = async () => {
        const q = query(resourcesRef, where("groupID", "==", room));
        const querySnapshot = await getDocs(q);
        const loadedResources = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResources(loadedResources);
    };

    const handleLinkChange = (e) => setGoogleDriveLink(e.target.value);
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUploadLink = async () => {
        if (googleDriveLink) {
            await addResource(googleDriveLink);
            setGoogleDriveLink("");
            loadResources();
        }
    };

    const addResource = async (driveURL) => {
        await addDoc(resourcesRef, {
            fileName: file ? file.name : "Google Drive Link",
            groupID: room,
            driveURL: driveURL,
            uploadedBy: auth.currentUser.displayName, // assuming you want to track uploader
        });
    };

    const handleAuth = async () => {
        try {
            const response = await axios.get('http://localhost:5000/auth/url');
            window.location.href = response.data.url; // Redirect to Google's authorization page
        } catch (error) {
            console.error("Error fetching auth URL:", error);
        }
    };

    const handleFileUpload = async () => {
        if (!file) return;

        try {
            console.log("Starting file upload process with file:", file.name);

            // Check if the user is authenticated for Google Drive
            const authResponse = await axios.get('http://localhost:5000/auth/url');
            console.log("Auth response received:", authResponse.data);

            if (authResponse.data && authResponse.data.requiresAuth) {
                // Redirect to Google Auth if authentication is required
                console.log("Redirecting to Google Auth URL:", authResponse.data.url);
                window.location.href = authResponse.data.url;
                return;
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            formData.append('mimeType', file.type);

            console.log("User is authenticated. Preparing file for upload.");

            // Attempt to upload file to server
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Received response from server:", response.data);

            // Process server response
            if (response.data.webViewLink) {
                console.log("Saving Google Drive link to resources.");
                await addResource(response.data.webViewLink); // Add link to Firestore or database
                loadResources();
                setFile(null);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div>
            <Navbar room={room} />
            <div className='resources-container'>
                <h2>Resources for {room}</h2>
                {room && (
                    <div className="upload-section">
                        <input
                            type="text"
                            placeholder="Google Drive URL"
                            value={googleDriveLink}
                            onChange={handleLinkChange}
                        />
                        <button onClick={handleUploadLink}>Add Link</button>
                        <input type="file" onChange={handleFileChange} />
                        <button onClick={handleFileUpload}>Upload to Google Drive</button>
                    </div>
                )}
                <div className="resources-list">
                    {resources.map((resource) => (
                        <div key={resource.id} className="resource-item">
                            <a href={resource.driveURL} target="_blank" rel="noopener noreferrer">
                                {resource.fileName}
                            </a>
                            <p>Uploaded by: {resource.uploadedBy}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Resources;
