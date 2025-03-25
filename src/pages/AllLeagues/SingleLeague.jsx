import { useEffect, useState } from "react";
import api from '@api';
import '../Season/SeasonList.css';
import { useNavigate, useParams } from "react-router-dom";

function SingleLeague() {
 const { id: leagueId } = useParams();
 const [teams, setTeams] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [teamForm, setTeamForm] = useState({ name: '' });
 const [selectedTeam, setSelectedTeam] = useState(null);
 const navigate = useNavigate();

 useEffect(() => {
  const fetchTeams = async () => {
   const res = await api.get(`/api/leagues/${leagueId}`, { withCredentials: true });
   setTeams(res.data?.league?.teams);

  };
  fetchTeams();
 }, [leagueId]);

 const handleCreateTeam = async (e) => {
  e.preventDefault();
  const res = await api.post(`/api/leagues/${leagueId}/teams`, teamForm, {
   withCredentials: true
  });
  setTeams(prev => [...prev, res.data.team]);
  setShowForm(false);
  setTeamForm({ name: '' });
 };

 const handleUpdateTeam = async (e) => {
  e.preventDefault();
  await api.put(`/api/teams/${selectedTeam.id}`, selectedTeam, { withCredentials: true });
  const updated = await api.get(`/api/leagues/${leagueId}`, { withCredentials: true });
  setTeams(updated.data?.league?.teams || []);
  setShowEditModal(false);
 };

 const handleDeleteTeam = async (id) => {
  if (!window.confirm("Delete this team?")) return;
  await api.delete(`/api/teams/${id}`, { withCredentials: true });
  setTeams(prev => prev.filter(t => t.id !== id));
 };

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
        onChange={(e) => setTeamForm({ name: e.target.value })}
       />
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

    {teams.map(team => (
     <div key={team.id} className="season-card" onClick={() => navigate(`/dashboard/teams/${team.id}`)}>
      <h3>{team.name}</h3>
      <button
       onClick={(e) => {
        e.stopPropagation();
        setSelectedTeam({ ...team });
        setShowEditModal(true);
       }}
      >Edit</button>
      <button
       onClick={(e) => {
        e.stopPropagation();
        handleDeleteTeam(team.id);
       }}
      >Delete</button>
     </div>
    ))}
   </div>
  </div>
 );
}

export default SingleLeague;
