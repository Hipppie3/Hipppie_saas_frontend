import api from '@api'; // Instead of ../../../utils/api
import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './LeagueAuth.css';
import LeagueGameAuth from '../../Game/Auth/LeagueGameAuth';

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
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [leaguesPerPage, setLeaguesPerPage] = useState(10);




  // Fetches League
  useEffect(() => {
    if (loading) return;

    const getLeague = async () => {
      try {
        console.log("Fetching league for ID:", id);
        let response;

        if (isAuthenticated) {
          response = await api.get(`/api/leagues/${id}`, { withCredentials: true });
        } else if (domain) {
          response = await api.get(`/api/leagues/${id}?domain=${domain}`);
        } else {
          return setError("Unauthorized access");
        }

        const leagueData = response.data.league;
        console.log("League Data:", leagueData);

        // ✅ Calculate wins and losses dynamically on the frontend
        const teamsMap = {};
        leagueData.teams.forEach(team => {
          teamsMap[team.id] = {
            ...team,
            wins: 0,
            losses: 0
          };
        });

        leagueData.games.forEach(game => {
          if (game.status === "completed") {
            if (teamsMap[game.team1_id] && teamsMap[game.team2_id]) {
              if (game.score_team1 > game.score_team2) {
                teamsMap[game.team1_id].wins += 1;
                teamsMap[game.team2_id].losses += 1;
              } else if (game.score_team2 > game.score_team1) {
                teamsMap[game.team2_id].wins += 1;
                teamsMap[game.team1_id].losses += 1;
              }
            }
          }
        });

        // ✅ Update teams with dynamically calculated wins/losses
        setTeams(Object.values(teamsMap));
        setLeagueInfo(leagueData);

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
      const response = await api.post(`/api/leagues/${id}/teams`, teamForm, { withCredentials: true });
      const newTeam = { ...response.data.team, players: [] }; // Ensure players array exists

      setTeams((prevTeams) => [...prevTeams, newTeam]);

      setLeagueInfo((prevLeague) => ({
        ...prevLeague,
        teams: [...(prevLeague?.teams || []), newTeam],
      }));

      setIsModalOpen(false);
      setTeamForm({ name: "" });
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
      const response = await api.put(`/api/teams/${updateForm.id}`, { name: updateForm.name }, { withCredentials: true });
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
      await Promise.all(selectedTeams.map(id => api.delete(`/api/teams/${id}`, { withCredentials: true })));
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



  const sortedTeams = [...teams].sort((a, b) => {
    if (a.wins !== b.wins) {
      return b.wins - a.wins; // Sort by most wins first
    }
    return a.losses - b.losses; // If wins are tied, sort by fewest losses
  });

  // Assign proper ranking with correct sequential numbering
  let rank = 1;
  let lastRank = 1;
  const rankedTeams = sortedTeams.map((team, index, arr) => {
    if (index > 0 && team.wins === arr[index - 1].wins && team.losses === arr[index - 1].losses) {
      return { ...team, rank: lastRank }; // Assign same rank as previous if tied
    }
    lastRank = rank; // Store the last assigned rank
    return { ...team, rank: rank++ }; // Increment rank properly
  });

  // Apply pagination after ranking
  const indexOfLastLeague = currentPage * leaguesPerPage;
  const indexOfFirstLeague = indexOfLastLeague - leaguesPerPage;
  const currentLeagues = rankedTeams.slice(indexOfFirstLeague, indexOfLastLeague);





  return (
    <div className="league_auth">
      <div>
        <h2 className="league_auth_title">{leagueInfo?.name}</h2>
      </div>


      <div className="leagueAuth-team-container">
        <div className="leagueAuth-btn-container">
          <button className="delete-leagueAuth-btn" onClick={handleDeleteTeams}>🗑️</button>
          <h2>Teams</h2>
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
              <th>Standings</th>
              <th>Teams</th>
              <th>Wins</th>
              <th>Losses</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr><td colSpan="5" className="no_team">No teams available</td></tr>
            ) : (
              currentLeagues.map((team) => (
                <tr key={team.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => handleCheckboxChange(team.id)}
                    />
                  </td>
                  <td>{team.rank}</td>
                  <td>
                    <NavLink to={`/teams/${team.id}`}>{team.name}</NavLink>
                  </td>
                  <td>{team.wins}</td>
                  <td>{team.losses}</td>
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
        <div className="pagination">
          <div>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀
            </button>

            <span> Page {currentPage} </span>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastLeague >= teams.length}
            >
              ▶
            </button>
          </div>
          <div>
            <select
              value={leaguesPerPage}
              onChange={(e) => setLeaguesPerPage(Number(e.target.value))}
            >
              <option value="10">Show 10</option>
              <option value="20">Show 20</option>
              <option value="50">Show 50</option>
            </select>
          </div>
        </div>
      </div>






      <>
        <div className="show-team-list-table">
        </div>
        <div className="league-game-container">
          <LeagueGameAuth leagueInfo={leagueInfo} />
        </div>
      </>
    </div>
  );

};

export default LeagueAuth;

