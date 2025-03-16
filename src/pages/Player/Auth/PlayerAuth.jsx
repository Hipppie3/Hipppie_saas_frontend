import React, {useState, useEffect} from 'react'
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import './PlayerAuth.css';
import DefaultImage from '../../../images/default_image.png';

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
          response = await api.get(`/api/players/${id}`, { withCredentials: true});
        } else {
          response = await api.get(`/api/players/${id}`, { withCredentials: true});
        }
      } else if (domain) {
        response = await api.get(`/api/players/${id}?domain=${domain}`)
      } else {
        return setError("Unauthorized access")
      } 
      setPlayer(response.data.player)
      console.log(response.data.player)
    } catch (error) {
      console.error("Error fetching player:", error.response?.data || error.message);
      setError("Failed to fetch player:", error)
    }
  };
  getPlayer()
 },[id, domain, isAuthenticated, loading])

 {console.log(player.image?.length)}
 
  return (
    <div className="playerAuth_profile">
      <img
        src={player.image || DefaultImage} // ✅ Use DefaultImage when player.image is null/empty
        alt={`${player.firstName} ${player.lastName}`}
        className="player-image"
        style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
      />
      
      <h2>{player.firstName} {player.lastName}</h2>
      <p><strong>Age:</strong> {player.age ? player.age : "N/A"}</p>

      {/* Display Team & League */}
      <p>
        <strong>Team:</strong>{" "}
        {player.team ? (
          <NavLink to={`/teams/${player.team.id}`} className="team-link">{player.team.name}</NavLink>
        ) : "No team assigned"}
      </p>
    </div>
  );
}

export default PlayerAuth;
