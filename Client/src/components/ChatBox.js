import React, { useEffect, useState } from 'react';
import './ChatBox.css';

const ChatBox = ({ loggedInEmail }) => {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  const fetchMessages = async () => {
    if (!receiverEmail) return;
    try {
      const res = await fetch(`http://localhost:5000/messages?user1=${loggedInEmail}&user2=${receiverEmail}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !receiverEmail) return;
    try {
      await fetch('http://localhost:5000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_email: loggedInEmail,
          receiver_email: receiverEmail,
          message: newMsg.trim(),
        }),
      });
      setNewMsg('');
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [receiverEmail]);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <h3>Chat Box</h3>
        <input
          type="email"
          placeholder="Enter receiver email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
          className="receiver-input"
        />

        <div className="messages-box">
          {messages.length === 0 ? (
            <p>No messages</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender_email === loggedInEmail ? 'sent' : 'received'}`}
              >
                {msg.message}
              </div>
            ))
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;