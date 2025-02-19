import React, {useState, useEffect} from 'react'
import './PlayerListPublic.css'
import { NavLink, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PlayerListPublic() {
  const [players, setPlayers] = useState([]);
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  console.log(domain)

  useEffect(() => {
  const fetchPlayers = async () => {
    try{
      const response = await axios(`/api/players?domain=${domain}`);
      setPlayers(response.data.players || []);
      console.log(response.data.players);
    } catch (error) {
      console.error("Error fetching players:", error)
    } 
  };
  fetchPlayers()
  },[])

  return (
    <div className="playerList_public">
      {players.length === 0 ? (
        <p>No players available</p>
      ) : (
        <div className="public-player-list">
          {players.map((player) => (
            <div key={player.id} className="player-item">
            <NavLink to={`/players/${player.id}${domain ? `?domain=${domain}` : ""}`}>{player.firstName}</NavLink>
        </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlayerListPublic
