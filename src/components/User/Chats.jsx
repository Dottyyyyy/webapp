import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase/firebaseConfig'; // Ensure correct path
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/helpers';

const Chats = ({ onSelectChat }) => {
    const user = getUser();
    const userId = user?._id;
    const [rooms, setRooms] = useState([]);
    const [participantsInfo, setParticipantsInfo] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('participants', 'array-contains', userId));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const roomsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setRooms(roomsData);

            const info = {};
            await Promise.all(
                roomsData.map(async (room) => {
                    const otherUserId = room.participants.find((id) => id !== userId);
                    if (!participantsInfo[otherUserId]) {
                        try {
                            const { data } = await axios.get(`${import.meta.env.VITE_API}/get-user/${otherUserId}`);
                            info[otherUserId] = data.user;
                        } catch (err) {
                            // silently fail
                        }
                    }
                })
            );

            setParticipantsInfo((prev) => ({ ...prev, ...info }));
        });

        return () => unsubscribe();
    }, [userId]);

    // const handleOpenChat = (room) => {
    //     const receiverId = room.participants.find((id) => id !== userId);
    //     navigate(`/chatroom/${userId}/${receiverId}`);
    // };

    const handleOpenChat = (room) => {
        const receiverId = room.participants.find((id) => id !== userId);
        if (onSelectChat) {
            onSelectChat(room, receiverId);
        }
    };


    return (
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <div style={styles.headerContent}>
                    <span style={styles.headerText}>💬Chat Heads</span>
                </div>
            </div>

            <div style={styles.chatListContainer}>
                {rooms.length === 0 ? (
                    <p>No chat rooms found.</p>
                ) : (
                    rooms.map((room) => {
                        const receiverId = room.participants.find((id) => id !== userId);
                        const receiver = participantsInfo[receiverId];

                        return (
                            <div
                                key={room.id}
                                style={styles.roomItem}
                                onClick={() => handleOpenChat(room)}
                            >
                                <img
                                    src={receiver?.avatar?.url || 'https://via.placeholder.com/56'}
                                    alt="avatar"
                                    style={styles.avatar}
                                />
                                <div style={styles.content}>
                                    <div style={styles.headerRow}>
                                        <span style={styles.name}>{receiver?.name || 'Unknown User'}</span>
                                    </div>
                                    <div style={styles.headerRow}>
                                        <span style={styles.role}>Role: {receiver?.role || 'Unknown'}</span>
                                        <span style={styles.role}>Stall: {receiver?.stall?.stallNumber || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Chats;

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
    },
    headerContainer: {
        backgroundColor: '#2A4535',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        color: '#fff',
        fontSize: 24,
    },
    headerText: {
        color: '#fff',
        fontSize: 20,
        marginLeft: 10,
    },
    chatListContainer: {
        padding: 10,
        backgroundColor: '#E9FFF3',
        flex: 1,
    },
    roomItem: {
        display: 'flex',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#2A4535',
        borderRadius: 20,
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        marginRight: 12,
        backgroundColor: '#ccc',
        objectFit: 'cover',
    },
    content: {
        flex: 1,
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 17,
        fontWeight: 600,
        color: 'white',
    },
    role: {
        color: '#4CAF50',
        fontSize: 14,
    },
};