// client/src/components/CreateEvent.js
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { addDoc, updateDoc, arrayUnion, collection, doc } from 'firebase/firestore';

const CreateEvent = ({ groupID }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        // Reference to the events collection
        const eventsRef = collection(db, 'events');

        // Add a new event document
        const newEventRef = await addDoc(eventsRef, {
            title,
            description,
            date: new Date(date),  // Store date as a timestamp
            groupID,
            location,
            participants: []
        });

        // Add the event ID to the group's calendar
        const groupCalendarRef = doc(db, 'calendars', groupID);
        await updateDoc(groupCalendarRef, {
            events: arrayUnion(newEventRef.id)
        });

        // Reset form fields
        setTitle("");
        setDescription("");
        setDate("");
        setLocation("");
        alert("Event created successfully!");
    };

    return (
        <div>
            <h2>Create a New Event for Group {groupID}</h2>
            <form onSubmit={handleCreateEvent}>
                <div>
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Date</label>
                    <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <button type="submit">Create Event</button>
            </form>
        </div>
    );
};

export default CreateEvent;
