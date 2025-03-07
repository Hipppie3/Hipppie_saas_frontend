import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { NavLink, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import './TeamAuth.css'

function TeamAuth() {
  const {isAuthenticated, loading, user} = useAuth()
  const [team, setTeam] = useState({ players: [] });
  const [playerForm, setPlayerForm] = useState({ firstName: '', lastName: '', age: '', teamId: '', image: null});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [players, setPlayers] = useState([])
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState("")
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const domain = searchParams.get("domain"); // ✅ Extracts actual domain value
  const {id} = useParams();
    const [updateForm, setUpdateForm] = useState({
      id: null,
      firstName: "", 
      lastName: "", 
      age: "", 
      leagueId: "", 
      teamId: "" ,
      image: null
    });
    console.log(user)
    console.log(id)
  // Fetches Teams
  useEffect(() => {
    if (loading) return
    const getTeam = async () => {
      try {
        console.log("Fetching team for ID:", id);
        let response;
        if (isAuthenticated) {
          if (user?.role === "super_admin") {
            response = await axios.get(`/api/teams/${id}`, { withCredentials: true});
          } else {
            response = await axios.get(`/api/teams/${id}`, { withCredentials: true});
          }
        } else if (domain) {
          response = await axios.get(`/api/teams/${id}?domain=${domain}`)
        } else {
          return setError("Unauthorized access")
        } 
        setTeam(response.data.team || {players: [] })
        console.log(response.data.team)
      } catch (error) {
        console.error("Error fetching team:", error.response?.data || error.message);
        setError("Failed to fetch team")
      }
    };
    getTeam()
  },[id, domain, isAuthenticated, loading])

  // Create Player
  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", playerForm.firstName);
    formData.append("lastName", playerForm.lastName);
    formData.append("age", playerForm.age ? Number(playerForm.age) : "");
    formData.append("teamId", id); // Ensure the correct teamId is used
    if (playerForm.image) formData.append("image", playerForm.image);
    try {
      await axios.post(`/api/players`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      // ✅ Refetch team after creating a player
      const response = await axios.get(`/api/teams/${id}`, { withCredentials: true });
      setTeam(response.data.team || { players: [] });
      setPlayerForm({ firstName: "", lastName: "", age: "", teamId: "", image: null });
      setMessage("Player created successfully");
      setIsModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating player:', error.response?.data || error);
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
      // ✅ Refetch team to update UI instantly
      const response = await axios.get(`/api/teams/${id}`, { withCredentials: true });
      setTeam(response.data.team || { players: [] });
      setMessage("Player updated successfully");
      setIsUpdateModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error updating player:", error.response?.data || error);
    }
  };

  // Delete Player
  const handleDeletePlayer = async () => {
    if (!selectedPlayers.length) {
      return alert("Please select at least one player to delete");
    }
    if (!window.confirm("Are you sure you want to delete the selected players?")) return;
    try {
      await Promise.all(selectedPlayers.map(id => axios.delete(`/api/players/${id}`, { withCredentials: true })));
      // ✅ Refetch updated team after deletion
      const response = await axios.get(`/api/teams/${id}`, { withCredentials: true });
      setTeam(response.data.team || { players: [] });
      setSelectedPlayers([]);
      setMessage("Players deleted successfully");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting player:', error.response?.data || error);
    }
  };

  // Handle Checkbox
  const handleCheckboxChange = (id) => {
    setSelectedPlayers(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
    );
  };

  // Select All Checkbox
  const handleSelectAll = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map(player => player.id));
    }
  };

  // Update Player Modal Box
  const openUpdateModal = (player) => {
    setUpdateForm({
      id: player.id ?? "",
      firstName: player.firstName ?? "",
      lastName: player.lastName ?? "",
      age: player.age != null ? Number(player.age) : "",
      teamId: player.teamId != null ? Number(player.teamId) : "",
      image: player.image || null, // Preserve existing image
    });
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="team_auth">
      <h2 className="team_auth_title">Team {team.name}</h2>
      <div className="teamAuth-btn-container">
        <button className="delete-teamAuth-btn" onClick={handleDeletePlayer}
        >🗑️</button>
        <button className="add-teamAuth-btn" onClick={() => setIsModalOpen(true)}> + Add Player</button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Player</h3>
            <form onSubmit={handleCreatePlayer}>
              <input
                type="text"
                name="firstName"
                value={playerForm.firstName}
                onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
              <input
                type="text"
                name="lastName"
                value={playerForm.lastName}
                onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })}
                placeholder="Enter last name"
              />
              <input
                type="number"
                name="age"
                value={playerForm.age}
                onChange={(e) => setPlayerForm({ ...playerForm, age: e.target.value ? Number(e.target.value) : "" })}
                placeholder="Enter age"
              />
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
                placeholder="Enter first name"
                required
              />
              <input
                type="text"
                name="lastName"
                value={updateForm.lastName}
                onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })}
                placeholder="Enter last name"
              />
              <input
                type="number"
                name="age"
                value={updateForm.age}
                onChange={(e) => setUpdateForm({ ...updateForm, age: e.target.value ? Number(e.target.value) : "" })}
                placeholder="Enter age"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUpdateForm({ ...updateForm, image: e.target.files[0] })} />
              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}

    <table className="teamAuthPlayer-table">
      <thead>
        <tr>
          <th>
            <input 
            type="checkbox"
            checked={selectedPlayers.length === players.length} 
            onChange={handleSelectAll}
            />
          </th>
          <th>Id</th>
          <th>Name</th>
          <th>Age</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {team?.players?.length === 0 ? (
          <tr><td colSpan="2" className="no_player">No players available</td></tr>
        ) : (
          team.players?.map((player, index) => (
            <tr key={player.id}>
              <td>
                <input 
                type="checkbox"
                checked={selectedPlayers.includes(player.id)}
                onChange={() => handleCheckboxChange(player.id)}
                />
              </td>
              <td>
              {index + 1}
              </td>
              <td>
                <NavLink to={`/players/${player.id}`}>{player.firstName} {player.lastName}</NavLink>
              </td>
              <td>
                {player.age}
              </td>
              <td>
                <button className="teamAuthPlayer-update-btn" onClick={() => openUpdateModal(player)}><span>🖊</span>  EDIT</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div> 
  )};;

export default TeamAuth;
