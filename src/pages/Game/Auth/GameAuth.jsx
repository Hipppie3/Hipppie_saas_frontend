import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './GameAuth.css';

function GameAuth() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editModeScores, setEditModeScores] = useState(false);
  const [periodScores, setPeriodScores] = useState({})
  const [statValues, setStatValues] = useState({});
  const { id } = useParams();

  const fetchGame = async () => {
    try {
      const response = await axios.get(`/api/games/${id}`);
      const sortedStats = response.data.stats
        .filter(stat => !stat.hidden)
        .sort((a, b) => a.order - b.order);

      // ✅ Exclude hidden game periods from periodScores
      const visiblePeriodScores = response.data?.game?.periodScores.filter(
        (period) => !period.gamePeriod.hidden
      ) || [];

      setGame({ ...response.data, stats: sortedStats });
      setPeriodScores(visiblePeriodScores); // ✅ Store only visible period scores

      initializeStatValues(response.data);
    } catch (error) {
      console.error("Error fetching game:", error);
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchGame();
  }, [id]);



  // Initialize stat values from existing player stats
  const initializeStatValues = (data) => {
    if (!data || !data.playerStats) return;
    const values = {};
    data.playerStats.forEach((stat) => {
      values[`${stat.player_id}-${stat.stat_id}`] = stat.value;
    });
    setStatValues(values);
  };

  // Handle stat input change
  const handleInputChange = (player_id, stat_id, value) => {
    setStatValues((prev) => ({
      ...prev,
      [`${player_id}-${stat_id}`]: value,
    }));
  };

  // Submit updated stats
  const handleSubmit = async () => {
    if (!game || !game.game || !game.game.id) {
      console.error("Error: game_id is missing");
      alert("Game ID is missing. Cannot update stats.");
      return;
    }

    // Get the actual stat_id for PTS (points)
    const ptsStatId = game.stats.find(stat => stat.shortName === "PTS")?.id;
    const totalPointsHome = game.game.homeTeam?.players.reduce((sum, player) => {
      return sum + (statValues[`${player.id}-${ptsStatId}`] || 0);
    }, 0);
    const totalPointsAway = game.game.awayTeam?.players.reduce((sum, player) => {
      return sum + (statValues[`${player.id}-${ptsStatId}`] || 0);
    }, 0);

    // Check if totals match the game score
    if (totalPointsHome !== game.game.score_team1 || totalPointsAway !== game.game.score_team2) {
      const confirmSubmit = window.confirm(
        "Stats total don't match the game score. Proceed to submit stats?"
      );
      if (!confirmSubmit) return; // Cancel submission if user selects 'No'
    }

    const statsToUpdate = [];
    Object.keys(statValues).forEach((key) => {
      const [player_id, stat_id] = key.split('-').map(Number);
      statsToUpdate.push({
        player_id,
        game_id: game.game.id,
        stat_id,
        value: statValues[key] || 0,
      });
    });

    try {
      await axios.put('/api/playerGameStats', {
        player_id: statsToUpdate[0]?.player_id,
        game_id: game.game.id,
        stats: statsToUpdate,
      });
      alert('Stats updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.error('❌ Error updating stats:', error.response?.data || error);
      alert('Failed to update stats.');
    }
  };


  const handleSaveScores = async () => {
    try {
      await axios.put(`/api/games/gamePeriodScores`, {
        game_id: game.game.id,
        scores: periodScores.map(period => ({
          id: period.id,
          period_score_team1: period.period_score_team1,
          period_score_team2: period.period_score_team2,
        })),
      });

      alert("Period scores updated successfully!");
      setEditModeScores(false);
      fetchGame(); // Refresh game data after updating scores
    } catch (error) {
      console.error("Error updating period scores:", error);
      alert("Failed to update period scores.");
    }
  };


  const handleScoreChange = (periodId, team, value) => {
    setPeriodScores((prevScores) =>
      prevScores.map((period) =>
        period.id === periodId
          ? {
            ...period,
            [`period_score_${team === "team1" ? "team1" : "team2"}`]: value ? parseInt(value, 10) : 0,
          }
          : period
      )
    );
  };


  if (loading) return <p>Loading game details...</p>;
  if (!game) return <p>Game not found.</p>;

  console.log(game);
  return (
    <div className="game-container">
      <button className="toggle-button" onClick={() => setEditMode(!editMode)}>
        {editMode ? 'Cancel Edit' : 'Edit Stats'}
      </button>
      <button className="toggle-button" onClick={() => setEditModeScores(!editModeScores)}>
        {editModeScores ? 'Cancel Edit Scores' : 'Edit Scores'}
      </button>



      {/* Home Team Stats */}
      <div className="team-container-home">
        <h3 className="team-header">
          Home Team: {game.game.homeTeam?.name} ({game.game.score_team1})
        </h3>


        <h2>Game Periods</h2>
        <table className="gamePeriods-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>{game?.homeTeam?.name}</th> {/* ✅ Shows home team name */}
              <th>{game?.awayTeam?.name}</th> {/* ✅ Shows away team name */}
            </tr>
          </thead>
          <tbody>
            {periodScores.map((period) => (
              <tr key={period.id}>
                <td>{period.gamePeriod?.name}</td> {/* ✅ Show period name */}

                {/* ✅ Home Team Score */}
                <td>
                  {!editModeScores ? (
                    <span>{period.period_score_team1}</span>
                  ) : (
                    <input
                      type="number"
                      value={period.period_score_team1}
                      onChange={(e) => handleScoreChange(period.id, "team1", e.target.value)}
                    />
                  )}
                </td>

                {/* ✅ Away Team Score */}
                <td>
                  {!editModeScores ? (
                    <span>{period.period_score_team2}</span>
                  ) : (
                    <input
                      type="number"
                      value={period.period_score_team2}
                      onChange={(e) => handleScoreChange(period.id, "team2", e.target.value)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

        {/* Save Scores Button */}
        {editModeScores && (
          <button className="submit-button" onClick={handleSaveScores}>
            Save Scores
          </button>
        )}





        
        <table className="gameAuth-stat-table">
          <thead>
            <tr>
              <th className="player-column">Player</th>
              {game.stats.map((stat) => (
                <th key={stat.id} className="stat-column">{stat.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game.game.homeTeam?.players.map((player) => (
              <tr key={player.id}>
                <td className="player-name">{player.firstName} {player.lastName}</td>
                {game.stats.map((stat) => (
                  <td key={stat.id}>
                    {!editMode ? (
                      <span className="stat-value">{statValues[`${player.id}-${stat.id}`] || 0}</span>
                    ) : (
                      <input
                        type="number"
                        className="stat-input"
                        value={statValues[`${player.id}-${stat.id}`] ?? ""}
                        onChange={(e) => handleInputChange(player.id, stat.id, parseInt(e.target.value) || 0)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* ✅ Total Row for Home Team */}
            <tr className="total-row">
              <td className="player-name"><strong>Total</strong></td>
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
      <div className="team-container-away">
        <h3 className="team-header">
          Away Team: {game.game.awayTeam?.name} ({game.game.score_team2})
        </h3>
        <table className="gameAuth-stat-table">
          <thead>
            <tr>
              <th className="player-column">Player</th>
              {game.stats.map((stat) => (
                <th key={stat.id} className="stat-column">{stat.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game.game.awayTeam?.players.map((player) => (
              <tr key={player.id}>
                <td className="player-name">{player.firstName} {player.lastName}</td>
                {game.stats.map((stat) => (
                  <td key={stat.id}>
                    {!editMode ? (
                      <span className="stat-value">{statValues[`${player.id}-${stat.id}`] || 0}</span>
                    ) : (
                      <input
                        type="number"
                        className="stat-input"
                        value={statValues[`${player.id}-${stat.id}`] ?? ""}
                        onChange={(e) => handleInputChange(player.id, stat.id, parseInt(e.target.value) || 0)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* ✅ Total Row for Away Team */}
            <tr className="total-row">
              <td className="player-name"><strong>Total</strong></td>
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

      {editMode && (
        <button className="submit-button" onClick={handleSubmit}>
          Save Stats
        </button>
      )}
    </div>
  );
}

export default GameAuth;
