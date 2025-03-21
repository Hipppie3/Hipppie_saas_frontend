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
    const fetchData = async () => {
      try {
        const [teamsResponse, leaguesResponse] = await Promise.all([
          api.get(`/api/teams/teamsTest`),
          api.get(`/api/leagues/leaguesTest`)
        ]);
        setTeams(teamsResponse.data.teams || []);
        setLeagues(leaguesResponse.data.leagues || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // ✅ Set loading to false once both requests finish
      }
    };

    fetchData();
  }, []);

  const getLeagueName = (leagueId) => {
    const league = leagues.find((l) => l.id === leagueId);
    return league ? league.name : `League ${leagueId}`;
  };

  const uniqueLeagues = [...new Set(teams.map(team => team.leagueId))];
  console.log(teams)

  const filteredTeams = selectedLeague
    ? teams.filter(team => team.leagueId === Number(selectedLeague))
    : teams;

  // ✅ Completely hide everything until data is loaded
  if (loading) return null;

  return (
    <div className="teamListPublic-container">
      <div className='teamPublic-league-name-container'>
        <h2 className="teamPublic-league-title">
          <select id="league-filter" value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
            <option value="">All Leagues</option>
            {uniqueLeagues.map((leagueId) => (
              <option key={leagueId} value={leagueId}>
                {getLeagueName(leagueId)}
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
