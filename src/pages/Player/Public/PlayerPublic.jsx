import React, { useState, useEffect } from "react";
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useParams, useSearchParams } from "react-router-dom";
import "./PlayerPublic.css";
import useDomainInfo from '@useDomainInfo';

function PlayerPublic() {
  const [player, setPlayer] = useState(null);
  const [allStats, setAllStats] = useState([]);
  const { domain, slug } = useDomainInfo(); // ✅ Centralized domain/slug
  const { id } = useParams();

  useEffect(() => {
    const getPlayer = async () => {
      try {
        const response = await api.get(`/api/players/${id}`, {
          params: slug ? { slug } : { domain },
        });
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
  const calculateAverage = (gameStats = [], statShortName) => {
    if (!Array.isArray(gameStats) || gameStats.length === 0) return "0.0";
    const filtered = gameStats.filter(gs => gs.stat?.shortName === statShortName);
    const uniqueGameIds = [...new Set(filtered.map(gs => gs.game_id))];
    const totalGames = uniqueGameIds.length;
    const total = filtered.reduce((sum, gs) => sum + Number(gs.value), 0);
    return totalGames > 0 ? (total / totalGames).toFixed(1) : "0.0";
  };

  const avgPTS = player?.gameStats ? calculateAverage(player.gameStats, "PTS") : "0.0";
  const avgAST = player?.gameStats ? calculateAverage(player.gameStats, "AST") : "0.0";
  const avgREB = player?.gameStats ? calculateAverage(player.gameStats, "REB") : "0.0";




  if (!player) return <p>Loading...</p>;
  const numberAttr = player.attributeValues?.find(attr => attr.attribute?.attribute_name === "Number");
  const positionAttr = player.attributeValues?.find(attr => attr.attribute?.attribute_name === "Position");


  return (
    <div className="player_public">

      {/* Player Detail Container */}
      <div className="player-details-container">
      {player.image ? (
        <img
          src={player.image}
          alt={`${player.firstName} ${player.lastName}`}
          className="player-page-image"
        />
      ) : (
        <div className="placeholder-image"></div>
      )}
      <div className="player-details-information">
          <p className="player-details-team">
            {player.team ? (
              <h5>{player.team.name}  {numberAttr ? ` | #${numberAttr.value}` : ""}  {positionAttr ? ` | ${positionAttr.value}` : ""}</h5>
            ) : "No team assigned"}
          </p>
          <div className='player-details-name'>
          <h2>{player.firstName} </h2>
          <h2>{player.lastName || "\u00a0"}</h2>  
          </div>

        </div>
      </div>
      <div className="players-averages-details">
            <section className="players-averages-details-left-section">
            <div className="box"></div>
            <div className="box">
            <h4>PPG</h4>
            <h4><strong>{avgPTS}</strong> </h4>
            </div>
            <div className="box">
            <h4>RPG</h4>
            <h4><strong>{avgREB}</strong> </h4></div>
            <div className="box">
              <h4>APG</h4>
              <h4><strong>{avgAST}</strong> </h4>
</div>
            </section>
        <section className="players-averages-details-right-section">

            </section>
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
                  
                  <td key={idx}>
                    {(() => {
                      const shortName = allStats[idx]?.shortName;

                      const getStat = (code) => game.stats.find(s => s.shortName === code)?.value || 0;

                      if (shortName === 'FG%') {
                        const fgm = getStat('FGM');
                        const fga = getStat('FGA');
                        return fga ? ((fgm / fga) * 1).toFixed(3) : '0';
                      }

                      if (shortName === 'FT%') {
                        const ftm = getStat('FTM');
                        const fta = getStat('FTA');
                        return fta ? ((ftm / fta) * 1).toFixed(3) : '0';
                      }

                      if (shortName === '2P%') {
                        const twoPM = getStat('2PM');
                        const twoPA = getStat('2PA');
                        return twoPA ? ((twoPM / twoPA) * 1).toFixed(3)  : '0';
                      }

                      if (shortName === '3P%') {
                        const threePM = getStat('3PM');
                        const threePA = getStat('3PA');
                        return threePA ? ((threePM / threePA) * 1).toFixed(3) : '0';
                      }

                      return statValue.value; // raw stats
                    })()}
                  </td>

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
