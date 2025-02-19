import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Player() {
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
      console.error("Error fetching team:", error.response?.data || error.message);
      setError("Failed to fetch team")
    }
  };
  getPlayer()
 },[id, domain, isAuthenticated, loading])

  return (
    <div className={isAuthenticated ? "player_auth" : "player_public"}>
      {player.firstName}
    </div>
  )
}

export default Player
