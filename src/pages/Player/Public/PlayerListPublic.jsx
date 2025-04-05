import React, { useState, useEffect } from "react";
import "./PlayerListPublic.css";
import { NavLink, useSearchParams } from "react-router-dom";
import api from '@api'; // Instead of ../../../utils/api
import DefaultImg from "../../../images/default_image.png";
import useDomainInfo from '@useDomainInfo';

function PlayerListPublic() {
  const [players, setPlayers] = useState([]);
  const { domain, slug } = useDomainInfo(); // ✅ Centralized domain/slug

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await api.get(`/api/players`, {
          params: slug ? { slug } : { domain },
        });
        const filteredPlayers = response.data.players.filter(
          (player) => player.league
        );
        setPlayers(filteredPlayers || []);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    if (domain || slug) fetchPlayers();
  }, [domain, slug]);


  return (
    <div className="playerList_public">
      {players.length === 0 ? (
        <p></p>
      ) : (
        <div className="public-player-container">
          {players.map((player) => (
            <div key={player.id} className="player-public-card">
              <NavLink
                to={slug ? `/${slug}/players/${player.id}` : `/players/${player.id}`}
                className="player-link"
              >
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
