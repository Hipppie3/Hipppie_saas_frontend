import React, { useState, useEffect } from 'react';
import './TeamPublic.css';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import api from '@api'; // Instead of ../../../utils/api


function TeamPublic() {
  const [team, setTeam] = useState(null);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  const [error, setError] = useState("");
  const [playersAttr, setPlayersAttr] = useState([])

  useEffect(() => {
    const getTeam = async () => {
      try {
        const response = await api.get(`/api/teams/${id}/teamPublic?domain=${domain}`, { withCredentials: true });
        setTeam(response.data.team);
        setPlayersAttr(response.data.team.players)
        console.log(response.data.team.players)
        console.log("Team Data:", response.data.team);
      } catch (error) {
        console.error("Error fetching team:", error.response?.data || error.message);
        setError("Failed to fetch team");
      }
    };
    getTeam();
  }, [id, domain]);

  const uniqueAttributes = Array.from(
    new Set(playersAttr.flatMap((player) => player.attributeValues.map((att) => att.attribute.attribute_name)))
  );



  return (
    <div className="teamPublic-container">
      <div className="teamPublic-banner">
        {team?.name}
      </div>
      <div className="teamPublic-games-container">
        <h4 className="teamPublic-games-title">SCHEDULE</h4>
        <table className="teamPublic-games-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matchup</th>
                <th>Results</th>
              </tr>
            </thead>
          <tbody>
            {team?.games
              ?.slice() // ✅ Create a copy to avoid mutating the original array
              .sort((a, b) => new Date(a.date) - new Date(b.date)) // ✅ Sort games by date (earliest first)
              .map((game, index) => (
              <tr
                key={index}
                className="clickable-row"
                onClick={() => window.location.href = `/games/${game.id}?domain=${domain}`}
              >
                <td>
                  {new Date(game.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td>
                  {game.team1} vs {game.team2}
                </td>
                <td>
                  {game.score_team1} - {game.score_team2}
                </td>
              </tr>
            ))}
          </tbody>
          </table>

      </div>

      <div className="teamPublic-players-container">
        <h4 className="teamPublic-players-title">ROSTER</h4>
        <table className="teamPublic-players-table">
          <thead>
            <tr>
              <th>Name</th>
              {uniqueAttributes.map((attrName, index) => (
                <th key={index}>{attrName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team?.players?.length > 0 ? (
              team.players.map((player) => (
                <tr key={player.id}>
                  <td>
                    <NavLink to={`/players/${player.id}${domain ? `?domain=${domain}` : ""}`}>
                      {player.firstName.trim()}
                    </NavLink>
                  </td>

                  {/* ✅ Display attribute values in the correct order */}
                  {uniqueAttributes.map((attrName, index) => {
                    const attributeValue = player.attributeValues.find(
                      (att) => att.attribute.attribute_name === attrName
                    );
                    return <td key={index}>{attributeValue && attributeValue.value.trim() !== "" ? attributeValue.value : "-"}</td>;

                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={uniqueAttributes.length + 1} style={{ textAlign: "center" }}>
                  No players available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeamPublic;
