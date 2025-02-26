import React, { useState, useEffect } from "react";
import "./PlayerListPublic.css";
import { NavLink, useSearchParams } from "react-router-dom";
import axios from "axios";
import DefaultImg from '../Images/default_image.png';

function PlayerListPublic() {
  const [players, setPlayers] = useState([]);
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`/api/players?domain=${domain}`);
        setPlayers(response.data.players || []);
        console.log(response.data.players)
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
        <div className="public-player-list">
          {players.map((player) => (
            <div key={player.id} className="player-item">
              <NavLink to={`/players/${player.id}${domain ? `?domain=${domain}` : ""}`}>
                {player.firstName}
              </NavLink>
              <img
                key={player.id} // Prevents React from reloading images unnecessarily
                src={player.image && player.image.startsWith("data:image") ? player.image : DefaultImg}
                alt={player.firstName}
                style={{ width: "100px", height: "100px", objectFit: "cover" }} // Prevents stretched images
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayerListPublic;
