import React, { useState, useEffect } from 'react';
import api from '@api';
import './UserSettingsPage.css';
import { useAuth } from '../context/AuthContext';

function UserSettingsPage() {
 const { user} = useAuth();
 const [username, setUsername] = useState('');
 const [email, setEmail] = useState('');
 const [oldPassword, setOldPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [isEditMode, setIsEditMode] = useState(false);
 const [theme, setTheme] = useState('');

 useEffect(() => {
  if (user?.id) {
   const fetchUserDetails = async () => {
    try {
     const res = await api.get(`/api/users/${user.id}`, { withCredentials: true });
     setUsername(res.data.user.username);
     setEmail(res.data.user.email);
     setTheme(res.data.user.theme);
    } catch (err) {
     setError('Failed to fetch user details');
    }
   };
   fetchUserDetails();
  }
 }, [user?.id]);


 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');

  const updatedUserData = {
   username: username || user.username,
   email: email || null,
   oldPassword: oldPassword || null,
   newPassword: newPassword || null,
   theme: theme ?? 'light',
  };
console.log(user.id)
  try {
   const res = await api.put(`/api/users/${user.id}`, updatedUserData, {
    withCredentials: true,
   });

   setMessage('User updated successfully');
   setUsername(res.data.user.username);
   setEmail(res.data.user.email);
   setTheme(res.data.user.theme)
   setIsEditMode(false);
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to update user');
  }
 };

 const handleEditClick = () => {
  setIsEditMode(!isEditMode);
  if (!isEditMode) {
   setOldPassword('');
   setNewPassword('');
  }
 };

 if (!user) return <div>Loading...</div>;

 return (
  <div className="user-settings-container">
   <h2>User Settings</h2>
   <div className="user-settings-circle">{user.username}</div>

   {!isEditMode && (
    <button className="user-settings-button" onClick={handleEditClick}>
     Edit Settings
    </button>
   )}

   {error && <div style={{ color: 'red' }}>{error}</div>}
   {message && <div style={{ color: 'green' }}>{message}</div>}

   {isEditMode && (
    <form className="user-settings-form" onSubmit={handleSubmit}>
     <div className="user-settings-field">
      <label htmlFor="username">Username:</label>
      <input
       type="text"
       id="username"
       value={username}
       onChange={(e) => setUsername(e.target.value)}
      />
     </div>

     <div className="user-settings-field">
      <label htmlFor="email">Email:</label>
      <input
       type="email"
       id="email"
       value={email}
       onChange={(e) => setEmail(e.target.value)}
      />
     </div>

     <div className="user-settings-field">
      <label htmlFor="oldPassword">Old Password</label>
      <input
       type="password"
       id="oldPassword"
       value={oldPassword}
       onChange={(e) => setOldPassword(e.target.value)}
       placeholder="Enter old password (if applicable)"
      />
     </div>

     <div className="user-settings-field">
      <label htmlFor="newPassword">New Password</label>
      <input
       type="password"
       id="newPassword"
       value={newPassword}
       onChange={(e) => setNewPassword(e.target.value)}
       placeholder="Enter new password"
      />
     </div>

     <div className="user-settings-field">
      <label htmlFor="theme">Theme:</label>
      <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
       <option value="light">Light</option>
       <option value="dark">Dark</option>
      </select>
     </div>

     <div className="user-settings-actions">
      <button className='user-settings-button' type="submit">Save Changes</button>
      <button className='user-settings-button' type="button" onClick={() => setIsEditMode(false)}>Cancel Edit</button>
     </div>
    </form>
   )}
  </div>

 );
}

export default UserSettingsPage;
