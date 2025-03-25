import { useEffect, useState } from "react";
import api from '@api';
import '../SeasonList.css'; // ✅ Reuse same styles
import { useNavigate, useParams } from "react-router-dom";

function SeasonLeagues() {
 const [leagues, setLeagues] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [leagueForm, setLeagueForm] = useState({ name: '' });
 const [showEditModal, setShowEditModal] = useState(false);
 const [selectedLeague, setSelectedLeague] = useState(null);
 const { id: seasonId } = useParams();
 const navigate = useNavigate();

 useEffect(() => {
  const fetchLeagues = async () => {
   try {
    const response = await api.get('/api/leagues', { withCredentials: true });
    setLeagues(response.data.leagues);
    console.log(response.data.leagues)
   } catch (error) {
    console.error("Error fetching leagues:", error);
   }
  };
  fetchLeagues();
 }, []);

 const handleCreateLeague = async (e) => {
  e.preventDefault();
  try {
   const res = await api.post('/api/leagues', {
    ...leagueForm,
    seasonId: Number(seasonId)
   }, { withCredentials: true });
   setLeagues(prev => [...prev, res.data.league]);
   setShowForm(false);
   setLeagueForm({ name: '' });
  } catch (error) {
   console.error("Error creating league:", error);
  }
 };

 const handleUpdateLeague = async (e) => {
  e.preventDefault();
  try {
   const res = await api.put(`/api/leagues/${selectedLeague.id}`, selectedLeague, { withCredentials: true });
   setLeagues(prev => prev.map(l => l.id === selectedLeague.id ? res.data.league : l));
   setShowEditModal(false);
  } catch (error) {
   console.error("Error updating league:", error);
  }
 };

 const handleDeleteLeague = async (id) => {
  if (!window.confirm("Are you sure you want to delete this league? All teams and games will be removed.")) return;
  try {
   await api.delete(`/api/leagues/${id}`, { withCredentials: true });
   setLeagues(prev => prev.filter(l => l.id !== id));
  } catch (error) {
   console.error("Error deleting league:", error);
  }
 };

 const numericSeasonId = Number(seasonId);
 const filteredLeagues = leagues.filter(l => l.seasonId === numericSeasonId);
console.log(filteredLeagues)
console.log(numericSeasonId)

 return (
  <div className="seasonList-container">
   {showForm && (
    <div className="modal">
     <div className="modal-content">
      <h2>New League</h2>
      <form onSubmit={handleCreateLeague}>
       <input
        type="text"
        placeholder="League Name"
        value={leagueForm.name}
        onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
       />
       <div className="modal-update-cancel-button">
        <button type="submit">Create</button>
        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
       </div>
      </form>
     </div>
    </div>
   )}

   {showEditModal && (
    <div className="modal">
     <div className="modal-content">
      <h2>Edit League</h2>
      <form onSubmit={handleUpdateLeague}>
       <input
        type="text"
        placeholder="League Name"
        value={selectedLeague.name}
        onChange={(e) => setSelectedLeague({ ...selectedLeague, name: e.target.value })}
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
      <p>Add League</p>
     </div>
    </div>

    {filteredLeagues.map((league) => (
     <div key={league.id} className="season-card" onClick={() => navigate(`/dashboard/singleLeagueToggle/${league.id}`)}>
      <h3>{league.name}</h3>
      <p>Teams: {league.teamsCount} </p>
      <button onClick={(e) => {
       e.stopPropagation(); // 👈 stops card click
       setSelectedLeague(league);
       setShowEditModal(true);
      }}>Edit</button>
      <button onClick={(e) => {
       e.stopPropagation(); // 👈 stops card click
       handleDeleteLeague(league.id)}
      }>Delete</button>
     </div>
    ))}
   </div>
  </div>
 );
}

export default SeasonLeagues;
