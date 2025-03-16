import React, { useEffect, useState } from 'react';
import './ScheduleAuth.css';
import api from '@api'; // Instead of ../../../utils/api
import { NavLink } from 'react-router-dom';

function ScheduleAuth() {
  const [games, setGames] = useState([]);
  const [leagues, setLeagues] = useState([]); // ✅ Store leagues
  const [selectedLeague, setSelectedLeague] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get('/api/games');
        console.log(response.data);
        setGames(response.data.games); // ✅ Store only games array
      } catch (error) {
        console.log("Error fetching games:", error);
      }
    };

    const fetchLeagues = async () => {
      try {
        const response = await api.get('/api/leagues'); // ✅ Fetch all leagues
        console.log("Leagues:", response.data.leagues);
        setLeagues(response.data.leagues); // ✅ Store leagues
      } catch (error) {
        console.log("Error fetching leagues:", error);
      }
    };

    fetchGames();
    fetchLeagues();
  }, []);

  // ✅ Find league name by leagueId
  const getLeagueName = (leagueId) => {
    const league = leagues.find((l) => l.id === leagueId);
    return league ? league.name : `League ${leagueId}`;
  };

  // ✅ Extract unique leagues with names
  const uniqueLeagues = [...new Set(games.map(game => game.leagueId))];

  // ✅ Filter games by selected league
  const filteredGames = selectedLeague
    ? games.filter(game => game.leagueId === Number(selectedLeague))
    : games; // Show all games if no league is selected

  return (
    <div className="schedule-container">
        <div className='schedule-league-name-container'>
          <h2>{selectedLeague ? leagues.find(l => l.id === parseInt(selectedLeague))?.name || "All Leagues" : "All Leagues"}</h2>
        <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
          <option value="">All Leagues</option>
          {uniqueLeagues.map((leagueId) => (
            <option key={leagueId} value={leagueId}>
              {getLeagueName(leagueId)} {/* ✅ Show league name */}
            </option>
          ))}
        </select>
        </div>

      <div className="schedule-game-container">
        <table className="schedule-game-container-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Matchup</th>
              <th>Results</th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.length === 0 ? (
              <tr><td colSpan="4">No games available</td></tr>
            ) : (
              filteredGames
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((game) => {
                  const homeTeam = game.homeTeam?.id === game.team1_id ? game.homeTeam : game.awayTeam;
                  const awayTeam = game.awayTeam?.id === game.team2_id ? game.awayTeam : game.homeTeam;
                  const homeScore = game.homeTeam?.id === game.team1_id ? game.score_team1 : game.score_team2;
                  const awayScore = game.awayTeam?.id === game.team2_id ? game.score_team2 : game.score_team1;

                  return (
                    <tr key={game.id}>
                      <td>{new Date(game.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                      <td>
                        <NavLink to={`/games/${game.id}`}>
                          {homeTeam?.name} vs {awayTeam?.name}
                        </NavLink>
                      </td>
                      <td>{homeScore} - {awayScore}</td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
      {/* ✅ League Filter Dropdown */}
    </div>
  );
}

export default ScheduleAuth;
