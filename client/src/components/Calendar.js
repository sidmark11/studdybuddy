import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import '../styles/Calendar.css';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
    const { user } = useAuth();
    const { currentGroup } = useGroup();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [showAddSessionForm, setShowAddSessionForm] = useState(false);
    const [newSession, setNewSession] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        time: ''
    });
    const eventsRef = collection(db, "events");

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());

    useEffect(() => {
        if (selectedDate && user) {
            loadEvents(selectedDate);
        }
    }, [selectedDate, currentGroup, user]);

    useEffect(() => {
        // When Calendar loads, if there is a current group, add it to the URL
        if (currentGroup) {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set('room', currentGroup);
            navigate(`?${searchParams.toString()}`, { replace: true });
        }
    }, [currentGroup, navigate]);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const loadEvents = async (date) => {
        if (!user || !user.displayName) {
            console.log("No user is logged in or user information is incomplete");
            return;
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const startTimestamp = Timestamp.fromDate(startOfDay);
        const endTimestamp = Timestamp.fromDate(endOfDay);

        let eventsQuery;

        if (currentGroup) {
            eventsQuery = query(
                eventsRef,
                where("groupID", "==", currentGroup),
                where("date", ">=", startTimestamp),
                where("date", "<=", endTimestamp)
            );
        } else {
            const userRef = collection(db, "users");
            const userQuery = query(userRef, where("userID", "==", user.displayName));
            const userDoc = await getDocs(userQuery);

            if (userDoc.empty) {
                console.log("No user document found for:", user.displayName);
                return;
            }

            const userData = userDoc.docs[0].data();
            const userGroups = userData.groupNames || [];

            eventsQuery = query(
                eventsRef,
                where("groupID", "in", userGroups),
                where("date", ">=", startTimestamp),
                where("date", "<=", endTimestamp)
            );
        }

        const querySnapshot = await getDocs(eventsQuery);

        const loadedEvents = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter(event =>
                currentGroup || (event.participants && event.participants.includes(user.displayName))
            );

        setEvents(loadedEvents);
    };

    const handleDayClick = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
    };

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < startOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="empty-day" />);
        }
        for (let i = 1; i <= totalDays; i++) {
            days.push(
                <div key={`day-${i}`} className="calendar-day" onClick={() => handleDayClick(i)}>
                    {i}
                </div>
            );
        }
        return days;
    };

    const formatTime = (timestamp) => {
        if (timestamp instanceof Timestamp) {
            const date = timestamp.toDate();
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return '';
    };

    const handleAddStudySession = async (e) => {
        e.preventDefault();
        if (!newSession.date || !newSession.time || !currentGroup || !user) return;

        const [year, month, day] = newSession.date.split('-');
        const [hours, minutes] = newSession.time.split(':');
        const dateWithTime = new Date(year, month - 1, day, hours, minutes);
        const sessionTimestamp = Timestamp.fromDate(dateWithTime);

        const newEvent = {
            title: newSession.title,
            description: newSession.description,
            location: newSession.location,
            date: sessionTimestamp,
            groupID: currentGroup,
            participants: [user.displayName]
        };

        try {
            await addDoc(eventsRef, newEvent);
            console.log("Study session added successfully");
            setShowAddSessionForm(false);
            setNewSession({ title: '', description: '', location: '', date: '', time: '' });
            loadEvents(selectedDate);
        } catch (error) {
            console.error("Error adding study session:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={goToPreviousMonth} className="month-nav-button">&lt;</button>
                    <h2>
                        {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={goToNextMonth} className="month-nav-button">&gt;</button>
                </div>
                <div className="calendar-days">
                    <div className="calendar-weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                            <div key={index} className="weekday">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="calendar-grid">{renderDays()}</div>
                </div>

                {currentGroup && (
                    <button onClick={() => setShowAddSessionForm(!showAddSessionForm)} className="add-session-button">
                        Add Study Session
                    </button>
                )}

                {showAddSessionForm && (
                    <form onSubmit={handleAddStudySession} className="add-session-form">
                        <h3>Add a Study Session</h3>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newSession.title}
                            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newSession.description}
                            onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={newSession.location}
                            onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                        />
                        <input
                            type="date"
                            value={newSession.date}
                            onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                        />
                        <input
                            type="time"
                            value={newSession.time}
                            onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                        />
                        <button type="submit">Save Session</button>
                    </form>
                )}

                {selectedDate && (
                    <div className="timetable">
                        <h3>Events for {selectedDate.toDateString()}</h3>
                        {events.length > 0 ? (
                            <ul>
                                {events.map((event) => (
                                    <li key={event.id}>
                                        <strong>{event.title}</strong><br />
                                        <span>{formatTime(event.date)}</span><br />
                                        <span>Description: {event.description}</span><br />
                                        <span>Location: {event.location}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No events for this day.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
