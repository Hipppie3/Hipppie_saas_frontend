import React, { useState } from 'react';
import axios from 'axios';

function CreateLeague({ onLeagueCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCreateLeague = async (e) => {
    e.preventDefault(); // ✅ Prevent full page reload on form submit

    if (!name) {
      setError('League name is required');
      return;
    }

    try {
      await axios.post(
        '/api/leagues',
        { name }, // ✅ Send name in request body
        { withCredentials: true } // ✅ Ensure cookies (session auth)
      );

      setError(''); // ✅ Clear errors on success
      setName(''); // ✅ Reset input field

      onLeagueCreated(); // ✅ Trigger refresh in HomeDashboard
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating league');
      console.error('Error creating league:', error);
    }
  };

  return (
    <div>
      <h3>Create Your League</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleCreateLeague}> {/* ✅ Wrap inside a form */}
        <input
          type="text"
          placeholder="League Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Create League</button> {/* ✅ Use type="submit" */}
      </form>
    </div>
  );
}

export default CreateLeague;
