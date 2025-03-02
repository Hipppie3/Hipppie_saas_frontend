import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import LeagueGameAuth from '../../Game/LeagueGameAuth'
import './LeagueAuth.css';

function LeagueAuth() {
  const { isAuthenticated, loading, user } = useAuth(); // ✅ Add auth state
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '' });
  const [updateForm, setUpdateForm] = useState({ id: null, name: "" });
  const [teams, setTeams] = useState([]);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain"); // ✅ Extract domain for public users
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([])
  const [toggleTeamForm, setToggleTeamForm] = useState(false)


  // Fetches League
  useEffect(() => {
    if (loading) return; // ✅ Wait for auth state to resolve
    const getLeague = async () => {
      try {
        console.log("Fetching league for ID:", id);
        let response;
        if (isAuthenticated) {
          if (user?.role === "super_admin") {
            response = await axios.get(`/api/leagues/${id}`, { withCredentials: true });
          } else {
            response = await axios.get(`/api/leagues/${id}`, { withCredentials: true });
          }
        } else if (domain) {
          response = await axios.get(`/api/leagues/${id}?domain=${domain}`);
        } else {
          return setError("Unauthorized access");
        }
        setLeagueInfo(response.data.league);
        console.log("League Data:", response.data.league);
        // If teams are included in league data, use them directly
        if (response.data.league?.teams) {
          setTeams(response.data.league.teams);
        }
      } catch (error) {
        console.error("Error fetching league:", error.response?.data || error.message);
        setError("Failed to fetch league");
      }
    };
    getLeague();
  }, [id, domain, isAuthenticated, loading]);


  // Create Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/leagues/${id}/teams`, teamForm, { withCredentials: true });
      // Fetch updated team list
      const response = await axios.get(`/api/leagues/${id}`, { withCredentials: true });
      setTeams(response.data.league.teams || []);
      // Close the modal
      setIsModalOpen(false);
      // Reset the form
      setTeamForm({ name: "" });
      // Display success message
      setMessage("Team created successfully");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  // Update Team
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/teams/${updateForm.id}`, { name: updateForm.name }, { withCredentials: true });
      setTeams(teams.map(team =>
        team.id === updateForm.id ? { ...team, name: response.data.team.name } : team
      ));
      setMessage(`${response.data.team.name} updated successfully`);
      setIsUpdateModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating league:', error);
    }
  };

  // Open Update Modal
  const openUpdateModal = (team) => {
    setUpdateForm({ id: team.id, name: team.name });
    setIsUpdateModalOpen(true);
  };

  // Delete Team
  const handleDeleteTeams = async () => {
    if (!selectedTeams.length) {
      return alert("Please select at least one team to delete");
    }
    if (!window.confirm("Are you sure you want to delete the selected teams?")) return;
    try {
      // Delete all selected teams
      await Promise.all(selectedTeams.map(id => axios.delete(`/api/teams/${id}`, { withCredentials: true })));
      // Remove deleted teams from the UI
      setTeams((prevTeams) => prevTeams.filter(team => !selectedTeams.includes(team.id)));
      setSelectedTeams([]); // Clear selection after deletion
      setMessage("Teams deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting teams:", error);
    }
  };

  // Handle Checkbox
  const handleCheckboxChange = (id) => {
    setSelectedTeams(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
    );
  };

  // Handle select all leagues
  const handleSelectAll = () => {
    if (selectedTeams.length === teams.length) {
      setSelectedTeams([]); // Unselect all if already selected
    } else {
      setSelectedTeams(teams.map(team => team.id)); // Select all teams
    }
  };

  if (loading) return <p>Loading team...</p>;
  if (error) return <p>{error}</p>;


  const handleToggleTeamForm = () => {
      setToggleTeamForm((prevState) => !prevState);
  }


  return (
    <div className="league_auth">
      <div>
        <h2 className="league_auth_title">{leagueInfo?.name}</h2>
      </div>

      {/* Button to toggle between show_league_list and leagueAuth-btn-container + table */}
      <button onClick={handleToggleTeamForm}>
        {toggleTeamForm ? "Hide Teams" : "Expand Teams"}
      </button>

      {/* Show the league list initially (when toggleTeamForm is false) */}
      {!toggleTeamForm ? (
        <>
        <div className="show-team-list-table">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                  <tr key={team.id}>
                      <td>{team.name}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
        </div>
        <div>
          <LeagueGameAuth />
        </div>
        </>
      ) 
      : 
      (

        <>
          {/* Show buttons and table when toggleTeamForm is true */}
          <div className="leagueAuth-btn-container">
            <button className="delete-leagueAuth-btn" onClick={handleDeleteTeams}>🗑️</button>
            <button className="add-leagueAuth-btn" onClick={() => setIsModalOpen(true)}> + Add Team</button>
          </div>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Create Team</h3>
                <form onSubmit={handleCreateTeam}>
                  <input
                    type="text"
                    name="name"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ name: e.target.value })}
                    placeholder="Enter team name"
                    required
                  />
                  <button type="submit">Create</button>
                  <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                </form>
              </div>
            </div>
          )}

          {/* Update League Modal */}
          {isUpdateModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Update League</h3>
                <form onSubmit={handleUpdateTeam}>
                  <input
                    type="text"
                    name="name"
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                    required
                  />
                  <button type="submit">Update</button>
                  <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
                </form>
              </div>
            </div>
          )}

          {message && <p>{message}</p>}

          {/* Show table when toggleTeamForm is true */}
          <table className="leagueAuthTeam-table">
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
                <th># Players</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr><td colSpan="5" className="no_team">No teams available</td></tr>
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
                      <NavLink to={`/teams/${team.id}`}>{team.name}</NavLink>
                    </td>
                    <td>{team.players?.length}</td>
                    <td>
                      <button className="leagueAuthTeam-update-btn" onClick={() => openUpdateModal(team)}>
                        <span>🖊</span> EDIT
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );

};

export default LeagueAuth;
