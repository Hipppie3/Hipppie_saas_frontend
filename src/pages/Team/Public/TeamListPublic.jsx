import React, { useState, useEffect } from 'react';
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useSearchParams } from 'react-router-dom';
import './TeamListPublic.css';

function TeamListPublic() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("")
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/leagues-teams`);
        console.log("Optimized response:", response.data);
        setLeagues(response.data.leagues || []);
        setTeams(response.data.teams || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);



  const getLeagueName = (leagueId) => {
    const league = leagues.find((l) => l.id === leagueId);
    return league ? league.name : `League ${leagueId}`;
  };

  // ✅ Extract unique leagues with names
  const uniqueLeagues = [...new Set(teams.map(team => team.league?.id))];

  const filteredTeams = selectedLeague
    ? teams.filter(team => team.league.id === Number(selectedLeague)) // ✅ Now matches the correct structure
    : teams;


  
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

      {filteredTeams.length === 0 ? (
        <p>No teams available</p>
      ) : (
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
                      ? ((team.wins / (team.wins + team.losses)) * 1).toFixed(3) // ✅ Calculate Win %
                      : "0.00", // ✅ If no games played, set to 0%
                  }))
                  .sort((a, b) => b.winPercentage - a.winPercentage) // ✅ Sort by Win %
                  .map((team, index) => ( // ✅ Assign position based on sorted order
                    <tr key={team.id}>
                      <td>{index + 1}</td> {/* ✅ Position based on Win % ranking */}
                      <td>
                        <NavLink to={`/teams/${team.id}${domain ? `?domain=${domain}` : ""}`}>
                          {team.name}
                        </NavLink>
                      </td>
                      <td>{team.wins}</td>
                      <td>{team.losses}</td>
                      <td>{team.winPercentage}</td> {/* ✅ Show Win % */}
                    </tr>
                  ))}
              </tbody>

            </table>
        </div>
      )}
      </div>
  );
}

export default TeamListPublic
