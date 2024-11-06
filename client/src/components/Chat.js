import { useState, useEffect, useRef } from "react";
import { where, addDoc, collection, serverTimestamp, query, orderBy, limitToLast, endBefore, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import "../styles/Chat.css"; 

export const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [firstVisible, setFirstVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesRef = collection(db, "messages");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const room = queryParams.get("room");

  const messagesContainerRef = useRef(null);
  const messageEndRef = useRef(null);

  const loadMessages = async () => {
    const q = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt", "asc"),
      limitToLast(20)
    );

    const querySnapshot = await getDocs(q);
    const loadedMessages = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    setMessages(loadedMessages);

    if (querySnapshot.docs.length > 0) {
      setFirstVisible(querySnapshot.docs[0]);
    } else {
      setFirstVisible(null);
    }
  };

  const loadMoreMessages = async () => {
    if (loading || !firstVisible) return;
    setLoading(true);

    const q = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt", "asc"),
      endBefore(firstVisible),
      limitToLast(20)
    );

    const querySnapshot = await getDocs(q);
    const moreMessages = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    setMessages((prevMessages) => [...moreMessages, ...prevMessages]);

    if (querySnapshot.docs.length > 0) {
      setFirstVisible(querySnapshot.docs[0]);
    } else {
      setFirstVisible(null); 
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;

    const newDocRef = await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      room: room,
    });

    // Manually append the new message to the state
    const newDocSnapshot = await getDocs(
      query(messagesRef, where("__name__", "==", newDocRef.id))
    );

    const newMessageData = {
      ...newDocSnapshot.docs[0].data(),
      id: newDocRef.id,
    };

    setMessages((prevMessages) => [...prevMessages, newMessageData]);
    setNewMessage("");
  };

  useEffect(() => {
    loadMessages();
  }, [room]);

  return (
    <div className="chat-container">
      <Navbar room={room} />
      <div className="chat-header">
        <h1>Welcome to {room}</h1>
      </div>

      <div
        className="messages-window"
        ref={messagesContainerRef}
      >
        {firstVisible && (
          <button
            onClick={loadMoreMessages}
            disabled={loading}
            className="load-more-button"
          >
            {loading ? "Loading..." : "Load More Messages"}
          </button>
        )}
        {messages.map((message) => (
          <div className="message" key={message.id}>
            <span className="user">{message.user}:</span>
            <span className="text">{message.text}</span>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>

      <div className="chat-input">
        <form onSubmit={handleSubmit} className="new-message-form">
          <input
            className="new-message-input"
            placeholder="Type a message..."
            onChange={(e) => setNewMessage(e.target.value)}
            value={newMessage}
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
