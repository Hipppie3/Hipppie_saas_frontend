import React, { useEffect, useState } from 'react';
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useSearchParams } from 'react-router-dom';
import './SchedulePublic.css'
import { format } from 'date-fns';

function SchedulePublic() {
 const [games, setGames] = useState([]);
 const [leagues, setLeagues] = useState([]); // ✅ Store leagues
 const [selectedLeague, setSelectedLeague] = useState("");
const [searchParams] = useSearchParams();
const [loading, setLoading] = useState(true)
const domain = searchParams.get("domain");

 useEffect(() => {
  const fetchGames = async () => {
   try {
    const response = await api.get(`/api/games?domain=${domain}`);
    console.log(response.data);
    setGames(response.data.games); // ✅ Store only games array
   } catch (error) {
    console.log("Error fetching games:", error);
   } finally {
    setLoading(false)
   }
  };

  const fetchLeagues = async () => {
   try {
    const response = await api.get(`/api/leagues?domain=${domain}`); // ✅ Fetch all leagues
    console.log("Leagues:", response.data.leagues);
    setLeagues(response.data.leagues); // ✅ Store leagues
   } catch (error) {
    console.log("Error fetching leagues:", error);
   } finally {
    setLoading(false)
   }
  };

  fetchGames();
  fetchLeagues();
}, [domain]);

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


  if (loading) return null;

return (
  <div className="schedulePublic-container">

    
    <div className='schedulePublic-league-name-container'>
      <h2 className="schedulePublic-league-title">
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


  <div className="schedulePublic-game-container">
  <table className="schedulePublic-game-container-table">
    <thead>
    <tr>
      <th>Date</th>
      <th>Matchup</th>
      <th>Results</th>
    </tr>
    </thead>
    <tbody>
    {filteredGames.length === 0 ? (
      <tr><td colSpan="4"></td></tr>
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
            <td> {format(new Date(game.date), 'MMMM d, yyyy')}</td>
          <td>
          <NavLink to={`/games/${game.id}?domain=${domain}`}>
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

export default SchedulePublic;
