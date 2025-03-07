import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './LeagueGameAuth.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LeagueGameAuth({ leagueInfo }) {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [leagueData, setLeagueData] = useState(leagueInfo);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Manage modal state

  const [gameForm, setGameForm] = useState({
    leagueId: leagueInfo?.id,
    team1_id: '',
    team2_id: '',
    date: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (leagueInfo?.id) {
      setGameForm((prevForm) => ({
        ...prevForm,
        leagueId: leagueInfo.id,
      }));
      setLeagueData(leagueInfo);
    }
  }, [leagueInfo]);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (gameForm.team1_id === gameForm.team2_id) {
      alert('Teams must be different.');
      return;
    }
    try {
      const response = await axios.post('/api/games', { ...gameForm, userId: user.id }, { withCredentials: true });

      // ✅ Refetch league info after creating game
      const leagueResponse = await axios.get(`/api/leagues/${gameForm.leagueId}`, { withCredentials: true });
      setLeagueData(leagueResponse.data.league);
      setGames(leagueResponse.data.league.games);

      // ✅ Reset form & close modal
      setGameForm({
        leagueId: leagueInfo?.id,
        team1_id: '',
        team2_id: '',
        date: '',
        status: 'scheduled',
      });
      setIsModalOpen(false);
    } catch (error) {
      console.log('Error creating game:', error);
    }
  };

  const handleGameForm = (e) => {
    const { name, value } = e.target;
    setGameForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const getTeamNameById = (teamId) => {
    const team = leagueData?.teams?.find((team) => team.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  return (
    <div className="league-game-auth-container">
      <div className="leagueAuth-btn-container">
        <button className="add-leagueAuth-btn" onClick={() => setIsModalOpen(true)}> + Add Game</button>
      </div>

      {/* Create Game Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Game</h3>
            <form onSubmit={handleCreateGame}>
              <label>
                Home Team
                <select name="team1_id" value={gameForm.team1_id} onChange={handleGameForm} required>
                  <option value="">Select a team</option>
                  {leagueData?.teams?.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Away Team
                <select name="team2_id" value={gameForm.team2_id} onChange={handleGameForm} required>
                  <option value="">Select a team</option>
                  {leagueData?.teams?.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Date
                <input type="date" name="date" value={gameForm.date} onChange={handleGameForm} required />
              </label>

              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Games List */}
      <div className="game-schedule-container">
        <h3>Schedule</h3>
        {leagueData?.games?.map((leagueGame) => (
          <div className="game-schedules" key={leagueGame.id}>
            <p>
              Date:{' '}
              {new Date(leagueGame.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <NavLink to={`/games/${leagueGame.id}`}>
              <p>{getTeamNameById(leagueGame.team1_id)} vs {getTeamNameById(leagueGame.team2_id)}</p>
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeagueGameAuth;
