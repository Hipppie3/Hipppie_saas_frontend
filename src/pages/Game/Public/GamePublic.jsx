import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import './GamePublic.css';

function GamePublic() {
 const [game, setGame] = useState(null);
 const [loading, setLoading] = useState(true);
 const [statValues, setStatValues] = useState({});
 const { id } = useParams();
 const [searchParams] = useSearchParams();
 const domain = searchParams.get('domain');

 useEffect(() => {
  const fetchGame = async () => {
   try {
    const response = await axios.get(`/api/games/${id}?domain=${domain}`);
    setGame(response.data);
    initializeStatValues(response.data);
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

 if (loading) return <p>Loading game details...</p>;
 if (!game) return <p>Game not found.</p>;
console.log(game)



 return (
  <div className="gamePublic-container">
   {/* Home Team Stats */}
   <div className="teamPublic-container-home">
    <h3 className="teamPublic-header">
     Home Team: {game.game.homeTeam?.name} ({game.game.team1_id === game.game.homeTeam?.id ? game.game.score_team1 : game.game.score_team2})
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
     Away Team: {game.game.awayTeam?.name} ({game.game.team2_id === game.game.awayTeam?.id ? game.game.score_team2 : game.game.score_team1})
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
