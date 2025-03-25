import { useEffect, useState } from "react";
import api from '@api';
import '../Season/SeasonList.css';
import { useNavigate } from "react-router-dom";

function AllLeagues() {
 const [leagues, setLeagues] = useState([]);
 const [seasons, setSeasons] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [leagueForm, setLeagueForm] = useState({ name: '', seasonId: null });
 const [selectedLeague, setSelectedLeague] = useState(null);
 const navigate = useNavigate();

 useEffect(() => {
  const fetchLeagues = async () => {
   try {
    const res = await api.get('/api/leagues', { withCredentials: true });
    setLeagues(res.data.leagues);
   } catch (error) {
    console.error("Error fetching leagues:", error);
   }
  };
  fetchLeagues();
 }, []);

 useEffect(() => {
  const fetchSeasons = async () => {
   try {
    const res = await api.get('/api/seasons', { withCredentials: true });
    setSeasons(res.data.seasons);
   } catch (err) {
    console.error("Error fetching seasons:", err);
   }
  };
  fetchSeasons();
 }, []);

 const handleCreateLeague = async (e) => {
  e.preventDefault();
  if (!leagueForm.seasonId) {
   const confirm = window.confirm("This league has no season. Are you sure you want to create it?");
   if (!confirm) return;
  }

  try {
   const res = await api.post('/api/leagues', leagueForm, { withCredentials: true });
   setLeagues(prev => [...prev, res.data.league]);
   setShowForm(false);
   setLeagueForm({ name: '', seasonId: null });
  } catch (error) {
   console.error("Error creating league:", error);
  }
 };

 const handleUpdateLeague = async (e) => {
  e.preventDefault();
  try {
   await api.put(`/api/leagues/${selectedLeague.id}`, selectedLeague, { withCredentials: true });

   const res = await api.get('/api/leagues', { withCredentials: true });
   setLeagues(res.data.leagues);

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
console.log(leagues)

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
       <select
        value={leagueForm.seasonId || ''}
        onChange={(e) =>
         setLeagueForm({ ...leagueForm, seasonId: e.target.value ? Number(e.target.value) : null })
        }
       >
        <option value="">No Season</option>
        {seasons.map(season => (
         <option key={season.id} value={season.id}>{season.name}</option>
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

   {showEditModal && selectedLeague && (
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
       <select
        value={selectedLeague.seasonId || ''}
        onChange={(e) =>
         setSelectedLeague({ ...selectedLeague, seasonId: e.target.value ? Number(e.target.value) : null })
        }
       >
        <option value="">No Season</option>
        {seasons.map(season => (
         <option key={season.id} value={season.id}>{season.name}</option>
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
      <p>Add League</p>
     </div>
    </div>

    {leagues.map((league) => (
     <div key={league.id} className="season-card" onClick={() => navigate(`/dashboard/leagues/${league.id}`)}>
      <h3>{league.name}</h3>
      <p>Teams: {league.teamsCount}</p>
      <button
       onClick={(e) => {
        e.stopPropagation();
        setSelectedLeague(league);
        setShowEditModal(true);
       }}
      >Edit</button>
      <button
       onClick={(e) => {
        e.stopPropagation();
        handleDeleteLeague(league.id);
       }}
      >
       Delete
      </button>

     </div>
    ))}
   </div>
  </div>
 );
}

export default AllLeagues;
