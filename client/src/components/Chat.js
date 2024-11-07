import { useState, useEffect, useRef } from "react";
import { where, addDoc, collection, serverTimestamp, query, orderBy, limitToLast, endBefore, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../styles/Chat.css";
import { useAuth } from "../context/AuthContext";

export const Chat = () => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [firstVisible, setFirstVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const messagesRef = collection(db, "messages");

  const location = useLocation();
  const navigate = useNavigate();
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

  const loadUserGroups = async () => {
    if (!user) return;

    const userRef = collection(db, "users");
    const userQuery = query(userRef, where("userID", "==", user.displayName));
    const userDoc = await getDocs(userQuery);

    if (!userDoc.empty) {
      const userData = userDoc.docs[0].data();
      setUserGroups(userData.groupNames || []);
    }
  };

  const enterGroupChat = (groupName) => {
    navigate(`/chat?room=${groupName}`);
  };

  const leaveGroupChat = () => {
    navigate("/chat"); // This will remove the room parameter from the URL
  };

  useEffect(() => {
    if (room) {
      loadMessages();
    } else {
      loadUserGroups();
    }
  }, [room]);

  return (
      <div className="chat-container">
        <Navbar room={room} />
        <div className="chat-header">
          {room ? (
              <>
                <h1>Welcome to {room} Chat</h1>
                <button onClick={leaveGroupChat} className="back-button">
                  Back to Groups
                </button>
              </>
          ) : (
              <h1>Your Groups</h1>
          )}
        </div>

        {room ? (
            <div>
              <div className="messages-window" ref={messagesContainerRef}>
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
        ) : (
            <div className="groups-list">
              {userGroups.length > 0 ? (
                  userGroups.map((group) => (
                      <button
                          key={group}
                          onClick={() => enterGroupChat(group)}
                          className="group-button"
                      >
                        {group}
                      </button>
                  ))
              ) : (
                  <p>You are not part of any groups. Join a group to start chatting!</p>
              )}
            </div>
        )}
      </div>
  );
};

export default Chat;
