import React, { useState, useEffect } from 'react';
import api from '@api';
import { NavLink} from 'react-router-dom';
import './TeamListPublic.css';
import useDomainInfo from '@useDomainInfo';

function TeamListPublic() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [loading, setLoading] = useState(true);
 
const { slug, domain } = useDomainInfo();



  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        if (!slug && !domain) {
  console.warn("No slug or domain available, skipping fetch");
  return;
}

        const response = await api.get(`/api/leagues/leaguesTeam`, {
          params: slug ? { slug } : { domain }
        });
        const filteredLeagues = response.data.leagues.filter(
          (league) => league.season && league.season.isActive && league.teams.length > 0
        );

        setLeagues(filteredLeagues || []);
        if (filteredLeagues.length > 0) {
          setSelectedLeague(String(filteredLeagues[0].id)); // Set default selected league
        }
      } catch (error) {
        console.error("Error fetching leagues with teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [domain, slug]);


  const selectedLeagueObj = selectedLeague
    ? leagues.find(l => l.id === Number(selectedLeague))
    : null;

  const teams = selectedLeagueObj
    ? selectedLeagueObj.teams
    : leagues.flatMap(league => league.teams);

  if (loading) return null;
console.log(leagues)
  return (
    <div className="teamListPublic-container">
      <div className="teamPublic-league-name-container">
        <h2 className="teamPublic-league-title">
          <select
            id="league-filter"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </h2>
      </div>

      {teams.length > 0 ? (
        <div className="teamPublic-table-container">
          <table className="teamPublic-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Team</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {[...teams]
                .map(team => ({
                  ...team,
                  winPercentage: team.wins + team.losses > 0
                    ? ((team.wins / (team.wins + team.losses)) * 1).toFixed(3)
                    : "0.00",
                }))
                .sort((a, b) => b.winPercentage - a.winPercentage)
                .map((team, index) => (
                  <tr key={team.id}>
                    <td>{index + 1}</td>
                    <td>
                      <NavLink to={slug ? `/${slug}/players/${player.id}` : `/players/${player.id}`}>
                        {team.name}
                      </NavLink>
                    </td>
                    <td>{team.wins}</td>
                    <td>{team.losses}</td>
                    <td>{team.winPercentage}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No teams available</p>
      )}
    </div>
  );
}

export default TeamListPublic;
