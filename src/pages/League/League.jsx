import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function League() {
  const { isAuthenticated, loading, user } = useAuth(); // ✅ Add auth state
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '' });
  const [teams, setTeams] = useState([]);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain"); // ✅ Extract domain for public users
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      // ✅ If teams are included in league data, use them directly
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



  const handleTeamForm = (e) => {
    const { name, value } = e.target;
    setTeamForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const submitTeam = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return setError("Unauthorized action"); // ✅ Prevent public users from creating teams
    }
    try {
      const response = await axios.post(`/api/leagues/${id}/teams`, teamForm, { withCredentials: true });
      if (response.data.team) { // ✅ Ensure response contains the new team
        setTeams((prevTeams) => [...prevTeams, response.data.team]); // ✅ Update teams immediately
      }
      setTeamForm({ name: '' });
      setMessage(`${response.data.team.name} created successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating team:', error);
      setError("Failed to create team");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!isAuthenticated) {
      return setError("Unauthorized action"); // ✅ Prevent public users from deleting teams
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this team?");
    if (!confirmDelete) return;
    try {
      const response = await axios.delete(`/api/teams/${teamId}`, { withCredentials: true });
      if (response.data.success) {
        setTeams((prevTeams) => prevTeams.filter(team => team.id !== teamId));
        setMessage("Team deleted successfully");
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert("Failed to delete team. Please try again");
    }
  };

  if (loading) return <p>Loading league...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {leagueInfo ? (
        <>
          <h2>League: {leagueInfo.name}</h2>

          {isAuthenticated && (
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
          )}

          {message && <p>{message}</p>}

          <h2>Teams</h2>
          {teams.length === 0 ? (
            <p>No Teams</p>
          ) : ( 
            teams.map((team) => (
              <div key={team.id}>
                <NavLink to={`/teams/${team.id}${domain ? `?domain=${domain}` : ""}`}>{team.name}</NavLink>
                {isAuthenticated && <button onClick={() => handleDeleteTeam(team.id)}>Delete</button>}
              </div>
            ))
          )}
        </>
      ) : (
        <p>No league found</p>
      )}
    </div>
  );
};

export default League;
