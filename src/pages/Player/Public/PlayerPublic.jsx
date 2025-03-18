import React, { useState, useEffect } from "react";
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useParams, useSearchParams } from "react-router-dom";
import "./PlayerPublic.css";

function PlayerPublic() {
  const [player, setPlayer] = useState(null);
  const [allStats, setAllStats] = useState([]);
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  const { id } = useParams();

  useEffect(() => {
    const getPlayer = async () => {
      try {
        const response = await api.get(`/api/players/${id}?domain=${domain}`, { withCredentials: true });
        setPlayer(response.data.player);
        console.log(response.data)
        setAllStats(response.data.allStats.sort((a, b) => a.order - b.order)); // ✅ Ensure stats are ordered
      } catch (error) {
        console.error("Error fetching player:", error.response?.data || error.message);
      }
    };
    getPlayer();
  }, [id, domain]);

  const uniqueGames = Array.from(
    new Map(
      player?.gameStats?.map(gameStat => [
        gameStat.game?.id,
        {
          date: gameStat.game?.date || "N/A",
          homeTeam: gameStat.game?.homeTeam?.name || "Unknown",
          awayTeam: gameStat.game?.awayTeam?.name || "Unknown",
          stats: allStats.map(stat => {
            const foundStat = player?.gameStats?.find(gs => gs.game_id === gameStat.game?.id && gs.stat_id === stat.id);
            return {
              shortName: stat.shortName,
              value: foundStat ? foundStat.value : 0, // ✅ Ensure order is preserved
            };
          })
        }
      ])
    ).values()
  );


  if (!player) return <p>Loading...</p>;


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
        <table className="player-public-stats-table">
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
            {uniqueGames.map((game, index) => (
              <tr key={index}>
                <td>{new Date(game.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                <td>{game.homeTeam} vs {game.awayTeam}</td>
                {game.stats?.map((statValue, idx) => (
                  <td key={idx}>{statValue.value}</td>
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
