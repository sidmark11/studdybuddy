import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { limit, where, collection, query, getDocs } from 'firebase/firestore';
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import '../styles/Members.css';

const Members = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [groupMembers, setGroupMembers] = useState([]);

  const groupRef = collection(db, "groups");
  const room = queryParams.get("room");

  useEffect(() => {
    const fetchGroupNames = async () => {
      try {
        const q = query(groupRef, where("groupID", "==", room), limit(1));
        const queryDoc = await getDocs(q);

        if (!queryDoc.empty) {
          const groupDoc = queryDoc.docs[0];
          setGroupMembers(groupDoc.data().members || []);
        }
      } catch (error) {
        console.error('Error fetching group names:', error);
      }
    };
    fetchGroupNames();
  }, [room]);

  return (
    <div>
        <Navbar room={room} />
        <div className='group-members-background'>
        <div className="group-members-wrapper">
            <div className="group-members-container">
            {groupMembers.map((member, index) => (
                <div className="group-member" key={index}>
                {member}
                </div>
            ))}
            </div>
        </div>
        </div>
    </div>
  );
};

export default Members;
