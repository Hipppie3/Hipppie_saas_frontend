import axios from 'axios';
import React, { useEffect, useState } from 'react'
import './StatAuth.css'

function Stats() {
 const [stats, setStats] = useState([]);
 const [sports, setSports] = useState([])
 const [selectedSportId, setSelectedSportId] = useState("");


 useEffect(() => {
  const fetchStats = async () => {
   try {
    const response = await axios.get(`/api/stats`)
    setStats(response.data)
    console.log(response.data)

   } catch (error) {
    console.error("Error fetching stats")
   }};
   fetchStats()
 },[])

 useEffect(() => {
  const fetchSports = async () => {
    try {
      const response = await axios.get('/api/sports')
      setSports(response.data)
      console.log(response.data)
     } catch (error) {
       console.error("Error fetching sports")
     }
   };
   fetchSports()
 }, [])

const updateSelectedSport = (e) => {
  setSelectedSportId(e.target.value)
}

  const filteredStats = stats.filter(stat => stat.sportId === Number(selectedSportId));
  return (
    <div className="statAuth-container">
      <select value={selectedSportId} onChange={updateSelectedSport}>
        <option value="">Choose a sport</option>
        {sports.map((sport)=> (
          <option value={sport.id}>{sport.name}</option>
        ))}
      </select>

      <div>
        {filteredStats.length > 0 ? (
          filteredStats.map((stat) => (
            <div key={stat.id}>
              <h3>{stat.name}</h3>
            </div>
          ))
        ) : (
          <p>Select a sport to see stats</p>
        )}
      </div>
    </div>
  )
}

export default Stats
