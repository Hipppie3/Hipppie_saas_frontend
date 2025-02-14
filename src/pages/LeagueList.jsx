import React, {useState, useEffect} from 'react'
import { NavLink } from 'react-router-dom';
import axios from 'axios'
import './LeagueList.css'


function League() {
  const [leagueForm, setLeagueForm] = useState({
    name: ""
  })
  const [leagues, setLeagues] = useState([]);
  const [message, setMessage] = useState("")

useEffect(() => {
  const fetchLeague = async () => {
    try {
      const response = await axios.get('/api/leagues', { withCredentials: true });

      if (!response.data.leagues || response.data.leagues.length === 0) {
        console.log("No leagues found.");
        setLeagues([]); // ✅ Explicitly set leagues to an empty array
        return;
      }

      console.log("Leagues:", response.data.leagues);
      setLeagues(response.data.leagues);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("No leagues exist yet."); // ✅ This is fine, no leagues exist
        setLeagues([]); // ✅ Handle as empty instead of error
      } else {
        console.error("Error fetching leagues:", error);
      }
    }
  };

  fetchLeague();
}, []);


  const handleLeague = (e) => {
    const {name, value} = e.target;
    setLeagueForm((prevForm) => ({...prevForm, [name]: value}))
  }
  const handleCreateLeague = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('api/leagues', leagueForm, {withCredentials: true})
      console.log(response.data)
      setLeagues((prevLeagues) => [...prevLeagues, response.data.league])
    } catch (error) {
      console.error('Error creating league:', error)
    }
  };

const handleDeleteLeague = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this league?");
  if (!confirmDelete) return;

  try {
    const response = await axios.delete(`/api/leagues/${id}`, { withCredentials: true });

    if (response.data.success) {
      setLeagues((prevLeagues) => prevLeagues.filter(league => league.id !== id)); // ✅ Filter out deleted league
      setMessage(`League ${id} deleted successfully`); // ✅ Set success message

      setTimeout(() => setMessage(''), 3000); // ✅ Clear message after 3 seconds
    } else {
      alert(response.data.message); // ✅ Show error message if deletion fails
    }
  } catch (error) {
    console.error('Error deleting league:', error);
    alert("Failed to delete league. Please try again.");
  }
};


  return (
    <div className="leagueList_container">
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
    {leagues.length === 0 ? (
      <div>
        <p>You don't have any leagues yet</p>
      </div>
    ) : (
      leagues.map((league) => (
        <div key={league.id}>
        <h2>
          <NavLink to={`/league/${league.id}`}>
          {league.name}
          </NavLink>
        </h2>
        <button onClick={()=> handleDeleteLeague(league.id)}>Delete</button>
        </div>
      ))
    )}
    </div>
  )
}

export default League
