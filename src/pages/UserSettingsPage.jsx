import React, { useState, useEffect } from 'react';
import api from '@api'; // Ensure this is your API import path
import './UserSettingsPage.css';
import { useAuth } from '../context/AuthContext'; // Use your AuthContext

function UserSettingsPage() {
 const { user } = useAuth(); // Get user from context
 const [username, setUsername] = useState('');
 const [email, setEmail] = useState('');
 const [oldPassword, setOldPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [isEditMode, setIsEditMode] = useState(false);
 const [theme, setTheme] = useState(null); // Default or load from user


 // Fetch user details when the component loads (only if user exists)
 useEffect(() => {
  if (user?.id) { // Ensure user is not null or undefined
   const fetchUserDetails = async () => {
    try {
     const response = await api.get(`/api/users/${user.id}`, { withCredentials: true });
     setUsername(response.data.user.username);
     setTheme(response.data.user.theme );
     setEmail(response.data.user.email);
    } catch (err) {
     setError('Failed to fetch user details');
    }
   };

   fetchUserDetails();
  }
 }, [user?.id]); // Re-fetch if user ID changes

 // Handle form submit for updating user details
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');

  const updatedUserData = {
   username: username || user.username,
   email: email ? email : null,
   oldPassword: oldPassword || null, // If no old password, send null
   newPassword: newPassword ? newPassword: null,
   theme: theme ? theme : 'light',
  };

  try {
   const response = await api.put(`/api/users/${user.id}`, updatedUserData, {
    withCredentials: true,
   });

   setMessage('User updated successfully');
   setUsername(response.data.user.username); // Update username
   setEmail(response.data.user.email); // Update email
   setIsEditMode(false); // Exit edit mode
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to update user');
  }
 };

 // Handle edit mode toggle
 const handleEditClick = () => {
  setIsEditMode(!isEditMode); // Toggle edit mode when button is clicked
  if(!isEditMode) {
   setOldPassword('');
   setNewPassword('');
  }
 };

 if (!user) {
  return <div>Loading...</div>; // Optionally show a loading message if user data isn't ready yet
 }

 return (
  <div className="user-settings-container">
   <h2>User Settings</h2>

   {error && <div style={{ color: 'red' }}>{error}</div>}
   {message && <div style={{ color: 'green' }}>{message}</div>}

   <form onSubmit={handleSubmit}>
    <div>
     <label htmlFor="username">Username: </label>
     {isEditMode ? (
      <input
       type="text"
       id="username"
       value={username || ''}
       onChange={(e) => setUsername(e.target.value)}
      />
     ) : (
      <span>{username}</span>
     )}
    </div>

    <div>
     <label htmlFor="email">Email: </label>
     {isEditMode ? (
      <input
       type="email"
       id="email"
       value={email || ''}
       onChange={(e) => setEmail(e.target.value)}
      />

     ) : (
      <span>{email}</span>
     )}
    </div>

    {isEditMode && (
     <>
      <div>
       <label htmlFor="oldPassword">Old Password</label>
       <input
        type="password"
        id="oldPassword"
        value={oldPassword || ''} // Make sure the value is empty if no old password
        onChange={(e) => setOldPassword(e.target.value)}
        placeholder="Enter old password (if applicable)"
       />
      </div>

      <div>
       <label htmlFor="newPassword">New Password</label>
       <input
        type="password"
        id="newPassword"
        value={newPassword || ''} // Make sure the value is empty
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
       />
      </div>

      <div>
       <label htmlFor="theme">Theme: </label>
       {isEditMode ? (
        <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
         <option value="light">Light</option>
         <option value="dark">Dark</option>
        </select>
       ) : (
        <span>{theme}</span>
       )}
      </div>
     </>
    )}


    {/* Button inside the form to submit */}
    {isEditMode && (
     <div>
      <button type="submit">Save Changes</button>
     </div>
    )}
   </form>

   {/* Button to toggle edit mode */}
   {!isEditMode && (
    <button onClick={handleEditClick}>Edit Settings</button>
   )}

   {/* Cancel Edit button to exit edit mode */}
   {isEditMode && (
    <button type="button" onClick={() => setIsEditMode(false)}>Cancel Edit</button>
   )}

  </div>
 );
}

export default UserSettingsPage;
