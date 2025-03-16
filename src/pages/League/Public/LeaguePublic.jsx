import api from '@api'; // Instead of ../../../utils/api
import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useSearchParams } from 'react-router-dom';
import './LeaguePublic.css';

function LeaguePublic() {
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [teams, setTeams] = useState([]);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain"); 
  const [error, setError] = useState("");

  useEffect(() => {
    const getLeague = async () => {
      try {
        const response = await api.get(`/api/leagues/${id}?domain=${domain}`);
        setLeagueInfo(response.data.league);
        console.log("League Data:", response.data.league);

        if (response.data.league?.teams) {
          setTeams(response.data.league.teams);
        }
      } catch (error) {
        console.error("Error fetching league:", error.response?.data || error.message);
        setError("Failed to fetch league");
      }
    };
    getLeague();
  }, [id, domain]);

  if (error) return <p>{error}</p>;

  return (
    <div className="league_public">

      {leagueInfo ? (
        <>
          <div className="league_title_container">
            <h2 className="league_title">{leagueInfo.name.toUpperCase()} STANDINGS</h2>
          </div>

          {teams.length === 0 ? (
            <p>No Teams</p>
          ) : (
            <div className="league_standings">
              <table>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>PCT</th>
                    <th>GB</th>
                    <th>STRK</th>
                    <th>PF</th>
                    <th>PA</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr key={team.id}>
                      <td>{index + 1}</td>
                      <td><NavLink to={`/teams/${team.id}${domain ? `?domain=${domain}` : ""}`}>{team.name}</NavLink></td>
                      <td>2</td>
                      <td>3</td>
                      <td>0.75</td>
                      <td>2</td>
                      <td>W4</td>
                      <td>190</td>
                      <td>100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p>No league found</p>
      )}
    </div>
  );
}

export default LeaguePublic;
