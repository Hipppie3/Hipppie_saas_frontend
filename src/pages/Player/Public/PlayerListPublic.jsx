import React, { useState, useEffect } from "react";
import "./PlayerListPublic.css";
import { NavLink, useSearchParams } from "react-router-dom";
import api from '@api'; // Instead of ../../../utils/api
import DefaultImg from "../../../images/default_image.png";

function PlayerListPublic() {
  const [players, setPlayers] = useState([]);
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await api.get(`/api/players?domain=${domain}`);
        setPlayers(response.data.players || []);
        
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };
    if (domain) fetchPlayers(); // Prevents fetching with an empty domain
  }, [domain]); // Re-fetch if `domain` changes

  return (
    <div className="playerList_public">
      {players.length === 0 ? (
        <p>No players available</p>
      ) : (
        <div className="public-player-container">
          {players.map((player) => (
            <div key={player.id} className="player-public-card">
              <NavLink to={`/players/${player.id}${domain ? `?domain=${domain}` : ""}`} className="player-link">
                <img
                  src={player.image ? player.image : DefaultImg}  // Check for valid image URL
                  alt={player.firstName}
                  className="player-public-image"
                />
                <p className="player-public-name">{player.firstName} {player.lastName}</p>
              </NavLink>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayerListPublic;
