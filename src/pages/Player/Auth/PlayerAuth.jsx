import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { NavLink, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import './PlayerAuth.css';

function PlayerAuth() {
  const {isAuthenticated, loading, user} = useAuth()
  const [player, setPlayer] = useState([])
  const [searchParams] = useSearchParams()
  const domain = searchParams.get("domain")
  const [error, setError] = useState("")
  const { id } = useParams();

  useEffect(() => {
  if (loading) return 

  const getPlayer = async () => {
    try {
      let response;
      if (isAuthenticated) {
        if (user?.role === "super_admin") {
          response = await axios.get(`/api/players/${id}`, { withCredentials: true});
        } else {
          response = await axios.get(`/api/players/${id}`, { withCredentials: true});
        }
      } else if (domain) {
        response = await axios.get(`/api/players/${id}?domain=${domain}`)
      } else {
        return setError("Unauthorized access")
      } 
      setPlayer(response.data.player)
      console.log(response.data.player)
    } catch (error) {
      console.error("Error fetching player:", error.response?.data || error.message);
      setError("Failed to fetch player")
    }
  };
  getPlayer()
 },[id, domain, isAuthenticated, loading])

  return (
    <div className="player_auth">
      {player.image ? (
        <img
          src={player.image}
          alt={`${player.firstName} ${player.lastName}`}
          className="player-image"
          style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
        />
      ) : (
        <div className="placeholder-image">No Image</div>
      )}
      <h2>{player.firstName} {player.lastName}</h2>
      <p><strong>Age:</strong> {player.age ? player.age : "N/A"}</p>

      {/* Display Team & League */}
      <p>
        <strong>Team:</strong>{" "}
        {player.teams ? (
          <NavLink to={`/teams/${player.teams.id}`} className="team-link">{player.teams.name}</NavLink>
        ) : "No team assigned"}
      </p>
    </div>
  );
}

export default PlayerAuth;
