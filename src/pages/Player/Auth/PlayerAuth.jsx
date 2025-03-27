import React, { useState, useEffect } from 'react'
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import './PlayerAuth.css';
import DefaultImage from '../../../images/default_image.png';

function PlayerAuth() {
  const { isAuthenticated, loading, user } = useAuth()
  const [player, setPlayer] = useState({})
  const [attributes, setAttributes] = useState({})
  const [searchParams] = useSearchParams()
  const domain = searchParams.get("domain")
  const [error, setError] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const { id } = useParams();

  useEffect(() => {
    if (loading) return

    const getPlayer = async () => {
      try {
        let response;
        if (isAuthenticated) {
          if (user?.role === "super_admin") {
            response = await api.get(`/api/players/${id}`, { withCredentials: true });
          } else {
            response = await api.get(`/api/players/${id}`, { withCredentials: true });
          }
        } else if (domain) {
          response = await api.get(`/api/players/${id}?domain=${domain}`)
        } else {
          return setError("Unauthorized access")
        }
        setPlayer(response.data.player)
        setAttributes(response.data.player.attributeValues.reduce((acc, attr) => {
          acc[attr.attribute.attribute_name] = attr.value;
          return acc;
        }, {}));
        console.log(response.data.player)
      } catch (error) {
        console.error("Error fetching player:", error.response?.data || error.message);
        setError("Failed to fetch player:", error)
      }
    };
    getPlayer()
  }, [id, domain, isAuthenticated, loading])

  // Handle input changes for attributes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAttributes((prevAttributes) => ({
      ...prevAttributes,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/players/${id}`, { attributes }, { withCredentials: true });

      // ✅ Fresh fetch includes updated attributes and correct team
      const refreshed = await api.get(`/api/players/${id}`, { withCredentials: true });
      setPlayer(refreshed.data.player);

      setIsEditMode(false);
      setError("");
      console.log("Player updated successfully");
    } catch (error) {
      setError("Error updating player");
      console.error("Error updating player:", error);
    }
  };



  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };


  return (
    <div className="playerAuth_profile">
      {/* Profile Header */}
      <div className="playerAuth_header">
        <img
          src={player.image ? `${player.image}?${new Date().getTime()}` : DefaultImage}
          alt={`${player.firstName} ${player.lastName}`}
          className="player-image"
        />
        <h2>{player.firstName} {player.lastName}</h2>
        <p>
          <strong>Team:</strong>{" "}
          {player.team ? (
            <NavLink to={`/teams/${player.team.id}`} className="team-link">{player.team.name}</NavLink>
          ) : "No team assigned"}
        </p>
        {player.attributeValues && !isEditMode && (
          <button className="edit-button" onClick={toggleEditMode}>Edit</button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* Attribute Section */}
      <div className="player-info-container">
        {!isEditMode ? (
          <>
            {player.attributeValues &&
              [...player.attributeValues]
                .sort((a, b) => a.attribute.order - b.attribute.order)
                .map((attr) =>
                  attr.attribute.is_visible !== false && (
                    <div key={attr.id} className="attribute-field">
                      <div className="attribute-inline">
                        <span className="attr-label">{attr.attribute.attribute_name}:</span>
                        <span className="attr-value">{attr.value}</span>
                      </div>

                    </div>
                  )
                )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="player-form">
            {[...player.attributeValues]
              .sort((a, b) => a.attribute.order - b.attribute.order)
              .map((attr) =>
                attr.attribute.is_visible !== false && (
                  <div key={attr.id} className="attribute-field">
                    <label htmlFor={attr.attribute.attribute_name}>{attr.attribute.attribute_name}</label>
                    <input
                      type="text"
                      id={attr.attribute.attribute_name}
                      name={attr.attribute.attribute_name}
                      value={attributes[attr.attribute.attribute_name] || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                )
              )}

            <div className="player-form-actions">
              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsEditMode(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>

  );
}

export default PlayerAuth;
