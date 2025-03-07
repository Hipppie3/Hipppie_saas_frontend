import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PlayerListAuth.css';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigation hook
import { NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

function PlayerListAuth() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [playerForm, setPlayerForm] = useState({ firstName: '', lastName: '', age: '', teamId: '', image: null});
  const [updateForm, setUpdateForm] = useState({ id: null, firstName: "", lastName: "", age: "", teamId: "", image: null });
  const [message, setMessage] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]); // ✅ Track selected players for bulk delete
  const {id} = useParams();
  const {isAuthenticated, domain} = useAuth()
  const navigate = useNavigate();
    
    useEffect(() => {
      if (!isAuthenticated) {
        const redirectUrl = domain ? `/login?domain=${domain}` : "/login";
        navigate(redirectUrl, { replace: true }); // ✅ Redirect if not authenticated
      }
    }, [isAuthenticated, navigate, domain]);


  // Fetch Players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players', { withCredentials: true });
        setPlayers(response.data.players || []);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };
    fetchPlayers();
  }, []);

  // Fetch Teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams', { withCredentials: true });
        setTeams(response.data.teams || []);
        console.log(response.data.teams)
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  // Create Player
  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!playerForm.teamId) {
      setMessage("Please select a team for the player.");
      return;
    }
    const formData = new FormData();
    formData.append("firstName", playerForm.firstName);
    formData.append("lastName", playerForm.lastName);
    formData.append("age", playerForm.age ? Number(playerForm.age) : "");
    formData.append("teamId", Number(playerForm.teamId));
    if (playerForm.image) formData.append("image", playerForm.image);
    try {
      const response = await axios.post(`/api/players`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      // ✅ Ensure API returns the newly created player
      const newPlayer = response.data.player; // Adjust this if API returns differently
      // ✅ Append new player to state without refetching all players
      setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
      // Reset Form & Close Modal
      setPlayerForm({ firstName: "", lastName: "", age: "", teamId: "", image: null });
      setMessage("Player created successfully");
      setIsModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  // Update Player
  const handleUpdatePlayer = async (e) => {

    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", updateForm.firstName);
    formData.append("lastName", updateForm.lastName);
    formData.append("age", updateForm.age ? Number(updateForm.age) : "");
    formData.append("teamId", updateForm.teamId ? Number(updateForm.teamId) : "");
    if (updateForm.image && updateForm.image instanceof File) {
      formData.append("image", updateForm.image);
    }
    try {
      await axios.put(`/api/players/${updateForm.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
    });

      const response = await axios.get(`/api/players`, { withCredentials: true });
      setPlayers(response.data.players || []);
      setMessage("Player updated successfully");
      setIsUpdateModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };




  // Bulk Delete Players
  const handleDeletePlayers = async () => {
    if (!selectedPlayers.length) {
      return alert("Please select at least one player to delete.");
    }
    if (!window.confirm("Are you sure you want to delete the selected players?")) return;

    try {
      await Promise.all(selectedPlayers.map(id => axios.delete(`/api/players/${id}`, { withCredentials: true })));
      setPlayers((prevPlayers) => prevPlayers.filter(player => !selectedPlayers.includes(player.id)));
      setSelectedPlayers([]); // Clear selection after deletion
      setMessage("Players deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting players:", error);
    }
  };

  // Open Update Modal
  const openUpdateModal = (player) => {
    console.log(player)
    setUpdateForm({ 
      id: player.id || "",
      firstName: player.firstName ?? "", 
      lastName: player.lastName ?? "", 
      age: player.age != null ? Number(player.age) : "",
      teamId: player.teamId != null ? Number(player.teamId) : "",
      image: player.image || null 
    });
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
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]); // Unselect all if already selected
    } else {
      setSelectedPlayers(players.map(player => player.id)); // Select all players
    }
  };

  return (
    <div className="playerList_auth">
      <div className="playerList-btn-container">
        <button className="delete-playerList-btn" onClick={handleDeletePlayers}>🗑️</button>
        <button className="add-playerList-btn" onClick={() => setIsModalOpen(true)}> + Add Player</button>
      </div>

      {/* Create Player Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Player</h3>
            <form onSubmit={handleCreatePlayer}>
              <input type="text" name="firstName" value={playerForm.firstName} onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })} placeholder="First Name" required />
              <input type="text" name="lastName" value={playerForm.lastName} onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })} placeholder="Last Name"  />
              <input type="number" name="age" value={playerForm.age} onChange={(e) => setPlayerForm({ ...playerForm, age: e.target.value })} placeholder="Age" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPlayerForm({ ...playerForm, image: e.target.files[0] })} />
              <select
                value={playerForm.teamId}
                onChange={(e) => setPlayerForm({ ...playerForm, teamId: Number(e.target.value) })}
              >
                <option value="" disabled>Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Update Player Modal */}
      {isUpdateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Player</h3>
            <form onSubmit={handleUpdatePlayer}>
              <input type="text" name="firstName" value={updateForm.firstName} onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value })} placholder="Enter first name" />
              <input type="text" name="lastName" value={updateForm.lastName} onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })}placeholder="Enter last name" />
              <input type="number" name="age" value={updateForm.age} onChange={(e) => setUpdateForm({ ...updateForm, age: e.target.value })} placeholder="Enter age" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUpdateForm({ ...updateForm, image: e.target.files[0] })} />
              <select value={updateForm.teamId} onChange={(e) => setUpdateForm({ ...updateForm, teamId: e.target.value })} required>
                <option value="" disabled>Select a team</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}

      <table className="playerList-table">
        <thead>
          <tr>
            <th><input type="checkbox" checked={selectedPlayers.length === players.length} onChange={handleSelectAll} /></th>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Team</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td><input type="checkbox" checked={selectedPlayers.includes(player.id)} onChange={() => handleCheckboxChange(player.id)} /></td>
              <td>{index + 1}</td>
              <td><NavLink to={`/players/${player.id}`}>{player.firstName} {player.lastName}</NavLink></td>
              <td>{player.age || "N/A"}</td>
              <td><NavLink to={`/teams/${player.team?.id}`}>{player.team?.name || "No Team"}</NavLink></td>
              <td><button className="playerList-update-btn" onClick={() => openUpdateModal(player)}> <span>🖊</span> EDIT</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerListAuth;
