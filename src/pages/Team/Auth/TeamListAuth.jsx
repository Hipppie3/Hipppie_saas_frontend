import React, { useState, useEffect } from 'react';
import api from '@api'; // Instead of ../../../utils/api
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
  const [selectedTeams, setSelectedTeams] = useState([]); // ✅ Track selected teams for bulk delete
  const [scoreUpdated, setScoreUpdated] = useState(false);

  // Fetch Teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get('/api/teams', { withCredentials: true });
        setTeams(response.data.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, [scoreUpdated]); // ✅ Re-fetch teams when score is updated


  // Fetch Leagues
useEffect(() => {
  const fetchLeagues = async () => {
    try {
      const response = await api.get('/api/leagues', { withCredentials: true });
      setLeagues(response.data.leagues || []);
    } catch (error) {
      console.error("Error fetching leagues:", error);
    }
  };

  fetchLeagues(); // Initial fetch

}, []);


  // Create Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.leagueId) {
      const confirm = window.confirm("This team has no league. Are you sure you want to create it?");
      if (!confirm) return;
    }
    try {
      await api.post(`/api/teams`, teamForm, { withCredentials: true });
      const updatedTeams = await api.get('/api/teams', { withCredentials: true });
      setTeams(updatedTeams.data.teams || []);
      setTeamForm({ name: "", leagueId: "" });
      setMessage("Team created successfully");
      setIsModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  // Update Team
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/teams/${updateForm.id}`, { name: updateForm.name, leagueId: updateForm.leagueId }, { withCredentials: true });
      const updatedTeams = await api.get('/api/teams', { withCredentials: true });
      setTeams(updatedTeams.data.teams || []);
      setMessage("Team updated successfully");
      setIsUpdateModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };
console.log(teams)
  // Bulk Delete Teams
  const handleDeleteTeams = async () => {
    if (!selectedTeams.length) {
      return alert("Please select at least one team to delete.");
    }
    if (!window.confirm("Are you sure you want to delete the selected teams?")) return;
    try {
      await Promise.all(selectedTeams.map(id => api.delete(`/api/teams/${id}`, { withCredentials: true })));
      setTeams((prevTeams) => prevTeams.filter(team => !selectedTeams.includes(team.id)));
      setSelectedTeams([]); // Clear selection after deletion
      setMessage("Teams deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting teams:", error);
    }
  };

  // Open Update Modal
  const openUpdateModal = (team) => {
    setUpdateForm({
      id: team.id,
      name: team.name,
      leagueId: team.leagueId || team.league?.id || ""
    });
    setIsUpdateModalOpen(true);
  };


  // Handle Checkbox Selection
  const handleCheckboxChange = (id) => {
    setSelectedTeams(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
    );
  };

  // Select All Teams
  const handleSelectAll = () => {
    if (selectedTeams.length === teams.length) {
      setSelectedTeams([]); // Unselect all if already selected
    } else {
      setSelectedTeams(teams.map(team => team.id)); // Select all teams
    }
  };

  return (
    <div className="teamList_auth">
      <div className="teamList-btn-container">
        <button className="delete-teamList-btn" onClick={handleDeleteTeams}>🗑️</button>
        <h2>TEAMS</h2>
        <button className="add-teamList-btn" onClick={() => setIsModalOpen(true)}> + Add Team</button>
      </div>

      {/* Create Team Modal */}
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
              <select
                value={teamForm.leagueId}
                onChange={(e) => setTeamForm({ ...teamForm, leagueId: e.target.value })}
              >
                <option value="">No League</option>
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

      {/* Update Team Modal */}
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
                <option value="">No League</option>
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

      <table className="teamList-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedTeams.length === teams.length}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Teams</th>
            <th>League</th>
            <th># Players</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {teams.length === 0 ? (
            <tr><td colSpan="5">No teams available</td></tr>
          ) : (
            teams.map((team, index) => (
              <tr key={team.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.id)}
                    onChange={() => handleCheckboxChange(team.id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>
                  <NavLink to={`/dashboard/singleTeamToggle/${team.id}`}>{team.name}</NavLink>
                </td>
                <td>{team.league?.name}</td>
                <td>{team.players?.length || 0}</td>
                <td>
                  <button className="teamList-update-btn" onClick={() => openUpdateModal(team)}>
                    <span>🖊</span> EDIT
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TeamListAuth;
