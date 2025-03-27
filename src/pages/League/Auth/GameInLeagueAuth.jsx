// 👇 all imports remain the same
import api from '@api';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { format } from 'date-fns';
import './GameInLeagueAuth.css'

function GameInLeagueAuth({ leagueId }) {
 const { user } = useAuth();
 const [games, setGames] = useState([]);
 const [teams, setTeams] = useState([]);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedGames, setSelectedGames] = useState([]);
 const [message, setMessage] = useState('');
 const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
 const [selectedGame, setSelectedGame] = useState(null);

 const [gameForm, setGameForm] = useState({
  team1_id: '',
  team2_id: '',
  date: '',
  location: '',
  time: '',
  status: 'scheduled',
 });

 const [scoreForm, setScoreForm] = useState({
  score_team1: '',
  score_team2: ''
 });

 useEffect(() => {
  const fetchData = async () => {
   if (!leagueId) return;
   const res = await api.get(`/api/leagues/${leagueId}`, { withCredentials: true });
   setGames(res.data.league.games || []);
   setTeams(res.data.league.teams || []);
  };
  fetchData();
 }, [leagueId]);

 const handleCreateGame = async (e) => {
  e.preventDefault();
  if (gameForm.team1_id === gameForm.team2_id) {
   return alert('Teams must be different.');
  }

  const dateInPST = new Date(gameForm.date + "T00:00:00-08:00").toISOString();

  try {
   const res = await api.post('/api/games', {
    ...gameForm,
    leagueId,
    userId: user.id,
    date: dateInPST,
   }, { withCredentials: true });

   const homeTeam = teams.find(team => team.id === Number(res.data.game?.team1_id));
   const awayTeam = teams.find(team => team.id === Number(res.data.game?.team2_id));
    const response = await api.get(`/api/leagues/${leagueId}`, { withCredentials: true });
    setGames(response.data.league?.games || []);
    setTeams(response.data.league?.teams || []);


   setGameForm({
    team1_id: '',
    team2_id: '',
    date: '',
    location: '',
    time: '',
    status: 'scheduled',
   });
   setIsModalOpen(false);
  } catch (error) {
   console.log('Error creating game:', error);
  }
 };

 const handleGameForm = (e) => {
  const { name, value } = e.target;
  setGameForm(prev => ({ ...prev, [name]: value }));
 };

 const handleDeleteGames = async () => {
  if (!selectedGames.length) return alert("Please select at least one game to delete.");
  if (!window.confirm("Are you sure you want to delete the selected games?")) return;

  try {
   await Promise.all(selectedGames.map(id => api.delete(`/api/games/${id}`, { withCredentials: true })));
   setGames(prev => prev.filter(game => !selectedGames.includes(game.id)));
   setSelectedGames([]);
   setMessage("Games deleted successfully");
   setTimeout(() => setMessage(""), 3000);
  } catch (error) {
   console.error("Error deleting games:", error);
  }
 };

 const handleCheckboxChange = (id) => {
  setSelectedGames(prev =>
   prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
 };

 const handleSelectAll = () => {
  setSelectedGames(prev =>
   prev.length === games.length ? [] : games.map(g => g.id)
  );
 };

 const openScoreModal = (game) => {
  setSelectedGame(game);
  setScoreForm({
   score_team1: game.score_team1 || '',
   score_team2: game.score_team2 || ''
  });
  setIsScoreModalOpen(true);
 };

 const handleScoreChange = (e) => {
  const { name, value } = e.target;
  setScoreForm(prev => ({ ...prev, [name]: value }));
 };

 const handleUpdateScore = async (e) => {
  e.preventDefault();
  if (!selectedGame) return;

  try {
   const res = await api.put(`/api/games/${selectedGame.id}/scores`, scoreForm, { withCredentials: true });
   setGames(prev =>
    prev.map(game => (game.id === selectedGame.id ? { ...game, ...res.data } : game))
   );
   setMessage("Score updated successfully");
   setTimeout(() => setMessage(""), 3000);
   setIsScoreModalOpen(false);
  } catch (error) {
   console.error("Error updating score:", error);
  }
 };

 const getTeamNameById = (id) => {
  const team = teams.find(team => team.id === id);
  return team ? team.name : 'Unknown Team';
 };

 const formatTime = (time) => {
  if (!time) return "TBD";
  try {
   const [hours, minutes] = time.split(":");
   const date = new Date();
   date.setHours(hours);
   date.setMinutes(minutes);
   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
   return "Invalid";
  }
 };



 return (
  <div className="game-in-league-auth-container">
   <div className="league-game-auth-btn-container">
    <button className="delete-league-game-auth-btn" onClick={handleDeleteGames}>🗑️</button>
    <button className="add-league-game-auth-btn" onClick={() => setIsModalOpen(true)}>+ Add Game</button>
   </div>

   {isModalOpen && (
    <div className="game-schedule-modal-overlay">
     <div className="game-schedule-modal-content">
      <h3>Create Game</h3>
      <form onSubmit={handleCreateGame}>
       <label>
        Home Team
        <select name="team1_id" value={gameForm.team1_id} onChange={handleGameForm} required>
         <option value="">Select a team</option>
         {teams.map(team => (
          <option key={team.id} value={team.id}>{team.name}</option>
         ))}
        </select>
       </label>

       <label>
        Away Team
        <select name="team2_id" value={gameForm.team2_id} onChange={handleGameForm} required>
         <option value="">Select a team</option>
         {teams.map(team => (
          <option key={team.id} value={team.id}>{team.name}</option>
         ))}
        </select>
       </label>

       <label>Date
        <input type="date" name="date" value={gameForm.date} onChange={handleGameForm} />
       </label>
       <label>Location
        <input type="text" name="location" value={gameForm.location} onChange={handleGameForm} />
       </label>
       <label>Time
        <input type="time" name="time" value={gameForm.time} onChange={handleGameForm} />
       </label>

       <button type="submit">Create</button>
       <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
      </form>
     </div>
    </div>
   )}

   <div className="game-schedule-container">
    {message && <p className="message">{message}</p>}

    <table className="game-schedule-table">
     <thead>
      <tr>
       <th><input type="checkbox" checked={selectedGames.length === games.length} onChange={handleSelectAll} /></th>
       <th>ID</th>
       <th>Date</th>
       <th>Matchup</th>
       <th>Location</th>
       <th>Time</th>
       <th>Status</th>
       <th>Results</th>
      </tr>
     </thead>
     <tbody>
      {games.length === 0 ? (
       <tr><td colSpan="8"></td></tr>
      ) : (
       [...games]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((game, index) => (
         <tr key={game.id}>
          <td>
           <input
            type="checkbox"
            checked={selectedGames.includes(game.id)}
            onChange={() => handleCheckboxChange(game.id)}
           />
          </td>
          <td>{index + 1}</td>
          <td>{game.date ? format(new Date(game.date), 'MMMM d, yyyy') : 'TBD'}</td>
          <td>
           <NavLink to={`/games/${game.id}`}>
            {getTeamNameById(game.team1_id)} vs {getTeamNameById(game.team2_id)}
           </NavLink>
          </td>
          <td>{game.location}</td>
          <td>{formatTime(game.time)}</td>
          <td>{game.status?.charAt(0).toUpperCase() + game.status?.slice(1)}</td>
          <td>{game.score_team1 ?? 0} - {game.score_team2 ?? 0}</td>
         </tr>
        ))
      )}
     </tbody>
    </table>

    {isScoreModalOpen && selectedGame && (
     <div className="game-schedule-modal-overlay">
      <div className="game-schedule-modal-content">
       <h3>Update Score</h3>
       <form onSubmit={handleUpdateScore}>
        <label>
         {getTeamNameById(selectedGame.team1_id)}
         <input type="number" name="score_team1" value={scoreForm.score_team1} onChange={handleScoreChange} required />
        </label>
        <label>
         {getTeamNameById(selectedGame.team2_id)}
         <input type="number" name="score_team2" value={scoreForm.score_team2} onChange={handleScoreChange} required />
        </label>
        <button type="submit">Update</button>
        <button type="button" onClick={() => setIsScoreModalOpen(false)}>Cancel</button>
       </form>
      </div>
     </div>
    )}
   </div>
  </div>
 );
}

export default GameInLeagueAuth;
