import { useEffect, useState } from "react";
import api from '@api';
import '../Season/SeasonList.css';
import { useNavigate } from "react-router-dom";

function AllTeams() {
 const [teams, setTeams] = useState([]);
 const [leagues, setLeagues] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [teamForm, setTeamForm] = useState({ name: '', leagueId: null });
 const [selectedTeam, setSelectedTeam] = useState(null);
 const navigate = useNavigate();

 useEffect(() => {
  const fetchTeams = async () => {
   try {
    const res = await api.get('/api/teams', { withCredentials: true });
    setTeams(res.data.teams);
   } catch (error) {
    console.error("Error fetching teams:", error);
   }
  };
  fetchTeams();
 }, []);

 useEffect(() => {
  const fetchLeagues = async () => {
   try {
    const res = await api.get('/api/leagues', { withCredentials: true });
    setLeagues(res.data.leagues);
   } catch (err) {
    console.error("Error fetching leagues:", err);
   }
  };
  fetchLeagues();
 }, []);

 const handleCreateTeam = async (e) => {
  e.preventDefault();
  if (!teamForm.leagueId) {
   const confirm = window.confirm("This team has no league. Are you sure you want to create it?");
   if (!confirm) return;
  }

  try {
   const res = await api.post('/api/teams', teamForm, { withCredentials: true });
   setTeams(prev => [...prev, res.data.team]);
   setShowForm(false);
   setTeamForm({ name: '', leagueId: null });
  } catch (error) {
   console.error("Error creating team:", error);
  }
 };

 const handleUpdateTeam = async (e) => {
  e.preventDefault();
  try {
   await api.put(`/api/teams/${selectedTeam.id}`, selectedTeam, { withCredentials: true });

   const res = await api.get('/api/teams', { withCredentials: true });
   setTeams(res.data.teams);

   setShowEditModal(false);
  } catch (error) {
   console.error("Error updating team:", error);
  }
 };

 const handleDeleteTeam = async (id) => {
  if (!window.confirm("Are you sure you want to delete this team? All players will be removed.")) return;

  try {
   await api.delete(`/api/teams/${id}`, { withCredentials: true });
   setTeams(prev => prev.filter(t => t.id !== id));
  } catch (error) {
   console.error("Error deleting team:", error);
  }
 };
console.log(teams)
 return (
  <div className="seasonList-container">
   {showForm && (
    <div className="modal">
     <div className="modal-content">
      <h2>New Team</h2>
      <form onSubmit={handleCreateTeam}>
       <input
        type="text"
        placeholder="Team Name"
        value={teamForm.name}
        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
       />
       <select
        value={teamForm.leagueId || ''}
        onChange={(e) =>
         setTeamForm({ ...teamForm, leagueId: e.target.value ? Number(e.target.value) : null })
        }
       >
        <option value="">No League</option>
        {leagues.map(league => (
         <option key={league.id} value={league.id}>{league.name}</option>
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

   {showEditModal && selectedTeam && (
    <div className="modal">
     <div className="modal-content">
      <h2>Edit Team</h2>
      <form onSubmit={handleUpdateTeam}>
       <input
        type="text"
        placeholder="Team Name"
        value={selectedTeam.name}
        onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
       />
       <select
        value={selectedTeam.leagueId || ''}
        onChange={(e) =>
         setSelectedTeam({ ...selectedTeam, leagueId: e.target.value ? Number(e.target.value) : null })
        }
       >
        <option value="">No League</option>
        {leagues.map(league => (
         <option key={league.id} value={league.id}>{league.name}</option>
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
      <p>Add Team</p>
     </div>
    </div>

    {teams.map((team) => (
     <div key={team.id} className="season-card" onClick={() => navigate(`/dashboard/teams/${team.id}`)}>
      <h3>{team.name}</h3>
      <p>Players: {team.players?.length || 0}</p>
      <button
       onClick={(e) => {
        e.stopPropagation();
        setSelectedTeam(team);
        setShowEditModal(true);
       }}
      >Edit</button>
      <button
       onClick={(e) => {
        e.stopPropagation();
        handleDeleteTeam(team.id);
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

export default AllTeams;
