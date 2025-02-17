import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import './TeamListAuth.css';

function TeamListAuth() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", leagueId: "" });
  const [updateForm, setUpdateForm] = useState({ id: null, name: "", leagueId: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams', { withCredentials: true });
        setTeams(response.data.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  // ✅ Fetch all leagues separately
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await axios.get('/api/leagues', { withCredentials: true });
        setLeagues(response.data.leagues || []);
      } catch (error) {
        console.error("Error fetching leagues:", error);
      }
    };
    fetchLeagues();
  }, []);

  // ✅ Create Team (Now uses `leagueId`)
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.leagueId) {
      setMessage("Please select a league for the team.");
      return;
    }
    try {
      const response = await axios.post(`/api/leagues/${teamForm.leagueId}/teams`, teamForm, { withCredentials: true });
      setTeams([...teams, response.data.team]);
      setTeamForm({ name: "", leagueId: "" });
      setMessage(`${response.data.team.name} created successfully`);
      setIsModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  // ✅ Delete Team
  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      const response = await axios.delete(`/api/teams/${id}`, { withCredentials: true });
      if (response.data.success) {
        setTeams(teams.filter(teams => teams.id !== id));
        setMessage("Team deleted successfully");
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  // ✅ Open Update Modal
  const openUpdateModal = (team) => {
    setUpdateForm({ id: team.id, name: team.name, leagueId: team.leagueId });
    setIsUpdateModalOpen(true);
  };

  // ✅ Handle Update Team
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/teams/${updateForm.id}`, { name: updateForm.name, leagueId: updateForm.leagueId }, { withCredentials: true });
      setTeams(teams.map(team => team.id === updateForm.id ? response.data.team : team));
      setMessage(`${response.data.team.name} updated successfully`);
      setIsUpdateModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  return (
      <div className="teamList_auth">
        <button className="add-team-btn" onClick={() => setIsModalOpen(true)}>Add Team</button>
  
   {/* ✅ Create Team Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Team</h3>
            <form onSubmit={handleCreateTeam}>
              <input 
                type="text"
                name="name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Enter team name"
                required
              />
              
              {/* ✅ League Dropdown (Now fetched separately) */}
              <select
                value={teamForm.leagueId}
                onChange={(e) => setTeamForm({ ...teamForm, leagueId: e.target.value })}
                required
              >
                <option value="" disabled>Select a league</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>{league.name}</option>
                ))}
              </select>

              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
  
        {/* ✅ Update League Modal */}
        {isUpdateModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Update Team</h3>
              <form onSubmit={handleUpdateTeam}>
                <input 
                  type="text"
                  name="name"
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                  required
                />
                <select
                value={updateForm.leagueId}
                onChange={(e) => setUpdateForm({ ...updateForm, leagueId: e.target.value })}
                required
              >
                <option value="" disabled>Select a league</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>{league.name}</option>
                ))}
              </select>
                <button type="submit">Update</button>
                <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
  
        {message && <p className="message">{message}</p>}
  
        <table className="team-table">
          <thead>
            <tr>
              <th>Teams</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr><td colSpan="2">No teams available</td></tr>
            ) : (
              teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <NavLink to={`/teams/${team.id}`}>{team.name}</NavLink>
                  </td>
                  <td>
                    <button className="update-btn" onClick={() => openUpdateModal(team)}>Update</button>
                    <button className="delete-btn" onClick={() => handleDeleteTeam(team.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

export default TeamListAuth
