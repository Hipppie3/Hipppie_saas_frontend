import api from '@api'; // Instead of ../../../utils/api
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import './GamePublic.css';

function GamePublic() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statValues, setStatValues] = useState({});
  const [periodScores, setPeriodScores] = useState([]); // Add state for periodScores
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get('domain');

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await api.get(`/api/games/${id}?domain=${domain}`);
        setGame(response.data);
        initializeStatValues(response.data);
        setPeriodScores(response.data.game.periodScores); // Set the periodScores data
      } catch (error) {
        console.error('Error fetching game:', error);
      }
      setLoading(false);
    };
    fetchGame();
  }, [id, domain]);

  const initializeStatValues = (data) => {
    if (!data || !data.playerStats) return;
    const values = {};
    data.playerStats.forEach((stat) => {
      values[`${stat.player_id}-${stat.stat_id}`] = stat.value;
    });
    setStatValues(values);
  };

  // Check if all periods are hidden
  const visiblePeriods = periodScores.filter(period => !period.gamePeriod.hidden && period.gamePeriod?.name !== "Final");
  const showPeriodsTable = visiblePeriods.length > 0;
  const formatYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "www.youtube.com/embed/");
    }
    return url; // If already in correct format
  };

  const finalPeriod = periodScores.find(period => period.gamePeriod?.name === "Final");
  if (loading) return <p>Loading game details...</p>;
  if (!game) return <p>Game not found.</p>;



  return (
    <div className="gamePublic-container">
      <div className="gamePublic-periods-container">
        <div className="gamePublic-periods-final-score">
          <h5>{game.game.homeTeam?.name}</h5>
          <h5>{finalPeriod ? finalPeriod.period_score_team1 : game.game.score_team1}</h5>
          <h5>FINAL</h5>
          <h5>{finalPeriod ? finalPeriod.period_score_team2 : game.game.score_team2}</h5>
          <h5>{game.game.awayTeam?.name}</h5>
        </div>

        {/* Conditionally render the table if not all periods are hidden */}
        {showPeriodsTable && (
          <table className="gamePublic-periods-table">
            <thead>
              <tr>
                <th></th>
                {visiblePeriods.map((period) => (
                  <th key={period.id}>{period.gamePeriod?.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{game.game.homeTeam?.name}</td>
                {visiblePeriods.map((period) => (
                  <td key={period.id}>{period.period_score_team1}</td>
                ))}
              </tr>

              {/* Away Team Row */}
              <tr>
                <td>{game.game.awayTeam?.name}</td>
                {visiblePeriods.map((period) => (
                  <td key={period.id}>{period.period_score_team2}</td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="game-video-container">
        {game.game.video_url && (
          <div className="video-box">
            <iframe
              width="100%"
              height="315"
              src={formatYouTubeEmbedUrl(game.game.video_url)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Game Video"
            />
          </div>
        )}
      </div>

      {/* Home Team Stats */}
      <div className="teamPublic-container-home">
        <h3 className="teamPublic-header">
          Home Team: {game.game.homeTeam?.name} ({finalPeriod ? finalPeriod.period_score_team1 : game.game.score_team1})
        </h3>
        <table className="gamePublic-stat-table">
          <thead>
            <tr>
              <th className="playerPublic-column">Player</th>
              {game.stats.map((stat) => (
                <th key={stat.id} className="statPublic-column">{stat.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game.game.homeTeam?.players.map((player) => (
              <tr key={player.id}>
                <td className="playerPublic-name">{player.firstName} {player.lastName}</td>
                {game.stats.map((stat) => (
                  <td key={stat.id}>
                    <span className="statPublic-value">{statValues[`${player.id}-${stat.id}`] || 0}</span>
                  </td>
                ))}
              </tr>
            ))}
            {/* Total Row */}
            <tr className="totalPublic-row">
              <td className="playerPublic-name"><strong>Total</strong></td>
              {game.stats.map((stat) => {
                const total = game.game.homeTeam?.players.reduce((sum, player) => {
                  return sum + (statValues[`${player.id}-${stat.id}`] || 0);
                }, 0);
                return <td key={stat.id}><strong>{total}</strong></td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Away Team Stats */}
      <div className="teamPublic-container-away">
        <h3 className="teamPublic-header">
          Away Team: {game.game.awayTeam?.name} ({finalPeriod ? finalPeriod.period_score_team2 : game.game.score_team1})
        </h3>
        <table className="gamePublic-stat-table">
          <thead>
            <tr>
              <th className="playerPublic-column">Player</th>
              {game.stats.map((stat) => (
                <th key={stat.id} className="statPublic-column">{stat.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game.game.awayTeam?.players.map((player) => (
              <tr key={player.id}>
                <td className="playerPublic-name">{player.firstName} {player.lastName}</td>
                {game.stats.map((stat) => (
                  <td key={stat.id}>
                    <span className="statPublic-value">{statValues[`${player.id}-${stat.id}`] || 0}</span>
                  </td>
                ))}
              </tr>
            ))}
            {/* Total Row */}
            <tr className="totalPublic-row">
              <td className="playerPublic-name"><strong>Total</strong></td>
              {game.stats.map((stat) => {
                const total = game.game.awayTeam?.players.reduce((sum, player) => {
                  return sum + (statValues[`${player.id}-${stat.id}`] || 0);
                }, 0);
                return <td key={stat.id}><strong>{total}</strong></td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GamePublic;
