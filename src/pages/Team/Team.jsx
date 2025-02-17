import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Team.css'

function Team() {
  const {isAuthenticated, loading, user} = useAuth()
  const [team, setTeam] = useState([])
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()
  const domain = searchParams.get("domain"); // ✅ Extracts actual domain value
  const {id} = useParams();

 useEffect(() => {
  if (loading) return

  const getTeam = async () => {
    try {
      console.log("Fetching team for ID:", id);
      let response;

      if (isAuthenticated) {
        if (user?.role === "super_admin") {
          response = await axios.get(`/api/teams/${id}`, { withCredentials: true});
        } else {
          response = await axios.get(`/api/teams/${id}`, { withCredentials: true});
        }
      } else if (domain) {
        response = await axios.get(`/api/teams/${id}?domain=${domain}`)
      } else {
        return setError("Unauthorized access")
      } 
      setTeam(response.data.team)
      console.log(response.data.team)
    } catch (error) {
      console.error("Error fetching team:", error.response?.data || error.message);
      setError("Failed to fetch team")
    }
  };
  getTeam()
 },[id, domain, isAuthenticated, loading])

  return (
    <div className={isAuthenticated ? "team_auth" : "team_public"}>
      {team.name}
    </div>
  )
}

export default Team
