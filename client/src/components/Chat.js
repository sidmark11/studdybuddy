import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig"
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar'

export const Chat = () => {
    const [newMessage, setNewMessage] = useState("")
    const messagesRef = collection(db, "messages")

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const room = queryParams.get('room');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newMessage === "") return;

        await addDoc(messagesRef, {
            text: newMessage, 
            createdAt: serverTimestamp(), 
            user: auth.currentUser.displayName,
            room: room
        })
    };
    return (
        <div>
            <Navbar room={room} />
            <div className="chat-app"> 
                <p>You are in {room}</p>
                <form onSubmit={handleSubmit} className="new-message-form">
                    <input 
                        className="new-message-input" 
                        placeholder="Type in a message"
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-button">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;

