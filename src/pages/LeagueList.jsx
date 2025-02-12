import React, {useState, useEffect} from 'react'
import { NavLink } from 'react-router-dom';
import axios from 'axios'

function League() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const response = await axios.get('/api/leagues', { withCredentials: true });
        console.log("leagues:", response.data.leagues)
        setLeagues(response.data.leagues)
      } catch (error) {
        console.error('Error fetching league:', error)
      }
    }
    fetchLeague()
  }, []);

  return (
    <div>
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
        </div>
      ))
    )}
    </div>
  )
}

export default League
