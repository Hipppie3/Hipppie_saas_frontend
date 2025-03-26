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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    video_url: '',
    location: '',
    time: '',
    // status: ''
  });

  const { id } = useParams();

  const fetchGame = async () => {
    try {
      const response = await api.get(`/api/games/${id}`);

      const sortedStats = response.data.stats
        .filter(stat => !stat.hidden)
        .sort((a, b) => a.order - b.order);

      setGame(response.data.game); // ✅ Store game separately
      setStats(sortedStats); // ✅ Store stats separately

      // Filter out the hidden periods from game periods
      // Sort periods by their order before setting state
      const filteredPeriodScores = response.data.game?.periodScores
        .filter(period => !period.gamePeriod.hidden) // Exclude hidden periods
        .sort((a, b) => a.gamePeriod.order - b.gamePeriod.order); // Sort by period order

      setPeriodScores(filteredPeriodScores || []);


      initializeStatValues(response.data);
    } catch (error) {
      console.error("Error fetching game:", error);
    } finally {setLoading(false);
    }
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

      const finalPeriod = periodScores.find(p => p.gamePeriod?.name === "Final");
      const finalScoreTeam1 = finalPeriod?.period_score_team1 ?? 0;
      const finalScoreTeam2 = finalPeriod?.period_score_team2 ?? 0;



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


  const handleUpdateGameDetails = async (e) => {
    e.preventDefault();

    // Convert video URL to embed format
    let videoUrl = formData.video_url;
    if (videoUrl.includes('youtube.com')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0]; // Extract video ID
      videoUrl = `https://www.youtube.com/embed/${videoId}`; // Convert to embed URL
    }

    try {
      const { location, time, status } = formData;
      await api.put(`/api/games/${game.id}/details`, {
        video_url: videoUrl,
        location,
        time,
        status,
      });

      alert("Game details updated successfully!");
      setShowModal(false); // Close modal after updating
      fetchGame(); // Refresh game data after updating
    } catch (error) {
      console.error("Error updating game details:", error);
      alert("Failed to update game details.");
    }
  };

  const formatTime = (time) => {
    if (!time) return "TBD"; // ✅ Return "TBD" or any default value if time is null

    // Split the time into hours and minutes
    const [hours, minutes] = time.split(":");

    // Create a new date object using today's date and the provided time
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0); // Optional: To ensure seconds are set to 0

    // Use toLocaleTimeString to format the time in 12-hour format with AM/PM
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
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

  if (loading) return null;
  if (!game) return <p>Game not found.</p>;


  console.log(game)
  // Find the Final period's score
  const finalPeriod = periodScores.find(period => period.gamePeriod.name === "Final");

  // Extract the Final period score for team 1
  const finalScoreTeam1 = finalPeriod ? finalPeriod.period_score_team1 : game?.score_team1;
  const finalScoreTeam2 = finalPeriod ? finalPeriod.period_score_team2 : game?.score_team2;

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

      <button className="toggle-button" onClick={() => {
        setShowModal(true);
        setFormData({
          video_url: game?.video_url || '',
          location: game?.location || '',
          time: game?.time || '',
          // status: game?.status || ''
        });
      }}>
        Edit Game
      </button>


      {/* Home Team Stats */}
      <div className="team-container-home">
        <div className="game-video-container">
          {game?.video_url && (
            <div className="video-box">
              <iframe
                width="100%"
                height="315"
                src={game.video_url}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Game Video"
                onError={() => alert("There was an error loading the video. Please try again later.")}
              />
            </div>
          )}
        </div>

        <div className="game-details">
          <p>Location: {game.location}</p>
          <p>Game Time: {formatTime(game?.time)}</p>
        </div>

        {!allPeriodsHidden &&
          <table className="gamePeriods-table">
            <thead>
              <tr>
                <th>Team Name</th>
                {periodScores.map((period) => (
                  <th key={period.id}>{period.gamePeriod?.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Team 1 Row */}
              <tr>
                <td>{game?.homeTeam?.name || "Unknown Team"}</td>
                {periodScores.map((period) => (
                  <td key={period.id}>
                    {!editModeScores ? (
                      <span>{period.period_score_team1 || 0}</span>
                    ) : (
                      <input
                        type="number"
                        value={period.period_score_team1}
                        onChange={(e) => handleScoreChange(period.id, "team1", e.target.value)}
                      />
                    )}
                  </td>
                ))}
              </tr>

              {/* Team 2 Row */}
              <tr>
                <td>{game?.awayTeam?.name || "Unknown Team"}</td>
                {periodScores.map((period) => (
                  <td key={period.id}>
                    {!editModeScores ? (
                      <span>{period?.period_score_team2 || 0}</span>
                    ) : (
                      <input
                        type="number"
                        value={period?.period_score_team2}
                        onChange={(e) => handleScoreChange(period.id, "team2", e.target.value)}
                      />
                    )}
                  </td>
                ))}
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
          Home Team: {game?.homeTeam?.name || "Unknown Team"} 
            ({finalScoreTeam1})
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
          Away Team: {game?.awayTeam?.name || "Unknown Team"} ({finalScoreTeam2})
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

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Game Details</h2>
            <form onSubmit={handleUpdateGameDetails}>
              <label>
                Video URL:
                <input
                  type="text"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </label>
              <label>
                Time:
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </label>
              {/* <label>
                Status:
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </label> */}
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}


      {editMode && (
        <button className="submit-button" onClick={handleSubmit}>
          Save Stats
        </button>
      )}
    </div>
  );
}

export default GameAuth;

