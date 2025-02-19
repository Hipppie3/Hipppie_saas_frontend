import React, {useState, useEffect} from 'react'
import axios from 'axios'
import './PlayerListAuth.css'
import { NavLink } from 'react-router-dom';

function PlayerListAuth() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [playerForm, setPlayerForm] = useState({ 
    firstName: "", 
    lastName: "", 
    age: "", 
    teamId: "" 
  })
  const [updateForm, setUpdateForm] = useState({
    id: null,
    firstName: "", 
    lastName: "", 
    age: "", 
    leagueId: "", 
    teamId: "" 
  })
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players', { withCredentials: true });
        setPlayers(response.data.players || [])
        console.log(response.data.players)
      } catch (error) {
        console.error("Error fetching players:", error)
      };
    };
    fetchPlayers();
  }, []);


      // ✅ Fetch all teams separately
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams', { withCredentials: true });
        setTeams(response.data.teams || []);
        console.log(response.data.teams)
      } catch (error) {
        console.error("Error fetching leagues:", error);
      }
    };
    fetchTeams();
  }, []);


  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    
    const formData = {
      ...playerForm,
      age: playerForm.age === "" ? null : Number(playerForm.age),
      teamId: playerForm.teamId === "" ? null : Number(playerForm.teamId)
    };
    try {
      const response = await axios.post(`/api/players`, formData,
        { withCredentials: true });
      setPlayers([...players, response.data.player]);
      setPlayerForm({ firstName: "", lastName: "", age: "", teamId: ""})
      setMessage(`${response.data.player.firstName} created successfully`);
      setIsModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  const openUpdateModal = (player) => {
    setUpdateForm({ id: player.id, firstName: player.firstName, lastName: player.lastName, age: player.age, teamId: player.teamid });
    setIsUpdateModalOpen(true);
  };

const handleUpdatePlayer = async (e) => {
  e.preventDefault();
  try {
    await axios.put(`/api/players/${updateForm.id}`, {
      firstName: updateForm.firstName,
      lastName: updateForm.lastName,
      age: updateForm.age,
      teamId: updateForm.teamId
    }, { withCredentials: true });

    // ✅ Refetch all players to get the latest data with updated teams
    const response = await axios.get('/api/players', { withCredentials: true });
    setPlayers(response.data.players || []);

    setMessage("Player updated successfully");
    setIsUpdateModalOpen(false);
    setTimeout(() => setMessage(''), 3000);
  } catch (error) {
    console.error('Error updating player:', error);
  }
};





  // ✅ Delete Player
  const handleDeletePlayer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this player?")) return;
    try {
      const response = await axios.delete(`/api/players/${id}`, { withCredentials: true });
      if (response.data.success) {
        setPlayers(players.filter(player => player.id !== id));
        setMessage("PLayer deleted successfully");
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };


  return (
    <div className="playerList_auth">
      <button className="add-player-btn" onClick={() => setIsModalOpen(true)}>Add Player</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Player</h3>
          <form onSubmit={handleCreatePlayer}>
            <input 
            type= "text"
            name="firstName"
            value={playerForm.firstName}
            onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value})}
            placeholder= "Enter first name"
            required
            />
            <input 
            type= "text"
            name="lastName"
            value={playerForm.lastName} 
            onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value})}
            placeholder="Enter last name"
            />
            <input 
            type="number"
            name="age"
            value={playerForm.age}
            onChange={(e) => setPlayerForm({ ...playerForm, age: e.target.value ? Number(e.target.value) : "" })}
            placeholder="Enter age" 
            />
            <select 
            value={playerForm.teamId}
            onChange={(e) => setPlayerForm({...playerForm, teamId: e.target.value })}
            >
              <option value="" disabled>Select a team</option>
              {teams.map((team)=> (
                <option key={team.id} value={team.id}>{team.name}</option>
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
              <form onSubmit={handleUpdatePlayer}>
                <input 
            type= "text"
            name="firstName"
            value={updateForm.firstName}
            onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value})}
            placeholder= "Enter first name"
            required
            />
            <input 
            type= "text"
            name="lastName"
            value={updateForm.lastName} 
            onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value})}
            placeholder="Enter last name"
            />
            <input 
            type="number"
            name="age"
            value={updateForm.age}
            onChange={(e) => setUpdateForm({ ...updateForm, age: e.target.value ? Number(e.target.value) : "" })}
            placeholder="Enter age" 
            />
            <select 
            value={updateForm.teamId}
            onChange={(e) => setUpdateForm({...updateForm, teamId: e.target.value })}
            >
              <option value="" disabled>Select a team</option>
              {teams.map((team)=> (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
                <button type="submit">Update</button>
                <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}

      {message && <p className="message">{message}</p>}

              <table className="player-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Team</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr><td colSpan="2">No players available</td></tr>
            ) : (
              players.map((player) => (
                <tr key={player.id}>
                  <td>
                    <NavLink to={`/players/${player.id}`}>{player.firstName} {player.lastName}</NavLink>
                  </td>
                  <td>
                    {player.age ? player.age : "N/A"}
                  </td>
                  <td>
                  <NavLink to={`/teams/${player.team.id}`}>{player.team.name}</NavLink>
                  </td>
                  <td>
                    <button className="update-btn" onClick={() => openUpdateModal(player)}>Update</button>
                    <button className="delete-btn" onClick={() => handleDeletePlayer(player.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
    </div>
  )
};

export default PlayerListAuth
