import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LeagueList from '../League/LeagueList'

function SportAuth() {
 const [sport, setSport] = useState([])
 const {id} = useParams();

 useEffect(() => {
  const fetchSport = async () => {
   try {
    const response = await axios.get(`/api/sports/${id}`)
    console.log(response.data)
    setSport(response.data)
   } catch(error) {
    console.error("Error fetching sport:", error)
   }
  };
  fetchSport()
 },[]);


  return (
    <div>
      <LeagueList />
    </div>
  )
}

export default SportAuth
