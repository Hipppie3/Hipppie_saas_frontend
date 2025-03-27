import React, { useState, useEffect } from 'react';
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './TeamAuth.css';

function TeamAuth() {
  const { isAuthenticated, loading, user } = useAuth();
  const [team, setTeam] = useState({ players: [], games: [] });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const domain = useSearchParams()[0].get("domain");
  const { id } = useParams();

  // Player Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [playerForm, setPlayerForm] = useState({ firstName: '', lastName: '', teamId: id });
  const [updateForm, setUpdateForm] = useState({ id: null, firstName: '', lastName: ''});

  // Fetch Team Data (Players & Games)
  useEffect(() => {
    if (loading) return;
    const getTeam = async () => {
      try {
        let response;
        if (isAuthenticated) {
          response = await api.get(`/api/teams/${id}`, { withCredentials: true });
        } else if (domain) {
          response = await api.get(`/api/teams/${id}?domain=${domain}`);
        } else {
          return setError("Unauthorized access");
        }
        setTeam(response.data.team || { players: [], games: [] });
      } catch (error) {
        console.error("Error fetching team:", error.response?.data || error.message);
        setError("Failed to fetch team");
      }
    };
    getTeam();
  }, [id, domain, isAuthenticated, loading]);

  // Create Player
  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", playerForm.firstName);
    formData.append("lastName", playerForm.lastName);
    formData.append("teamId", id);
    if (playerForm.image) formData.append("image", playerForm.image); // Append the image to FormData

    try {
      const response = await api.post(`/api/players`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      const newPlayer = response.data.player;

      // Update UI immediately using setTeam to modify players array
      setTeam((prevTeam) => ({
        ...prevTeam,
        players: [...prevTeam.players, newPlayer], // Add new player to the players array
      }));

      setIsModalOpen(false);
      setPlayerForm({ firstName: '', lastName: '', teamId: id, image: null }); // Reset form
      setMessage("Player created successfully");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error creating player:", error);
    }
  };



  // Update Player
  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", updateForm.firstName);
    formData.append("lastName", updateForm.lastName);
    formData.append("teamId", updateForm.teamId ? Number(updateForm.teamId) : "");

    // Only append image if it's a new image file
    if (updateForm.image && updateForm.image instanceof File) {
      formData.append("image", updateForm.image);
    }

    try {
      const response = await api.put(`/api/players/${updateForm.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      const updatedPlayer = response.data.player;

      // Update the player's data in the team
      setTeam((prevTeam) => ({
        ...prevTeam,
        players: prevTeam.players.map((player) =>
          player.id === updatedPlayer.id ? updatedPlayer : player
        ),
      }));

      setIsUpdateModalOpen(false);
      setMessage("Player updated successfully");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error updating player:", error);
    }
  };



  // Delete Players
  const handleDeletePlayers = async () => {
    if (!selectedPlayers.length) {
      return alert("Please select at least one player to delete.");
    }
    if (!window.confirm("Are you sure you want to delete the selected players?")) return;
    try {
      await Promise.all(selectedPlayers.map(id => api.delete(`/api/players/${id}`, { withCredentials: true })));
      setTeam((prevTeam) => ({
        ...prevTeam,
        players: prevTeam.players.filter(player => !selectedPlayers.includes(player.id)),
      }));
      setSelectedPlayers([]);
      setMessage("Players deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting players:", error);
    }
  };

  // Open Update Modal
  const openUpdateModal = (player) => {
    setUpdateForm({ id: player.id, firstName: player.firstName, lastName: player.lastName, });
    setIsUpdateModalOpen(true);
  };

  // Handle Checkbox Selection
  const handleCheckboxChange = (id) => {
    setSelectedPlayers(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
    );
  };

  // Select All Players
  const handleSelectAll = () => {
    if (selectedPlayers.length === team.players.length) {
      setSelectedPlayers([]); // Unselect all if already selected
    } else {
      setSelectedPlayers(team.players.map(player => player.id)); // Select all players
    }
  };

  if (loading) return <p>Loading team...</p>;
  if (error) return <p>{error}</p>;
console.log(team)
  return (
    <div className="team_auth">
      <h2 className="team_auth_title">Team {team.name}</h2>

      {/* Players Section */}
      <div className="teamAuth-btn-container">
        <button className="delete-teamAuth-btn" onClick={handleDeletePlayers}>🗑️</button>
        <button className="add-teamAuth-btn" onClick={() => setIsModalOpen(true)}> + Add Player</button>
      </div>

      {/* Create Player Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Player</h3>
            <form onSubmit={handleCreatePlayer}>
              <input type="text" name="firstName" value={playerForm.firstName} onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })} placeholder="First Name" required />
              <input type="text" name="lastName" value={playerForm.lastName} onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })} placeholder="Last Name" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPlayerForm({ ...playerForm, image: e.target.files[0] })}
              />
              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Players Table */}
      <table className="teamAuthPlayer-table">
        <thead>
          <tr>
            <th><input type="checkbox" checked={selectedPlayers.length === team.players.length} onChange={handleSelectAll} /></th>
            <th>Name</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {team.players.map((player) => (
            <tr key={player.id}>
              <td><input type="checkbox" checked={selectedPlayers.includes(player.id)} onChange={() => handleCheckboxChange(player.id)} /></td>
              <td><NavLink to={`/players/${player.id}`}>{player.firstName} {player.lastName}</NavLink></td>
              <td>
                <button className="teamAuthPlayer-update-btn" onClick={() => openUpdateModal(player)}>
                  🖊 Edit
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Update Player Modal */}
      {isUpdateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Player</h3>
            <form onSubmit={handleUpdatePlayer}>
              <input
                type="text"
                name="firstName"
                value={updateForm.firstName}
                onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value })}
                placeholder="First Name"
                required
              />
              <input
                type="text"
                name="lastName"
                value={updateForm.lastName}
                onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })}
                placeholder="Last Name (optional)"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUpdateForm({ ...updateForm, image: e.target.files[0] })}
              />

              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Games Table
      <h3 className="games_title">Games</h3>
      <table className="teamAuthGame-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Matchup</th>
            <th>Result</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {team?.games?.length === 0 ? (
            <tr><td colSpan="5" className="no_games">No games available</td></tr>
          ) : (
            (team?.games ?? [])
              .slice()
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((game, index) => (
                <tr key={game.id}>
                  <td>{new Date(game.date).toLocaleDateString()}</td>
                  <td>
                    <NavLink to={`/games/${game.id}`}>
                    {game.team1} vs {game.team2}
                    </NavLink>
                  </td>
                  <td>{game.score_team1} - {game.score_team2}</td>
                  <td>{game.status}</td>
                </tr>
              ))
          )}
        </tbody>
      </table> */}
    </div>
  );
}

export default TeamAuth;
