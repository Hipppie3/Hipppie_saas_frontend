import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateLeague from './CreateLeague';

function HomeDashboard() {
  const { user, loading } = useAuth(); // ✅ Also get loading state
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login'); // ✅ Redirect only after checking auth
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLeagues();
    }
  }, [user]);

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues', { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        setLeagues(data.leagues);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  // ✅ Prevent error by showing loading state before rendering
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Redirecting...</p>;
  }

  return (
    <div>
      <h2>WELCOME {user.username}!</h2>

      {leagues.length === 0 ? (
        <div>
          <p>You don't have any leagues yet. Start by creating one!</p>
          <CreateLeague onLeagueCreated={fetchLeagues} />
        </div>
      ) : (
        <div>
          <h3>Your Leagues</h3>
          <ul>
            {leagues.map((league) => (
              <li key={league.id}>{league.name}</li>
            ))}
          </ul>
          <CreateLeague onLeagueCreated={fetchLeagues} />
        </div>
      )}
    </div>
  );
}

export default HomeDashboard;
