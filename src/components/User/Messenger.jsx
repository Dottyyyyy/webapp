import React, { useState } from 'react';
import Chats from './Chats';
import ChatRoom from './ChatRoom';
import { getUser } from '../../utils/helpers';

const MessengerLayout = () => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [receiverId, setReceiverId] = useState(null);
    const user = getUser;

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <Chats onSelectChat={(room, receiver) => {
                    setSelectedRoom(room);
                    setReceiverId(receiver);
                }} />
            </div>
            <div style={styles.chatroom}>
                {selectedRoom ? (
                    <ChatRoom room={selectedRoom} senderId={user?._id} receiverId={receiverId} />
                ) : (
                    <div style={styles.placeholder}>Select a conversation to start messaging</div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
    },
    sidebar: {
        width: '30%',
        borderRight: '1px solid #ccc',
        overflowY: 'auto',
    },
    chatroom: {
        width: '70%',
        display: 'flex',
        flexDirection: 'column',
    },
    placeholder: {
        margin: 'auto',
        color: '#999',
        fontSize: 18,
    },
};

export default MessengerLayout;
