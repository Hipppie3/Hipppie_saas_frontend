import { useEffect, useState } from "react";
import api from '@api';
import '../Season/SeasonList.css';
import { useNavigate } from "react-router-dom";
import DefaultImage from '../../images/default_image.png'


function AllPlayers() {
 const [players, setPlayers] = useState([]);
 const [teams, setTeams] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [playerForm, setPlayerForm] = useState({ firstName: '', lastName: '', teamId: null , image: null });
 const [selectedPlayer, setSelectedPlayer] = useState(null);
 const [selectedImage, setSelectedImage] = useState(null);

 const navigate = useNavigate();

 useEffect(() => {
  const fetchPlayers = async () => {
   const res = await api.get('/api/players', { withCredentials: true });
   setPlayers(res.data.players);
  };
  fetchPlayers();
 }, []);

 useEffect(() => {
  const fetchTeams = async () => {
   const res = await api.get('/api/teams', { withCredentials: true });
   setTeams(res.data.teams);
  };
  fetchTeams();
 }, []);

 const handleCreatePlayer = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('firstName', playerForm.firstName);
  formData.append('lastName', playerForm.lastName);
  if (playerForm.teamId) formData.append('teamId', playerForm.teamId);
  if (playerForm.image) formData.append('image', playerForm.image);

  const res = await api.post('/api/players', formData, {
   withCredentials: true,
   headers: { 'Content-Type': 'multipart/form-data' },
  });

  const newPlayer = res.data.player;
  const playerTeam = teams.find(t => t.id === newPlayer.teamId);
  setPlayers(prev => [...prev, { ...newPlayer, team: playerTeam || null }]);

  setShowForm(false);
  setPlayerForm({ firstName: '', lastName: '', teamId: null, image: null });
 };



 const handleUpdatePlayer = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('firstName', selectedPlayer.firstName);
  formData.append('lastName', selectedPlayer.lastName);
  if (selectedPlayer.teamId) formData.append('teamId', selectedPlayer.teamId);
  if (selectedImage) formData.append('image', selectedImage);

  const res = await api.put(`/api/players/${selectedPlayer.id}`, formData, {
   withCredentials: true,
   headers: { 'Content-Type': 'multipart/form-data' },
  });

  const updated = await api.get('/api/players', { withCredentials: true });
  setPlayers(updated.data.players);
  setShowEditModal(false);
  setSelectedImage(null);
 };


 const handleDeletePlayer = async (id) => {
  if (!window.confirm("Delete this player?")) return;
  await api.delete(`/api/players/${id}`, { withCredentials: true });
  setPlayers(prev => prev.filter(p => p.id !== id));
 };

 console.log(players)
 return (
  <div className="seasonList-container">
   {showForm && (
    <div className="modal">
     <div className="modal-content">
      <h2>New Player</h2>
      <form onSubmit={handleCreatePlayer}>
       <input
        type="text"
        placeholder="First Name"
        value={playerForm.firstName}
        onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })}
       />
       <input
        type="text"
        placeholder="Last Name"
        value={playerForm.lastName}
        onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })}
       />
       <select
        value={playerForm.teamId || ''}
        onChange={(e) => setPlayerForm({ ...playerForm, teamId: Number(e.target.value) || null })}
       >
        <option value="">No Team</option>
        {teams.map(team => (
         <option key={team.id} value={team.id}>{team.name}</option>
        ))}
       </select>
       <input
        type="file"
        accept="image/*"
        onChange={(e) => setPlayerForm({ ...playerForm, image: e.target.files[0] })}
       />
       <div className="modal-update-cancel-button">
        <button type="submit">Create</button>
        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
       </div>
      </form>
     </div>
    </div>
   )}

   {showEditModal && selectedPlayer && (
    <div className="modal">
     <div className="modal-content">
      <h2>Edit Player</h2>
      <form onSubmit={handleUpdatePlayer}>
       <input
        type="text"
        placeholder="First Name"
        value={selectedPlayer.firstName}
        onChange={(e) => setSelectedPlayer({ ...selectedPlayer, firstName: e.target.value })}
       />
       <input
        type="text"
        placeholder="Last Name"
        value={selectedPlayer.lastName}
        onChange={(e) => setSelectedPlayer({ ...selectedPlayer, lastName: e.target.value })}
       />
       <select
        value={selectedPlayer.teamId || ''}
        onChange={(e) => setSelectedPlayer({ ...selectedPlayer, teamId: Number(e.target.value) || null })}
       >
        <option value="">No Team</option>
        {teams.map(team => (
         <option key={team.id} value={team.id}>{team.name}</option>
        ))}
       </select>
       <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files[0])}
       />
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
      <p>Add Player</p>
     </div>
    </div>

    {players.map(player => (
     <div key={player.id} className="season-card" onClick={() => navigate(`/players/${player.id}`)}>
      <h3>{player.firstName} {player.lastName}</h3>
      <p>Team: {player.team?.name || "Unassigned"}</p>
      <div style={{ margin: '8px 0' }}>
       <img
        src={player.image || DefaultImage}
        alt={`${player.firstName} ${player.lastName}`}
        style={{
         width: '60px',
         height: '60px',
         borderRadius: '50%',
         objectFit: 'cover',
         border: '1px solid #ccc'
        }}
       />
      </div>
      <button
       onClick={(e) => {
        e.stopPropagation();
        setSelectedPlayer({ ...player }); // clone it!
        setShowEditModal(true);
       }}
      >Edit</button>
      <button
       onClick={(e) => {
        e.stopPropagation();
        handleDeletePlayer(player.id);
       }}
      >Delete</button>
     </div>
    ))}
   </div>
  </div>
 );
}

export default AllPlayers;
