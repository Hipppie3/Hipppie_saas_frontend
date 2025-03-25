import { useEffect, useState } from "react";
import api from '@api';
import '../Season/SeasonList.css';
import { useNavigate } from "react-router-dom";

function AllGames() {
 const [games, setGames] = useState([]);
 const [leagues, setLeagues] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [gameForm, setGameForm] = useState({ leagueId: null, date: '', location: '' });
 const [selectedGame, setSelectedGame] = useState(null);
 const navigate = useNavigate();

 useEffect(() => {
  const fetchGames = async () => {
   const res = await api.get('/api/games', { withCredentials: true });
   setGames(res.data.games);
  };
  fetchGames();
 }, []);

 useEffect(() => {
  const fetchLeagues = async () => {
   const res = await api.get('/api/leagues', { withCredentials: true });
   setLeagues(res.data.leagues);
  };
  fetchLeagues();
 }, []);

 const handleCreateGame = async (e) => {
  e.preventDefault();
  const res = await api.post('/api/games', gameForm, { withCredentials: true });
  setGames(prev => [...prev, res.data.game]);
  setShowForm(false);
  setGameForm({ leagueId: null, date: '', location: '' });
 };

 const handleUpdateGame = async (e) => {
  e.preventDefault();
  await api.put(`/api/games/${selectedGame.id}`, selectedGame, { withCredentials: true });
  const res = await api.get('/api/games', { withCredentials: true });
  setGames(res.data.games);
  setShowEditModal(false);
 };

 const handleDeleteGame = async (id) => {
  if (!window.confirm("Delete this game?")) return;
  await api.delete(`/api/games/${id}`, { withCredentials: true });
  setGames(prev => prev.filter(g => g.id !== id));
 };

 return (
  <div className="seasonList-container">
   {showForm && (
    <div className="modal">
     <div className="modal-content">
      <h2>New Game</h2>
      <form onSubmit={handleCreateGame}>
       <input
        type="date"
        value={gameForm.date}
        onChange={(e) => setGameForm({ ...gameForm, date: e.target.value })}
       />
       <input
        type="text"
        placeholder="Location"
        value={gameForm.location}
        onChange={(e) => setGameForm({ ...gameForm, location: e.target.value })}
       />
       <select
        value={gameForm.leagueId || ''}
        onChange={(e) => setGameForm({ ...gameForm, leagueId: Number(e.target.value) || null })}
       >
        <option value="">No League</option>
        {leagues.map(l => (
         <option key={l.id} value={l.id}>{l.name}</option>
        ))}
       </select>
       <div className="modal-update-cancel-button">
        <button type="submit">Create</button>
        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
       </div>
      </form>
     </div>
    </div>
   )}

   {showEditModal && selectedGame && (
    <div className="modal">
     <div className="modal-content">
      <h2>Edit Game</h2>
      <form onSubmit={handleUpdateGame}>
       <input
        type="date"
        value={selectedGame.date}
        onChange={(e) => setSelectedGame({ ...selectedGame, date: e.target.value })}
       />
       <input
        type="text"
        placeholder="Location"
        value={selectedGame.location}
        onChange={(e) => setSelectedGame({ ...selectedGame, location: e.target.value })}
       />
       <select
        value={selectedGame.leagueId || ''}
        onChange={(e) => setSelectedGame({ ...selectedGame, leagueId: Number(e.target.value) || null })}
       >
        <option value="">No League</option>
        {leagues.map(l => (
         <option key={l.id} value={l.id}>{l.name}</option>
        ))}
       </select>
       <div className="modal-update-cancel-button">
        <button type="submit">Update</button>
        <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
       </div>
      </form>
     </div>
    </div>
   )}

   <div className="season-card-container">
    <div className="season-card add-season-card" onClick={() => setShowForm(true)}>
     <div className="add-season-content">
      <span className="add-icon">＋</span>
      <p>Add Game</p>
     </div>
    </div>

    {games.map(game => (
     <div key={game.id} className="season-card" onClick={() => navigate(`/games/${game.id}`)}>
      <h3>{new Date(game.date).toLocaleDateString()}</h3>
      <p>Location: {game.location}</p>
      <p>League: {game.leagueName || "N/A"}</p>
      <button
       onClick={(e) => {
        e.stopPropagation();
        setSelectedGame(game);
        setShowEditModal(true);
       }}
      >Edit</button>
      <button
       onClick={(e) => {
        e.stopPropagation();
        handleDeleteGame(game.id);
       }}
      >Delete</button>
     </div>
    ))}
   </div>
  </div>
 );
}

export default AllGames;
