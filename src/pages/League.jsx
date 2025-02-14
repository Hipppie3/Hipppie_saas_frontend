import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';

function League() {
  const [leagueInfo, setLeagueInfo] = useState({});
  const [teamForm, setTeamForm] = useState({name: ''})
  const [teams, setTeams] = useState([]);
  const { id } = useParams();
  const [message, setMessage] = useState("");

  const getLeague = async () => {
    try {
      console.log("Fetching league for ID:", id);
      const response = await axios.get(`/api/leagues/${id}`, { withCredentials: true });
      setLeagueInfo(response.data.league);
      console.log("League:", response.data);
    } catch (error) {
      console.error("Error fetching league:", error);
    }
  };

const getTeams = async () => {
  try {
    console.log("Fetching teams for league ID:", id);
    const teamResponse = await axios.get(`/api/leagues/${id}/teams`, { withCredentials: true });

    if (!teamResponse.data.teams || teamResponse.data.teams.length === 0) {
      console.log("No teams found.")
      setTeams([]);
      return;
    }
    
    console.log("Teams:", teamResponse.data);
    setTeams(teamResponse.data.teams);

  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("No teams exist yet");
      setTeams([]); // Ensure teams state is empty instead of undefined
    } else {
      console.error("Unexpected error fetching teams:", error);
    }
  }
};

  useEffect(() => {
    getLeague();
    getTeams();
}, [id]); // ✅ Now updates if `id` changes


  const handleTeamForm = (e) => {
    const {name, value} = e.target;
    setTeamForm((prevForm) => ({...prevForm, [name]: value}))
  } 

const submitTeam = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`/api/leagues/${id}/teams`, teamForm, { withCredentials: true });
    getTeams(''); // ✅ Refresh teams after creating one
    setTeamForm({name: ''})
  } catch (error) {
    console.error('Error creating team:', error);
  }
};

const handleDeleteTeam = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this league?");
  if (!confirmDelete) return;

  try {
    const response = await axios.delete(`/api/teams/${id}`, {withCredentials: true})

    if (response.data.success) {
      setTeams((prevTeams) => prevTeams.filter(team => team.id !== id));
      setMessage(`League ${id} deleted successfully`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      alert(response.data.message)
    }
  } catch (error) {
    console.error('Error deleting team:', error);
    alert("Failed to delete team. Please try again")
  }
};

  return (
    <div>
      <h2>League: {leagueInfo.name}</h2>
      <div>
        <form onSubmit={submitTeam}>
          <label>Create Team  
            <input 
            type='text'
            name='name'
            value={teamForm.name}
            onChange={handleTeamForm}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
      <div>
      <h2>Teams</h2>
      
      
      {teams.length === 0 ? (
        <p>No Teams</p>
      ) : ( 
      teams.map((team) => (
        <div key={team.id}> {/* ✅ Added key */}
          <NavLink to={`/teams/${team.id}`}>{team.name} </NavLink>
          <button onClick={() => handleDeleteTeam(team.id)}>Delete</button>
        </div>
      ))
    )}

      </div>
    </div>
  );
};

export default League;
