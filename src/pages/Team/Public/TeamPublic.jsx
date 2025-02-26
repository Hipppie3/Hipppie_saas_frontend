import React, { useState, useEffect } from 'react';
import './TeamPublic.css';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';


function TeamPublic() {
  const [team, setTeam] = useState(null);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  const [error, setError] = useState("");

  useEffect(() => {
    const getTeam = async () => {
      try {
        const response = await axios.get(`/api/teams/${id}?domain=${domain}`, { withCredentials: true });
        setTeam(response.data.team);
        console.log("Team Data:", response.data.team);
      } catch (error) {
        console.error("Error fetching team:", error.response?.data || error.message);
        setError("Failed to fetch team");
      }
    };
    getTeam();
  }, [id, domain]);

  return (
    <div className="team_public">

      {team?.players?.length > 0 ? (
        team.players.map((player) => 
        <p key={player.id}>
        <NavLink to={`/players/${player.id}${domain ? `?domain=${domain}` : ""}`}>
          {player.firstName}
        </NavLink>
        </p>)
      ) : (
        <p>No players available</p>
      )}
    </div>
  );
}

export default TeamPublic;
