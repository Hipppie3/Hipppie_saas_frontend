import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TeamList() {
 const [leagues, setLeagues] = useState([]);

useEffect(() => {
 const fetchLeagues = async () => {
  try{
  const response = await axios.get('/api/leagues', { withCredentials: true });
  console.log(response.data.leagues)
  setLeagues(response.data.leagues)
 } catch (error) {
  console.error('Error fetching teams:', error);
 }
};
 fetchLeagues();
},[])


  return (
    <div>
      {leagues.map((league) => (
        <div key={league.id}>
          <h3>{league.name} League</h3>
          <h5>{league.teams.map((team) => (
            <ul>
              <li>{team.name}</li>
            </ul>
          ))}</h5>
        </div>
      ) )}
    </div>
  )
}

export default TeamList
