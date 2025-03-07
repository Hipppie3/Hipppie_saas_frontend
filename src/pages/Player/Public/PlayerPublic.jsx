import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink, useParams, useSearchParams } from "react-router-dom";
import "./PlayerPublic.css";

function PlayerPublic() {
  const [player, setPlayer] = useState(null);
  const [allStats, setAllStats] = useState([]);
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  const { id } = useParams();

  useEffect(() => {
    const getPlayerAndStats = async () => {
      try {
        const playerResponse = await axios.get(`/api/players/${id}?domain=${domain}`, { withCredentials: true });
        setPlayer(playerResponse.data.player);

        if (playerResponse.data.player.userId) {
          const statsResponse = await axios.get(`/api/stats/user/${playerResponse.data.player.userId}?domain=${domain}`, { withCredentials: true });
          setAllStats(statsResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching player or stats:", error.response?.data || error.message);
      }
    };

    getPlayerAndStats();
  }, [id, domain]);

  if (!player) return <p>Loading...</p>;

  // ✅ Group stats by game ID to avoid duplicates
  const gameStatsMap = player.gameStats?.reduce((acc, stat) => {
    if (!acc[stat.game.id]) {
      acc[stat.game.id] = { game: stat.game, stats: {} };
    }
    acc[stat.game.id].stats[stat.stat.id] = stat.value;
    return acc;
  }, {});

  const uniqueGames = Object.values(gameStatsMap || {});

  return (
    <div className="player_public">

      {/* Player Detail Container */}
      <div className="player-details-container">
      {player.image ? (
        <img
          src={player.image}
          alt={`${player.firstName} ${player.lastName}`}
          className="player-image"
          style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
        />
      ) : (
        <div className="placeholder-image">No Image</div>
      )}
      <h2>{player.firstName} {player.lastName}</h2>
      <p><strong>Age:</strong> {player.age ? player.age : "N/A"}</p>
      {/* Display Team */}
      <p>
        <strong>Team:</strong>{" "}
        {player.team ? (
          <NavLink to={`/teams/${player.team.id}?domain=${domain}`} className="team-link">{player.team.name}</NavLink>
        ) : "No team assigned"}
      </p>
      </div>
      
      {/* Player links */} 
      <div className="player-public-links-container">
          <ul>
            <li>Profile</li>
            <li>Stats</li>
            <li>Bio</li>
            <li>Videos</li>
          </ul>
      </div>

      {/* Sponsors Ad */}
      <div className="player-public-sponsors-container">

      </div>
      {/* Players Videos */} 
      <div className="player-public-videos-container">

      </div>

      {/* Stats Table */}
      <div className="player-public-stats-container">
        <h2 className="player-public-stats-title">LAST 5 GAMES</h2>
        <table>
          <thead>
            <tr>
              <th>Game Date</th>
              <th>Matchup</th>
              {allStats.map((stat) => (
                <th key={stat.id}>{stat.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueGames.map(({ game, stats }) => (
              <tr key={game.id}>
                <td>{new Date(game.date).toLocaleDateString()}</td>
                <td>{game.homeTeam?.name} vs {game.awayTeam?.name}</td>
                {allStats.map((statItem) => (
                  <td key={statItem.id}>{stats[statItem.id] || 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlayerPublic;
