import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { sendMessage, subscribeToMessages } from "../../../firebase/chatService";
import { generateRoomId } from "../../../utils/generateRoom";
import { timeAgo } from "../../../utils/timeAgo";
import { getUser } from "../../utils/helpers";

const ChatRoom = ({ senderId, receiverId, room }) => {
    const user = getUser()
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [participants, setParticipants] = useState([]);
    const flatListRef = useRef(null);

    const userId = senderId || user?._id;
    const receiverKeyId = receiverId;
    const roomId = room?.id || generateRoomId(userId, receiverKeyId);
    console.log(senderId, 'Logs')
    useEffect(() => {
        const fetchChatParticipants = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/chat-users`, {
                    params: { ids: `${userId},${receiverKeyId}` },
                });
                console.log(response, 'Logs Response')
                setParticipants(response.data);
            } catch (error) {
                console.error("Failed to fetch chat users:", error);
            }
        };
        fetchChatParticipants();
    }, [userId]);

    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = subscribeToMessages(roomId, (msgs) => {
            console.log("Fetched messages:", msgs);
            const sorted = [...msgs].sort(
                (a, b) => a.timestamp?.toMillis?.() - b.timestamp?.toMillis?.()
            );
            setMessages(sorted);
        });

        return () => unsubscribe();
    }, [roomId]);


    const handleSend = async () => {
        if (!inputText.trim()) return;
        try {
            await sendMessage(roomId, userId, receiverId, inputText.trim());
            setInputText("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const receiver = participants.find((p) => p._id === receiverId);

    useEffect(() => {
        flatListRef.current?.scrollTo(0, flatListRef.current.scrollHeight);
    }, [messages]);

    return (
        <div style={styles.container}>
            {receiver && (
                <div style={styles.header}>
                    <img src={receiver.avatar?.url} alt="avatar" style={styles.headerAvatar} />
                    <span style={styles.headerName}>{receiver.name}</span>
                </div>
            )}

            <div style={styles.messagesContainer} ref={flatListRef}>
                {messages.map((item) => {
                    const isSender = item.senderId === userId;
                    const sender = participants.find((p) => p._id === item.senderId);
                    const avatarUrl = sender?.avatar?.url || "https://via.placeholder.com/40";
                    const senderName = sender?.name || "Unknown";

                    return (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                flexDirection: isSender ? "row-reverse" : "row",
                                alignItems: "flex-end",
                                margin: "8px 0",
                                maxWidth: "70%",
                                alignSelf: isSender ? "flex-end" : "flex-start",
                                textAlign: isSender ? "right" : "left",
                            }}
                        >
                            <img src={avatarUrl} alt="avatar" style={styles.chatAvatar} />
                            <div style={
                                {
                                    backgroundColor: isSender ? "#dcf8c6" : "#fff",
                                    borderRadius: 10,
                                    padding: 10,
                                    minWidth: 60,
                                    maxWidth: 300,
                                    wordBreak: "break-word",
                                }
                            }>
                                <div style={styles.senderName}>{senderName}</div>
                                <div>{item.text}</div>
                                <div style={styles.timestamp}>
                                    {item.timestamp ? timeAgo(item.timestamp.toDate()) : ""}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleSend} style={styles.sendButton}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatRoom;

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#e8f5e9",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        alignItems: "center",
        padding: "10px 15px",
        backgroundColor: "#1f2d1e",
        color: "#fff",
    },
    headerAvatar: {
        width: 35,
        height: 35,
        borderRadius: "50%",
        marginRight: 10,
    },
    headerName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
    },
    chatAvatar: {
        width: 35,
        height: 35,
        borderRadius: "50%",
        margin: "0 10px",
        backgroundColor: "#fff",
        border: "2px solid #fff",
    },
    messageBubble: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
    },
    senderName: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 10,
        color: "#888",
        marginTop: 5,
        textAlign: "right",
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        padding: "10px",
        borderTop: "1px solid #ccc",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        padding: "10px",
        borderRadius: 25,
        border: "1px solid #ccc",
        marginRight: 10,
        outline: "none",
    },
    sendButton: {
        backgroundColor: "#4CAF50",
        border: "none",
        padding: "10px 16px",
        color: "#fff",
        borderRadius: 25,
        cursor: "pointer",
    },
};
