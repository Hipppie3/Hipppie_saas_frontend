import React, {useState, useEffect} from 'react'
import axios from 'axios';
import { NavLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'


function TeamList() {
  const { isAuthenticated, loading, user } = useAuth(); // ✅ Add `loading` to track auth state
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({ name: "" });
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain"); // ✅ Extract domain from query params
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading) return;

    const fetchTeams = async() => {
      try {
      let response;
      if (isAuthenticated) {
        if (user?.role === "super_admin") {
          response = await axios.get('/api/teams', { withCredentials: true });
        } else {
          response = await axios.get('/api/teams', { withCredentails: true });
        }
      } else if (domain) {
        response = await axios.get(`/api/teams?domain=${domain}`);
      } else {
        return;
      }
      setTeams(response.data.teams || [])
      } catch (error) {
        console.error("Error fetching teams:", error.response?.data || error.message);
      }
    }
    fetchTeams();
  },[domain, isAuthenticated, loading])

  // ✅ Handle Form Input for Creating League
  const handleTeam = (e) => {
    const { name, value } = e.target;
    setTeamForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // ✅ Create League (Only for Logged-in Users)
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/teams', teamForm, { withCredentials: true });
      setTeams((prevTeams) => [...prevTeams, response.data.team]);
      setTeamForm({ name: "" });
      setMessage(`${response.data.team.name} created successfully`)
      setTimeout(() => setMessage(''), 3000)
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
    <div className="teamList_container">
      {isAuthenticated && (
        <form onSubmit={handleCreateTeam}>
          <label>
            Create Team
            <input 
              type="text"
              name="name"
              value={teamForm.name}
              onChange={handleTeam}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      )}
      {console.log(message)}
      {message && <p>{message}</p>}
      {teams.length === 0 ? (
        <p>No teams available</p>
      ) : (
        teams.map((team) => (
          <div key={team.id}>
            <h2>
            <NavLink to={`/site/team/${team.id}${domain ? `?domain=${domain}` : ""}`}>
              {team.name}
            </NavLink>
            </h2>
            {isAuthenticated && (
              <button onClick={() => handleDeleteTeam(team.id)}>Delete</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default TeamList
