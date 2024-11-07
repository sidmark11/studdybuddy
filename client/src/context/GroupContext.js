import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
    const location = useLocation();
    const [currentGroup, setCurrentGroup] = useState(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const room = searchParams.get('room');
        if (room) {
            setCurrentGroup(room);
        } else {
            setCurrentGroup(null);
        }
    }, [location.search]);

    const updateGroup = (group) => {
        setCurrentGroup(group);
    };

    return (
        <GroupContext.Provider value={{ currentGroup, updateGroup }}>
            {children}
        </GroupContext.Provider>
    );
};

export const useGroup = () => useContext(GroupContext);
