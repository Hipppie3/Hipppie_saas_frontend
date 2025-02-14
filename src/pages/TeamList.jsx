import React, {useState, useEffect} from 'react'
import axios from 'axios';
import { NavLink } from 'react-router-dom';


function TeamList() {
  const [teams, setTeams] = useState([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchTeams = async() => {
      try {
        const response = await axios.get('/api/teams', { withCredentials: true })
        console.log(response.data)
        setTeams(response.data.teams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
    fetchTeams()
  },[])

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
      {teams.length === 0 ? (
        <p>No teams</p>
      ) : (
        <div>
          <h3>Teams</h3>
          {teams.map((team) => (
            <div key={team.id}>
              <NavLink to={`/teams/${team.id}`}>{team.name}</NavLink>
              <button onClick={() => handleDeleteTeam(team.id)}>Delete Team</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeamList
