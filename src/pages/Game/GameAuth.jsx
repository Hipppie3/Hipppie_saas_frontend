import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

function GameAuth() {
 const [game, setGame] = useState([]);
 const [loading, setLoading] = useState(true);
 const {id} = useParams()

 useEffect(() => {
  const fetchGame = async () => {
   try {
    const response = await axios.get(`/api/games/${id}`);
    setGame(response.data.game);
    console.log(response.data.game)
   } catch(error) {
    console.error("Error fetching game:", error)
   } finally {}
   setLoading(false)
  };
  fetchGame()
 }, [id])

 if (loading) return <p>Loading game details...</p>;
 if (!game) return <p>Game not found.</p>; // Handles null case

 console.log(game)

 return (
  <div>
   <div className="home-team-container">
    <h3>Home Team: {game.homeTeam?.name}</h3>
    {game.homeTeam?.players.map((player) => (
     <div key={player.id}>
      <p>{player.firstName}</p>
     </div>
    ))}
   </div>
   <div className="away-team-container">
    <h3>Away Team: {game.awayTeam?.name}</h3>
    {game.awayTeam?.players.map((player) => (
     <div key={player.id}>
      <p>{player.firstName}</p>
     </div>
    ))}
   </div>
  </div>
 );
}


export default GameAuth
