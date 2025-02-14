import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

function Team() {
 const [team, setTeam] = useState([])
 const {id} = useParams();

 useEffect(() => {
  const fetchTeam = async () => {
   try{
    console.log('hi')
   const response = await axios.get(`/api/teams/${id}`)
   console.log(response.data.team)
   setTeam(response.data.team)
  } catch (error) {
   console.error('Error fetching team:', error)
  }}
  fetchTeam()
 },[])

  return (
    <div>
      {team.name}
    </div>
  )
}

export default Team
