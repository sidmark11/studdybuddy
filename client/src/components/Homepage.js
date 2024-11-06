// client/src/components/Homepage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebaseConfig'; // Make sure db is your Firestore instance
import { limit, where, addDoc, collection, updateDoc, arrayUnion, query, getDocs} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
    const { user } = useAuth();
    const userRef = collection(db, "users");
    const [room, setRoom] = useState("");
    const [groupNames, setGroupNames] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setRoom(e.target.value);
        e.preventDefault();
        if (room === "") return;
        const q = query(userRef, where("userID", "==", auth.currentUser.displayName), limit(1));
        const queryDoc = await getDocs(q);

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

    // New function to handle navigation to the calendar page
    const goToCalendar = () => {
        navigate('/calendar');
    };


    return (
        <div>
            <h2>Welcome to StudyBuddy, {auth.currentUser.displayName}!</h2>
            <p>Please select or type in a group that you would like to view.</p>
            {groupNames.length > 0 ? (
                <div>
                    <div>
                        <label htmlFor="groupSelect">Select a Pre-Existing Group:</label>
                        <select
                            id="groupSelect"
                            onChange={handleRoomChange}
                        >
                            <option value="" disabled>Select a group</option>
                            {groupNames.map((groupName, index) => (
                                <option key={index} value={groupName}>
                                    {groupName}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleSubmit}>Join Group</button>
                    </div>
                    <div>
                        <label htmlFor="groupSelect">Enter a new/different group:</label>
                        <form>
                            <input
                                type="text"
                                className="new-message-input"
                                onChange={handleRoomChange}
                                placeholder="Type in a group name"
                            />
                            <button onClick={handleSubmit}>Join Group</button>
                        </form>
                    </div>
                </div>
            ) : (
                <div>
                    <p>You are not part of any study group yet.</p>
                    <p>Enter a preexisting group to join or one you want to create!</p>
                    <form>
                        <input
                            type="text"
                            className="new-message-input"
                            onChange={handleRoomChange}
                            placeholder="Type in a group name"
                        />
                        <button onClick={handleSubmit}>Join Group</button>
                    </form>
                </div>
            )}
            {/* New Calendar Button */}
            <div style={{ marginTop: '20px' }}>
                <button onClick={goToCalendar}>Calendar</button>
            </div>
        </div>
    );
};


export default Homepage;
