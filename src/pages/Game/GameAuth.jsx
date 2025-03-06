import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './GameAuth.css';

function GameAuth() {
 const [game, setGame] = useState(null);
 const [loading, setLoading] = useState(true);
 const [editMode, setEditMode] = useState(false); // Toggle between view and edit mode
 const [statValues, setStatValues] = useState({}); // Store input values
 const { id } = useParams();

 useEffect(() => {
  const fetchGame = async () => {
   try {
    const response = await axios.get(`/api/games/${id}`);
    setGame(response.data);
    initializeStatValues(response.data);
   } catch (error) {
    console.error('Error fetching game:', error);
   }
   setLoading(false);
  };
  fetchGame();
 }, [id]);


 // Initialize stat values from existing player stats
 const initializeStatValues = (data) => {
  if (!data || !data.playerStats) return;
  const values = {};
  data.playerStats.forEach((stat) => {
   values[`${stat.player_id}-${stat.stat_id}`] = stat.value;
  });
  setStatValues(values);
 };

 // Handle stat input change
 const handleInputChange = (player_id, stat_id, value) => {
  setStatValues((prev) => ({
   ...prev,
   [`${player_id}-${stat_id}`]: value,
  }));
 };

 // Submit updated stats
 const handleSubmit = async () => {
  if (!game || !game.game || !game.game.id) {
   console.error("Error: game_id is missing");
   alert("Game ID is missing. Cannot update stats.");
   return;
  }
  const statsToUpdate = [];
  Object.keys(statValues).forEach((key) => {
   const [player_id, stat_id] = key.split('-').map(Number);
   if (!stat_id) {
   }
   statsToUpdate.push({
    player_id,
    game_id: game.game.id,
    stat_id,
    value: statValues[key] || 0, // ✅ Ensure value is a number
   });
  });
  try {
   const response = await axios.put('/api/playerGameStats', {
    player_id: statsToUpdate[0]?.player_id,
    game_id: game.game.id,
    stats: statsToUpdate,
   });
   alert('Stats updated successfully!');
   setEditMode(false);
  } catch (error) {
   console.error('❌ Error updating stats:', error.response?.data || error);
   alert('Failed to update stats.');
  }
 };



 if (loading) return <p>Loading game details...</p>;
 if (!game) return <p>Game not found.</p>;

 return (
  <div className="game-container">
   {/* Toggle Button */}
   <button className="toggle-button" onClick={() => setEditMode(!editMode)}>
    {editMode ? 'Cancel Edit' : 'Edit Stats'}
   </button>

   {/* Home Team */}
   <div className="team-container">
    <h3 className="team-header">Home Team: {game.game.homeTeam?.name}</h3>
    {!editMode ? (
     <ul className="player-list">
      {game.game.homeTeam?.players.map((player) => (
       <li key={player.id}>
        {player.firstName} -
        {game.stats.map((stat) => (
         <span key={stat.id} className="stat-value">
          {stat.shortName}: {statValues[`${player.id}-${stat.id}`] || 0}
         </span>
        ))}
       </li>
      ))}
     </ul>
    ) : (
     <table className="stat-table">
      <thead>
       <tr>
        <th className="player-column">Player</th>
        {game.stats.map((stat) => (
         <th key={stat.id} className="stat-column">{stat.shortName}</th>
        ))}
       </tr>
      </thead>
      <tbody>
       {game.game.homeTeam?.players.map((player) => (
        <tr key={player.id}>
         <td className="player-name">{player.firstName}</td>
         {game.stats.map((stat) => (
          <td key={stat.id}>
           <input
            type="number"
            className="stat-input"
            value={statValues[`${player.id}-${stat.id}`] ?? ""}
            onChange={(e) => handleInputChange(player.id, stat.id, parseInt(e.target.value) || 0)}
           />
          </td>
         ))}
        </tr>
       ))}
        {/* Total Row */}
        <tr className="total-row">
         <td className="player-name"><strong>Total</strong></td>
         {game.stats.map((stat) => {
          const total = game.game.homeTeam?.players.reduce((sum, player) => {
           return sum + (statValues[`${player.id}-${stat.id}`] || 0);
          }, 0);
          return <td key={stat.id}><strong>{total}</strong></td>;
         })}
        </tr>

      </tbody>
     </table>
    )}
   </div>

   {/* Away Team */}
   <div className="team-container">
    <h3 className="team-header">Away Team: {game.game.awayTeam?.name}</h3>
    {!editMode ? (
     <ul className="player-list">
      {game.game.awayTeam?.players.map((player) => (
       <li key={player.id}>
        {player.firstName} -
        {game.stats.map((stat) => (
         <span key={stat.id} className="stat-value">
          {stat.shortName}: {statValues[`${player.id}-${stat.id}`] || 0}
         </span>
        ))}
       </li>
      ))}
     </ul>
    ) : (
     <table className="stat-table">
      <thead>
       <tr>
        <th className="player-column">Player</th>
        {game.stats.map((stat) => (
         <th key={stat.id} className="stat-column">{stat.shortName}</th>
        ))}
       </tr>
      </thead>
      <tbody>
       {game.game.awayTeam?.players.map((player) => (
        <tr key={player.id}>
         <td className="player-name">{player.firstName}</td>
         {game.stats.map((stat) => (
          <td key={stat.id}>
           <input
            type="number"
            className="stat-input"
            value={statValues[`${player.id}-${stat.id}`] ?? ""}
            onChange={(e) => handleInputChange(player.id, stat.id, parseInt(e.target.value) || 0)}
           />
          </td>
         ))}
        </tr>
       ))}
        {/* Total Row */}
        <tr className="total-row">
         <td className="player-name"><strong>Total</strong></td>
         {game.stats.map((stat) => {
          const total = game.game.homeTeam?.players.reduce((sum, player) => {
           return sum + (statValues[`${player.id}-${stat.id}`] || 0);
          }, 0);
          return <td key={stat.id}><strong>{total}</strong></td>;
         })}
        </tr>

      </tbody>
     </table>
    )}
   </div>

   {/* Submit Button */}
   {editMode && (
    <button className="submit-button" onClick={handleSubmit}>
     Save Stats
    </button>
   )}
  </div>
 );
}

export default GameAuth;
