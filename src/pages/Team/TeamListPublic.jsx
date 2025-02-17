import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useSearchParams } from 'react-router-dom';
import './TeamListPublic.css';

function TeamListPublic() {
 const [teams, setTeams] = useState([]);
 const [searchParams] = useSearchParams();
 const domain = searchParams.get("domain");

 useEffect(() => {
  const fetchTeams = async () => {
   try {
    const response = await axios.get(`/api/teams?domain=${domain}`);
    setTeams(response.data.teams || []);
    console.log(response.data.teams)
   } catch (error) {
    console.error("Error fetching teams:", error);
   }
  };
  fetchTeams();
 }, [])

  return (
    <div className="teamList_public">
     {teams.length === 0 ? (
      <p>No teams available</p>
     ) : (
      <div className="public-team-list">
       {teams.map((team) => (
        <div key={team.id} className="team-item">
         <NavLink to={`/teams/${team.id}${domain ? `?domain=${domain}` : ""}`}>{team.name}</NavLink>
       </div>
       ))}
       </div>
     )}
    </div>
  );
}

export default TeamListPublic
