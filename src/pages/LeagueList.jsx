import React, { useState, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function LeagueList() {
  const { isAuthenticated, loading, user } = useAuth(); // ✅ Add `loading` to track auth state
  const [leagues, setLeagues] = useState([]);
  const [leagueForm, setLeagueForm] = useState({ name: "" });
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain"); // ✅ Extract domain from query params
  const [message, setMessage] = useState("");


useEffect(() => {
  if (loading) return; // ✅ Wait for auth state to resolve

  const fetchLeagues = async () => {
    try {
      let response;
      if (isAuthenticated) {
        if (user?.role === "super_admin") {
          response = await axios.get('/api/leagues', { withCredentials: true }); // ✅ Fetch all leagues
        } else {
          response = await axios.get('/api/leagues', { withCredentials: true }); // ✅ Fetch user-specific leagues
        }
      } else if (domain) {
        response = await axios.get(`/api/leagues?domain=${domain}`); // ✅ Fetch leagues by domain for public users
      } else {
        return; // ✅ No unnecessary API call if no conditions match
      }
      setLeagues(response.data.leagues || []);
    } catch (error) {
      console.error("Error fetching leagues:", error.response?.data || error.message);
    }
  };

  fetchLeagues();
}, [domain, isAuthenticated, loading]); // ✅ Add dependencies


  // ✅ Handle Form Input for Creating League
  const handleLeague = (e) => {
    const { name, value } = e.target;
    setLeagueForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // ✅ Create League (Only for Logged-in Users)
  const handleCreateLeague = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/leagues', leagueForm, { withCredentials: true });
      setLeagues((prevLeagues) => [...prevLeagues, response.data.league]);
      setLeagueForm({ name: "" });
      setMessage(`${response.data.league.name} created successfully`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error creating league:', error);
    }
  };

  // ✅ Delete League (Only for Logged-in Users)
  const handleDeleteLeague = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this league?");
    if (!confirmDelete) return;
    try {
      const response = await axios.delete(`/api/leagues/${id}`, { withCredentials: true });
      if (response.data.success) {
        setLeagues((prevLeagues) => prevLeagues.filter(league => league.id !== id));
        setMessage(`League ${id} deleted successfully`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      alert("Failed to delete league. Please try again.");
    }
  };

  // ✅ Ensure UI updates after login/logout
  if (loading) {
    return <p>Loading leagues...</p>;
  }

  return (
    <div className="leagueList_container">
      {isAuthenticated && (
        <form onSubmit={handleCreateLeague}>
          <label>
            Create League
            <input 
              type="text"
              name="name"
              value={leagueForm.name}
              onChange={handleLeague}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      )}
      {console.log(message)}
      {message && <p>{message}</p>}
      {leagues.length === 0 ? (
        <p>No leagues available</p>
      ) : (
        leagues.map((league) => (
          <div key={league.id}>
            <h2>
            <NavLink to={`/site/league/${league.id}${domain ? `?domain=${domain}` : ""}`}>
              {league.name}
            </NavLink>
            </h2>
            {isAuthenticated && (
              <button onClick={() => handleDeleteLeague(league.id)}>Delete</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default LeagueList;
