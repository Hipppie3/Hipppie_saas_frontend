import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './TeamAuth.css';

function TeamAuth() {
  const { isAuthenticated, loading, user } = useAuth();
  const [team, setTeam] = useState({ players: [], games: [] });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const domain = useSearchParams()[0].get("domain");
  const { id } = useParams();

  useEffect(() => {
    if (loading) return;
    const getTeam = async () => {
      try {
        let response;
        if (isAuthenticated) {
          response = await axios.get(`/api/teams/${id}`, { withCredentials: true });
        } else if (domain) {
          response = await axios.get(`/api/teams/${id}?domain=${domain}`);
        } else {
          return setError("Unauthorized access");
        }
        setTeam(response.data.team || { players: [], games: [] });
      } catch (error) {
        console.error("Error fetching team:", error.response?.data || error.message);
        setError("Failed to fetch team");
      }
    };
    getTeam();
  }, [id, domain, isAuthenticated, loading]);

  return (
    <div className="team_auth">
      <h2 className="team_auth_title">Team {team.name}</h2>

      {/* Players Table */}
      <table className="teamAuthPlayer-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {team?.players?.length === 0 ? (
            <tr><td colSpan="3" className="no_player">No players available</td></tr>
          ) : (
            team.players.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>
                  <NavLink to={`/players/${player.id}`}>{player.firstName} {player.lastName}</NavLink>
                </td>
                <td>{player.age}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Games Table */}
      <h3 className="games_title">Games</h3>
      <table className="teamAuthGame-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Matchup</th>
            <th>Result</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {team?.games?.length === 0 ? (
            <tr><td colSpan="5" className="no_games">No games available</td></tr>
          ) : (
            (team?.games ?? [])
            .slice()
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((game, index) => (
              <tr key={game.id}>
                <td>{index + 1}</td>
                <td>{new Date(game.date).toLocaleDateString()}</td>
                <td>{game.team1} vs {game.team2}</td>
                <td>{game.score_team1} - {game.score_team2}</td>
                <td>{game.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TeamAuth;
