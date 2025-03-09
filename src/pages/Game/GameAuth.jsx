import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './GameAuth.css';

function GameAuth() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [statValues, setStatValues] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`/api/games/${id}`);
        setGame(response.data);
        initializeStatValues(response.data);
      } catch (error) {
        console.error('Error fetching game:', error);
      }
      setLoading(false);
    };
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
    // Calculate total PTS for each team
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


  if (loading) return <p>Loading game details...</p>;
  if (!game) return <p>Game not found.</p>;

  console.log(game)
  return (
    <div className="game-container">
      <button className="toggle-button" onClick={() => setEditMode(!editMode)}>
        {editMode ? 'Cancel Edit' : 'Edit Stats'}
      </button>

      {/* Home Team Stats */}
      <div className="team-container-home">
        <h3 className="team-header">
          Home Team: {game.game.homeTeam?.name} ({game.game.team1_id === game.game.homeTeam?.id ? game.game.score_team1 : game.game.score_team2})
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
            {game.game.homeTeam?.players.map((player) => (
              <tr key={player.id}>
                <td className="player-name">{player.firstName}</td>
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
            {/* Total Row */}
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
          Away Team: {game.game.awayTeam?.name} ({game.game.team2_id === game.game.awayTeam?.id ? game.game.score_team2 : game.game.score_team1})
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
                <td className="player-name">{player.firstName}</td>
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
            {/* Total Row */}
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
