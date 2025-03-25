import { useEffect, useState } from "react";
import api from '@api';
import '../AllSeason/SeasonList.css';
import { useNavigate, useParams } from "react-router-dom";
import DefaultImage from '../../images/default_image.png';

function SingleTeam() {
 const { id: teamId } = useParams();
 const [team, setTeam] = useState(null);
 const [showForm, setShowForm] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [playerForm, setPlayerForm] = useState({ firstName: '', lastName: '', image: null });
 const [selectedPlayer, setSelectedPlayer] = useState(null);
 const [selectedImage, setSelectedImage] = useState(null);
 const navigate = useNavigate();

 const fetchTeam = async () => {
  const res = await api.get(`/api/teams/${teamId}`, { withCredentials: true });
  setTeam(res.data.team);
 };

 useEffect(() => {
  fetchTeam();
 }, [teamId]);

 const handleCreatePlayer = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('firstName', playerForm.firstName);
  formData.append('lastName', playerForm.lastName);
  formData.append('teamId', teamId);
  if (playerForm.image) formData.append('image', playerForm.image);

  await api.post('/api/players', formData, {
   withCredentials: true,
   headers: { 'Content-Type': 'multipart/form-data' },
  });

  await fetchTeam();
  setShowForm(false);
  setPlayerForm({ firstName: '', lastName: '', image: null });
 };

 const handleUpdatePlayer = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('firstName', selectedPlayer.firstName);
  formData.append('lastName', selectedPlayer.lastName);
  formData.append('teamId', teamId);
  if (selectedImage) formData.append('image', selectedImage);

  await api.put(`/api/players/${selectedPlayer.id}`, formData, {
   withCredentials: true,
   headers: { 'Content-Type': 'multipart/form-data' },
  });

  await fetchTeam();
  setShowEditModal(false);
  setSelectedImage(null);
 };

 const handleDeletePlayer = async (id) => {
  if (!window.confirm("Delete this player?")) return;
  await api.delete(`/api/players/${id}`, { withCredentials: true });
  await fetchTeam();
 };

 return (
  <div className="seasonList-container">
   {showForm && (
    <div className="modal">
     <div className="modal-content">
      <h2>New Player</h2>
      <form onSubmit={handleCreatePlayer}>
       <input type="text" placeholder="First Name" value={playerForm.firstName}
        onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })} />
       <input type="text" placeholder="Last Name" value={playerForm.lastName}
        onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })} />
       <input type="file" accept="image/*"
        onChange={(e) => setPlayerForm({ ...playerForm, image: e.target.files[0] })} />
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
       <input type="text" placeholder="First Name" value={selectedPlayer.firstName}
        onChange={(e) => setSelectedPlayer({ ...selectedPlayer, firstName: e.target.value })} />
       <input type="text" placeholder="Last Name" value={selectedPlayer.lastName}
        onChange={(e) => setSelectedPlayer({ ...selectedPlayer, lastName: e.target.value })} />
       <input type="file" accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files[0])} />
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

    {team?.players?.map(player => (
     <div key={player.id} className="season-card" onClick={() => navigate(`/players/${player.id}`)}>
      <h3>{player.firstName} {player.lastName}</h3>
      <p>Team: {team.name || "Unassigned"}</p>
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
        setSelectedPlayer({ ...player });
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

export default SingleTeam;
