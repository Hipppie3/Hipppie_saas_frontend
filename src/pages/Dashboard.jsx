import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateLeague from '../CreateForm/CreateLeague';
import axios from 'axios';

function Dashboard() {
  const { user, loading } = useAuth(); // ✅ Also get loading state
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);
  const [successDeleteMessage, setSuccessDeleteMessage] = useState('')

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
    navigate('/login'); // ✅ Redirect only after checking auth
    }
  }, [user, loading, navigate]);
  
    useEffect(() => {
    if (user) {
      fetchLeague();
    }
  }, [user]);



  const fetchLeague = async () => {
    try {
      console.log("Fetching leagues..."); // ✅ Debugging
      const response = await axios.get("/api/leagues", { withCredentials: true });
      console.log("Fetched Leagues:", response.data); // ✅ Debugging
      setLeagues(response.data.leagues)
    } catch (error) {
      console.error("Error fetching league:", error);
    }
  };



  // ✅ Prevent error by showing loading state before rendering
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Redirecting...</p>;
  }


  const handleDelete = async (leagueName, leagueId) => {
  const confirmLeagueDeletion = window.confirm(`Are you sure you want to delete this ${leagueName} league?`);
  if (!confirmLeagueDeletion) return;
  
  try {
  await axios.delete(`/api/leagues/${leagueId}`, { credentials: 'include'});
    setLeagues(leagues => leagues.filter(league => league.id !== leagueId ));
    setSuccessDeleteMessage(`League ${leagueName} deleted successfully`)
    setTimeout(() => setSuccessDeleteMessage(""), 3000);
    console.log(`League ${leagueName} deleted successsfully`)
  } catch (error) {
    console.error('Error deleting league:', error.response ? error.response.data : error.message);
  }      
}

  return (
    <div>
      <h2>WELCOME {user.username}!</h2>
      <CreateLeague onLeagueCreated={fetchLeague} />

      {leagues.length === 0 ? (
        <div>
          <p>You don't have any leagues yet. Start by creating one!</p>
        </div>
      ) : (
        <div>
          <h3>Your Leagues</h3>
          <ul>
            {leagues.map((league) => (
              <div key={league.id}>
              <li>{league.name}</li>
              <button onClick={() => handleDelete(league.name, league.id)}>DELETE</button>
              </div>
            ))}
          </ul>
        </div>
      )}
                {successDeleteMessage && 
          <p style={{color: "green"}}>{successDeleteMessage} </p>
          }
    </div>
  );
}

export default Dashboard;
