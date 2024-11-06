// client/src/components/Homepage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebaseConfig'; // Make sure db is your Firestore instance
import { limit, where, addDoc, collection, updateDoc, arrayUnion, query, getDocs} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import "../styles/Homepage.css"

const Homepage = () => {
    const { user } = useAuth();
    const userRef = collection(db, "users");
    const groupRef = collection(db, "groups");
    const [room, setRoom] = useState("");
    const [groupNames, setGroupNames] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setRoom(e.target.value);
        e.preventDefault();
        if (room === "") return;
        let q = query(userRef, where("userID", "==", auth.currentUser.displayName), limit(1));
        let queryDoc = await getDocs(q);

        if (!queryDoc.empty) {
            const userDoc = queryDoc.docs[0];
            const reference = userDoc.ref;
            await updateDoc(reference, {
                groupNames: arrayUnion(room), // Adds newGroupName to the array if it doesn't already exist
            });
        } else {
            await addDoc(userRef, {
                userID: auth.currentUser.displayName,
                groupNames: [room]
            })
        }

        q = query(groupRef, where("groupID", "==", room), limit(1));
        queryDoc = await getDocs(q);

        if (!queryDoc.empty) {
            const groupDoc = queryDoc.docs[0];
            const reference = groupDoc.ref;
            await updateDoc(reference, {
                members: arrayUnion(auth.currentUser.displayName), // Adds newGroupName to the array if it doesn't already exist
            });
        } else {
            await addDoc(groupRef, {
                groupID: room,
                members: [auth.currentUser.displayName]
            })
        }

        navigate(`/chat?room=${room}`);

    }

    useEffect(() => {
        const fetchGroupNames = async () => {
            try {
                const q = query(userRef, where("userID", "==", auth.currentUser.displayName), limit(1));
                const queryDoc = await getDocs(q);

                if (!queryDoc.empty) {
                    const userDoc = queryDoc.docs[0];
                    setGroupNames(userDoc.data().groupNames || []);
                }
            } catch (error) {
                console.error('Error fetching group names:', error);
            }
        };
        fetchGroupNames();
    }, []);

     const handleRoomChange = (event) => {
        setRoom(event.target.value); // Update the input value when user types
    };

    return (
        <div>
            <Navbar room={room} />
            <div className="homepage-container">
            <h2 className="homepage-welcome">
                Welcome to StudyBuddy, {auth.currentUser.displayName}!
            </h2>
            <h2 className="homepage-welcome">
                Please select or type in a group that you would like to view.
            </h2>
            {groupNames.length > 0 ? (
                <div className="homepage-groups">
                <div className="homepage-existing-group">
                    <label htmlFor="groupSelect" className="group-label">
                    Select a Pre-Existing Group:
                    </label>
                    <select
                    id="groupSelect"
                    onChange={handleRoomChange}
                    className="group-select"
                    >
                    <option value="" disabled>
                        Select a group
                    </option>
                    {groupNames.map((groupName, index) => (
                        <option key={index} value={groupName}>
                        {groupName}
                        </option>
                    ))}
                    </select>
                    <button onClick={handleSubmit} className="join-button">
                    Join Group
                    </button>
                </div>
                <div className="homepage-new-group">
                    <label htmlFor="groupInput" className="group-label">
                    Enter a new/different group:
                    </label>
                    <form className="new-group-form">
                    <input
                        type="text"
                        id="groupInput"
                        className="new-group-input"
                        onChange={handleRoomChange}
                        placeholder="Type in a group name"
                    />
                    <button onClick={handleSubmit} className="join-button">
                        Join Group
                    </button>
                    </form>
                </div>
                </div>
            ) : (
                <div className="homepage-no-groups">
                <p>You are not part of any study group yet.</p>
                <p>Enter a preexisting group to join or one you want to create!</p>
                <form className="new-group-form">
                    <input
                    type="text"
                    className="new-group-input"
                    onChange={handleRoomChange}
                    placeholder="Type in a group name"
                    />
                    <button onClick={handleSubmit} className="join-button">
                    Join Group
                    </button>
                </form>
                </div>
            )}
            </div>
        </div>
        
  );
};

export default Homepage;