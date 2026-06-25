import React, { useEffect, useState } from 'react';
import './Profile.css';

// Inline Chat component
const Chat = ({ friendEmail, friendUsername, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const userEmail = localStorage.getItem('email');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/messages/${userEmail}/${friendEmail}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [friendEmail, userEmail]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      await fetch('http://localhost:5000/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: userEmail,
          receiverEmail: friendEmail,
          message: newMsg
        }),
      });
      setNewMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ border: "1px solid gray", padding: "10px", marginTop: "20px" }}>
      <h3>Chat with {friendUsername}</h3>
      <div style={{
        height: "200px", overflowY: "scroll", border: "1px solid #ccc",
        marginBottom: "10px", padding: "5px"
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.sender_email === userEmail ? "right" : "left",
            margin: "5px 0"
          }}>
            <span style={{
              background: msg.sender_email === userEmail ? "#daf1da" : "#f1f1f1",
              padding: "5px 10px", borderRadius: "8px"
            }}>
              {msg.message}
            </span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        placeholder="Type a message..."
        style={{ width: "80%", padding: "5px" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: "10px" }}>Send</button>
      <button onClick={onClose} style={{ marginLeft: "10px" }}>Close</button>
    </div>
  );
};

export default function Profile() {
  const email = localStorage.getItem('email');
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [chatWith, setChatWith] = useState(null);
  const [search, setSearch] = useState("");

  const loadData = () => {
    fetch(`http://localhost:5000/profile/${email}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        if (!editMode) setEditData(data); // only update when NOT editing
      })
      .catch(console.error);

    fetch(`http://localhost:5000/friend-suggestions/${email}`)
      .then(res => res.json())
      .then(setSuggestions)
      .catch(console.error);

    fetch(`http://localhost:5000/connections/requests/${email}`)
      .then(res => res.json())
      .then(setRequests)
      .catch(console.error);

    fetch(`http://localhost:5000/connections/friends/${email}`)
      .then(res => res.json())
      .then(setFriends)
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [email, editMode]);

  const searchSuggestions = async () => {
    if (!search.trim()) {
      loadData();
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/friend-suggestions/${email}/search?skill=${search}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendFriendRequest = async (friendEmail) => {
    try {
      const res = await fetch('http://localhost:5000/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email, friendEmail }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert('Error sending friend request');
    }
  };

  const respondToRequest = async (senderEmail, action) => {
    try {
      const res = await fetch('http://localhost:5000/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email,
          friendEmail: senderEmail,
          action,
        }),
      });
      const data = await res.json();
      alert(data.message);
      loadData();
    } catch (error) {
      console.error(error);
      alert('Error responding to request');
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/profile/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      alert(data.message || "Profile updated");
      setEditMode(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {editMode ? (
          <div>
            <input type="text" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} />
            <input type="text" value={editData.skills} onChange={(e) => setEditData({ ...editData, skills: e.target.value })} />
            <input type="text" value={editData.college} onChange={(e) => setEditData({ ...editData, college: e.target.value })} />
            <input type="text" value={editData.pin} onChange={(e) => setEditData({ ...editData, pin: e.target.value })} />
            <div>
              <button onClick={saveProfile}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Skills:</strong> {profile.skills}</p>
            <p><strong>College:</strong> {profile.college}</p>
            <p><strong>PIN:</strong> {profile.pin}</p>
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          </div>
        )}
      </div>

      {/* Friend Suggestions with Search */}
      <div>
        <div className="section-title">Friend Suggestions</div>
        <input
          type="text"
          placeholder="Search by skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <button onClick={searchSuggestions}>Search</button>
        <button onClick={() => { setSearch(""); loadData(); }} style={{ marginLeft: "5px" }}>
          Clear
        </button>

        {suggestions.length > 0 ? (
          suggestions.map((s) => (
            <div key={s.email} className="friend-card">
              <span><strong>{s.username}</strong> ({s.email}) - {s.skills}</span>
              <button className="btn" onClick={() => sendFriendRequest(s.email)}>
                Send Request
              </button>
            </div>
          ))
        ) : (
          <p>No suggestions found.</p>
        )}
      </div>

      {/* Pending Friend Requests */}
      <div>
        <div className="section-title">Pending Friend Requests</div>
        {requests.length > 0 ? (
          requests.map((r) => (
            <div key={r.email} className="friend-card">
              <span><strong>{r.username}</strong> ({r.email})</span>
              <span>
                <button className="btn" onClick={() => respondToRequest(r.email, 'accept')}>
                  Accept
                </button>
                <button className="btn btn-secondary" style={{ marginLeft: '5px' }} onClick={() => respondToRequest(r.email, 'reject')}>
                  Reject
                </button>
              </span>
            </div>
          ))
        ) : (
          <p>No pending requests.</p>
        )}
      </div>

      {/* My Friends */}
      <div>
        <div className="section-title">My Friends</div>
        {friends.length > 0 ? (
          friends.map((f) => (
            <div key={f.email} className="friend-card">
              <span><strong>{f.username}</strong> ({f.email})</span>
              <button className="btn btn-chat" onClick={() => setChatWith(f)}>
                Chat
              </button>
            </div>
          ))
        ) : (
          <p>No friends yet.</p>
        )}
      </div>

      {chatWith && (
        <Chat
          friendEmail={chatWith.email}
          friendUsername={chatWith.username}
          onClose={() => setChatWith(null)}
        />
      )}
    </div>
  );
}
