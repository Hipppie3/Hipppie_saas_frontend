import React, { useEffect, useState } from 'react';
import api from '@api';
import { NavLink } from 'react-router-dom';
import './SchedulePublic.css';
import { format } from 'date-fns';
import useDomainInfo from '@useDomainInfo';

function SchedulePublic() {
  const [games, setGames] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [loading, setLoading] = useState(true);
  const { slug, domain } = useDomainInfo(); // inside SchedulePublic

  useEffect(() => {
    if (!slug && !domain) {
      console.warn("No slug or domain, skipping fetch");
      return;
    }

    const fetchGames = async () => {
      try {
        const res = await api.get(`/api/games`, { params: slug ? { slug } : { domain } });
        setGames(res.data.games || []);
      } catch (error) {
        console.log("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLeagues = async () => {
      try {
        const res = await api.get(`/api/leagues`, { params: slug ? { slug } : { domain } });
        setLeagues(res.data.leagues || []);
      } catch (error) {
        console.log("Error fetching leagues:", error);
      }
    };

    fetchGames();
    fetchLeagues();
  }, [domain, slug]);

  const getLeagueName = (leagueId) => {
    const league = leagues.find((l) => l.id === leagueId);
    return league ? league.name : `League ${leagueId}`;
  };

  const uniqueLeagues = [...new Set(games.map(game => game.leagueId))];

  const filteredGames = selectedLeague
    ? games.filter(game => game.leagueId === Number(selectedLeague))
    : games;

  if (loading) return null;


  
  return (
    <div className="schedulePublic-container">
      <div className='schedulePublic-league-name-container'>
        <h2 className="schedulePublic-league-title">
          <select id="league-filter" value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
            {uniqueLeagues.map((leagueId) => (
              <option key={leagueId} value={leagueId}>
                {getLeagueName(leagueId)}
              </option>
            ))}
          </select>
        </h2>
      </div>

      {filteredGames.length > 0 ? (
        <div className="schedulePublic-game-container">
          <table className="schedulePublic-game-container-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matchup</th>
                <th>Time</th>
                <th>Results</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames
                .sort((a, b) => {
                  const [hoursA, minutesA] = a.time.split(':').map(Number);
                  const [hoursB, minutesB] = b.time.split(':').map(Number);

                  const datePartA = new Date(a.date);
                  const datePartB = new Date(b.date);

                  datePartA.setHours(hoursA, minutesA, 0, 0);
                  datePartB.setHours(hoursB, minutesB, 0, 0);

                  return datePartA - datePartB;
                })



                .map((game) => {
                  const homeTeam = game.homeTeam?.id === game.team1_id ? game.homeTeam : game.awayTeam;
                  const awayTeam = game.awayTeam?.id === game.team2_id ? game.awayTeam : game.homeTeam;
                  const homeScore = game.homeTeam?.id === game.team1_id ? game.score_team1 : game.score_team2;
                  const awayScore = game.awayTeam?.id === game.team2_id ? game.score_team2 : game.score_team1;

                  return (
                    <tr key={game.id}>
                      <td>{format(new Date(game.date), 'MMMM d, yyyy')}</td>
                      <td>
                        <NavLink to={`${slug ? `/${slug}/games/${game.id}` : `/games/${game.id}${domain ? `?domain=${domain}` : ""}`}`} className="player-link">

                          {homeTeam?.name} vs {awayTeam?.name}
                        </NavLink>
                      </td>
                      <td>{game.time}</td>
                      <td>{homeScore} - {awayScore}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No games available</p>
      )}
    </div>
  );
}

export default SchedulePublic;
