import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@api';
import './GameAuth.css';

function GameAuth() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editModeScores, setEditModeScores] = useState(false);
  const [periodScores, setPeriodScores] = useState({});
  const [statValues, setStatValues] = useState({});
  const [stats, setStats] = useState([]);  // Add stats state
  const [editFinalScores, setEditFinalScores] = useState(false); // New state 
  const { id } = useParams();

  const fetchGame = async () => {
    try {
      const response = await api.get(`/api/games/${id}`);
      console.log("Fetched game data:", response.data); // Debug log

      const sortedStats = response.data.stats
        .filter(stat => !stat.hidden)
        .sort((a, b) => a.order - b.order);

      setGame(response.data.game); // ✅ Store game separately
      setStats(sortedStats); // ✅ Store stats separately

      // Filter out the hidden periods from game periods
      const filteredPeriodScores = response.data.game?.periodScores.filter(
        (period) => !period.gamePeriod.hidden // Only keep periods that are not hidden
      );

      setPeriodScores(filteredPeriodScores || []);

      initializeStatValues(response.data);
    } catch (error) {
      console.error("Error fetching game:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGame();
  }, [id]);


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
    if (!game || !game.id) {
      console.error("Error: game_id is missing");
      console.log("Game ID (submit):", game.game.id); // Ad
      alert("Game ID is missing. Cannot update stats.");
      return;
    }

    // Get the actual stat_id for PTS (points)
    const ptsStatId = game.stats?.find(stat => stat.shortName === "PTS")?.id;
    const totalPointsHome = game.homeTeam?.players.reduce((sum, player) => {
      return sum + (statValues[`${player.id}-${ptsStatId}`] || 0);
    }, 0);
    const totalPointsAway = game.awayTeam?.players.reduce((sum, player) => {
      return sum + (statValues[`${player.id}-${ptsStatId}`] || 0);
    }, 0);

    const statsToUpdate = [];
    Object.keys(statValues).forEach((key) => {
      const [player_id, stat_id] = key.split('-').map(Number);
      statsToUpdate.push({
        player_id,
        game_id: game.id,
        stat_id,
        value: statValues[key] || 0,
      });
    });

    try {
      await api.put('/api/playerGameStats', {
        player_id: statsToUpdate[0]?.player_id,
        game_id: game.id,
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
      console.log('Period Scores being sent:', periodScores);

      // Calculate the final score for team1 (home team) by summing up the period scores
      const totalScoreTeam1 = periodScores.reduce((total, period) => total + (period.period_score_team1 || 0), 0);
      const totalScoreTeam2 = periodScores.reduce((total, period) => total + (period.period_score_team2 || 0), 0);

      // If editing final scores, use those values
      const finalScoreTeam1 = editFinalScores ? game.score_team1 : totalScoreTeam1;
      const finalScoreTeam2 = editFinalScores ? game.score_team2 : totalScoreTeam2;

      // Update game scores based on the period scores and final score editing
      await api.put(`/api/games/${game.id}/scores`, {
        score_team1: finalScoreTeam1,
        score_team2: finalScoreTeam2,
      });

      // Update period scores in the backend
      await api.put(`/api/games/gamePeriodScores`, {
        game_id: game.id,
        scores: periodScores.map(period => ({
          id: period.id,
          period_score_team1: period.period_score_team1,
          period_score_team2: period.period_score_team2,
        })),
      });

      alert("Scores updated successfully!");
      setEditModeScores(false);
      setEditFinalScores(false);


      // Refresh game data after updating scores and period scores
      fetchGame(); // Ensure periodScores and game scores are correctly updated
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
  const allPeriodsHidden = Object.values(periodScores).every(period => period.gamePeriod?.hidden);

  if (loading) return <p>Loading game details...</p>;
  if (!game) return <p>Game not found.</p>;



  console.log(periodScores);
  return (
    <div className="game-container">
      <button className="toggle-button" onClick={() => {
  setEditMode(!editMode);
  console.log("Edit Mode: ", !editMode);  // Check if editMode is toggling
}}>
  {editMode ? 'Cancel Edit' : 'Edit Stats'}
</button>

      {!allPeriodsHidden &&
        <button className="toggle-button" onClick={() => setEditModeScores(!editModeScores)}>
          {editModeScores ? 'Cancel Edit Scores' : 'Edit Scores'}
        </button>
      }
      {allPeriodsHidden && (
        <button className="toggle-button" onClick={() => setEditFinalScores(!editFinalScores)}>
          {editFinalScores ? 'Cancel Edit Final Scores' : 'Edit Final Scores'}
        </button>
      )}
      {editFinalScores && (
        <button className="submit-button" onClick={handleSaveScores}>
          Save Final Scores
        </button>
      )}

      {/* Home Team Stats */}
      <div className="team-container-home">

        {!allPeriodsHidden &&
          <table className="gamePeriods-table">
            <thead>
              <tr>
                <th>Team Name</th>
                {periodScores.map((period) => (
                  <th key={period.id}>{period.gamePeriod?.name}</th>
                ))}
                <th>Final</th>
              </tr>
            </thead>
            <tbody>
              {/* Team 1 Row */}
              <tr>
                <td>{game?.homeTeam?.name}</td>
                {periodScores.map((period) => (
                  <td key={period.id}>
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
                ))}
                <td>{periodScores.reduce((total, period) => total + period.period_score_team1, 0)}</td>
              </tr>

              {/* Team 2 Row */}
              <tr>
                <td>{game?.awayTeam.name}</td>
                {periodScores.map((period) => (
                  <td key={period.id}>
                    {!editModeScores ? (
                      <span>{period?.period_score_team2}</span>
                    ) : (
                      <input
                        type="number"
                        value={period?.period_score_team2}
                        onChange={(e) => handleScoreChange(period.id, "team2", e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td>{periodScores.reduce((total, period) => total + period.period_score_team2, 0)}</td>
              </tr>
            </tbody>
          </table>
        }
        {/* Save Scores Button */}
        {editModeScores && (
          <button className="submit-button" onClick={handleSaveScores}>
            Save Scores
          </button>
        )}


        <h3 className="team-header">
          Home Team: {game?.homeTeam?.name} (
          {editFinalScores ? (
            <input
              type="number"
              value={game?.score_team1 || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 0;
                setGame((prev) => ({ ...prev, score_team1: value }));
              }}
            />
          ) : (
            game?.score_team1
          )}
          )
        </h3>
        <table className="gameAuth-stat-table">
          <thead>
            <tr>
              <th className="player-column">Player</th>
              {stats.map((stat) => (
                <th key={stat.id} className="stat-column">{stat.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game?.homeTeam?.players.map((player) => (
              <tr key={player.id}>
                <td className="player-name">{player.firstName} {player.lastName}</td>
                {stats.map((stat) => (
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
              {stats.map((stat) => {
                const total = game?.homeTeam?.players.reduce((sum, player) => {
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
          Away Team: {game?.awayTeam?.name} (
          {editFinalScores ? (
            <input
              type="number"
              value={game?.score_team2 || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 0;
                setGame((prev) => ({ ...prev, score_team2: value }));
              }}
            />
          ) : (
            game?.score_team2
          )}
          )
        </h3>
        <table className="gameAuth-stat-table">
          <thead>
            <tr>
              <th className="player-column">Player</th>
              {stats.map((stat) => (
                <th key={stat.id} className="stat-column">{stat.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game?.awayTeam?.players.map((player) => (
              <tr key={player.id}>
                <td className="player-name">{player.firstName} {player.lastName}</td>
                {stats.map((stat) => (
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
              {stats.map((stat) => {
                const total = game?.awayTeam?.players.reduce((sum, player) => {
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

