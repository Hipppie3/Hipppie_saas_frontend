import React, { useState, useEffect } from 'react';
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useSearchParams } from 'react-router-dom';
import './LeagueListPublic.css';

function LeagueListPublic() {
  const [leagues, setLeagues] = useState([]);
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await api.get(`/api/leagues?domain=${domain}`);
        setLeagues(response.data.leagues || []);
        console.log(response.data.leagues)
      } catch (error) {
        console.error("Error fetching leagues:", error);
      }
    };
    fetchLeagues();
  }, [domain]);

  return (
    <div className="leagueList_public">

      {leagues.length === 0 ? (
        <p>No leagues available</p>
      ) : (
        <div className="public-league-list">
          {leagues.map((league) => (
            <div key={league.id} className="league-item">
              <NavLink to={`/leagues/${league.id}${domain ? `?domain=${domain}` : ""}`}>{league.name}</NavLink>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeagueListPublic;
