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

  useEffect(() => {
    const getTeam = async () => {
      try {
        const response = await api.get(`/api/teams/${id}?domain=${domain}`, { withCredentials: true });
        setTeam(response.data.team);
        console.log("Team Data:", response.data.team);
      } catch (error) {
        console.error("Error fetching team:", error.response?.data || error.message);
        setError("Failed to fetch team");
      }
    };
    getTeam();
  }, [id, domain]);

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
            <th>#</th>
            <th>Position</th>
            <th>Height</th>
            <th>Age</th>
          </tr>
        </thead>
          <tbody>
            {team?.players?.length > 0 ? (
              team.players.map((player) =>
                <tr key={player.id}>
                  <td><NavLink to={`/players/${player.id}${domain ? `?domain=${domain}` : ""}`}>
                    {player.firstName}
                  </NavLink></td>
                  <td>2</td>
                  <td>Forward</td>
                  <td>5'4</td>
                  <td>24</td>
                </tr>
              )
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>No players available</td> {/* ✅ Fix: Wrapped in <tr><td> */}
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}

export default TeamPublic;
