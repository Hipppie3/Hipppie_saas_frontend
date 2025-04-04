import React, { useState } from 'react';
import api from '@api';
import './TeamList.css'

function TeamList({ teams, refreshTeams }) {
 const [editingTeamId, setEditingTeamId] = useState(null);
 const [newUnavailable, setNewUnavailable] = useState('');

 const handleUpdateUnavailable = async (teamId) => {
  try {
   await api.put(`/api/teams/${teamId}`, {
    unavailableSlots: newUnavailable.split(',').map(s => s.trim()),
   }, { withCredentials: true });
   setEditingTeamId(null);
   setNewUnavailable('');
   refreshTeams();
  } catch (err) {
   console.error('Error updating unavailable slots:', err);
  }
 };

 if (!teams.length) return <p>No teams found.</p>;

 return (
  <div className="team-list">
   <h3>Teams in this League</h3>
   <div className="team-columns">
    <ul>
     {teams.filter((_, i) => i % 2 === 0).map((team) => (
      <li key={team.id}>
       <strong>{team.name}</strong>
       <div>
        {editingTeamId === team.id ? (
         <>
          <input
           type="text"
           value={newUnavailable}
           onChange={(e) => setNewUnavailable(e.target.value)}
           placeholder="e.g., 18:00, 19:00"
          />
          <button onClick={() => handleUpdateUnavailable(team.id)}>Save</button>
          <button onClick={() => setEditingTeamId(null)}>Cancel</button>
         </>
        ) : (
         <>
          <small style={{ marginLeft: '10px', color: '#555' }}>
           Unavailable: {team.unavailableSlots?.join(', ') || 'None'}
          </small>
          <button style={{ marginLeft: '10px' }} onClick={() => {
           setEditingTeamId(team.id);
           setNewUnavailable(team.unavailableSlots?.join(', ') || '');
          }}>
           Edit
          </button>
         </>
        )}
       </div>
      </li>
     ))}
    </ul>
    <ul>
     {teams.filter((_, i) => i % 2 === 1).map((team) => (
      <li key={team.id}>
       <strong>{team.name}</strong>
       <div>
        {editingTeamId === team.id ? (
         <>
          <input
           type="text"
           value={newUnavailable}
           onChange={(e) => setNewUnavailable(e.target.value)}
           placeholder="e.g., 18:00, 19:00"
          />
          <button onClick={() => handleUpdateUnavailable(team.id)}>Save</button>
          <button onClick={() => setEditingTeamId(null)}>Cancel</button>
         </>
        ) : (
         <>
          <small style={{ marginLeft: '10px', color: '#555' }}>
           Unavailable: {team.unavailableSlots?.join(', ') || 'None'}
          </small>
          <button style={{ marginLeft: '10px' }} onClick={() => {
           setEditingTeamId(team.id);
           setNewUnavailable(team.unavailableSlots?.join(', ') || '');
          }}>
           Edit
          </button>
         </>
        )}
       </div>
      </li>
     ))}
    </ul>
   </div>
  </div>

 );
}

export default TeamList;
