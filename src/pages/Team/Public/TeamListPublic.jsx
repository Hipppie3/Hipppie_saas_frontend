import React, { useState, useEffect } from 'react';
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useSearchParams } from 'react-router-dom';
import './TeamListPublic.css';

function TeamListPublic() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [loading, setLoading] = useState(true); // ✅ Add loading state
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get(`/api/teams?domain=${domain}`);
        setTeams(response.data.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [domain]);

  const uniqueLeagues = [...new Map(
    teams.map(team => [team.league.id, team.league.name])
  )].map(([id, name]) => ({ id, name }));

const filteredTeams = selectedLeague
    ? teams.filter(team => team.league?.id === Number(selectedLeague))
    : teams;

  if (loading) return null;

  console.log(uniqueLeagues)
  return (
    <div className="teamListPublic-container">
      <div className='teamPublic-league-name-container'>
        <h2 className="teamPublic-league-title">
          <select id="league-filter" value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
            <option value="">All Leagues</option>
            {uniqueLeagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </h2>
      </div>

      {filteredTeams.length > 0 ? (
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
              {[...filteredTeams]
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
                      <NavLink to={`/teams/${team.id}${domain ? `?domain=${domain}` : ""}`}>
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
