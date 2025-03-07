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
  const [selectedGames, setSelectedGames] = useState([]);
  const [message, setMessage] = useState("");
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [scoreForm, setScoreForm] = useState({
    score_team1: '',
    score_team2: ''
  });

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

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    if (!selectedGame) return;

    try {
      const response = await axios.put(`/api/games/${selectedGame.id}/scores`, scoreForm, { withCredentials: true });

      // ✅ Update the local state with the new score
      setLeagueData((prevLeagueData) => ({
        ...prevLeagueData,
        games: prevLeagueData.games.map((game) =>
          game.id === selectedGame.id ? { ...game, ...response.data } : game
        )
      }));

      setMessage("Score updated successfully");
      setTimeout(() => setMessage(""), 3000);
      setIsScoreModalOpen(false);
    } catch (error) {
      console.error("Error updating score:", error.response?.data || error);
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


  const handleDeleteGames = async () => {
    if (!selectedGames.length) {
      return alert("Please select at least one game to delete.");
    }
    if (!window.confirm("Are you sure you want to delete the selected games?")) return;

    try {
      await Promise.all(selectedGames.map(id => axios.delete(`/api/games/${id}`, { withCredentials: true })));

      // ✅ Update state instantly by removing the deleted games
      setLeagueData((prevLeagueData) => ({
        ...prevLeagueData,
        games: prevLeagueData.games.filter(game => !selectedGames.includes(game.id))
      }));

      setSelectedGames([]); // Clear selection after deletion
      setMessage("Games deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting games:", error);
    }
  };


  const handleCheckboxChange = (id) => {
    setSelectedGames((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((item) => item !== id) : [...prevSelected, id]
    );
  };


  // Select All Games
  const handleSelectAll = () => {
    setSelectedGames((prevSelected) =>
      prevSelected.length === (leagueData.games?.length || 0)
        ? []
        : leagueData.games.map((game) => game.id)
    );
  };


  const openScoreModal = (game) => {
    setSelectedGame(game);
    setScoreForm({
      score_team1: game.score_team1 || '',
      score_team2: game.score_team2 || ''
    });
    setIsScoreModalOpen(true);
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    setScoreForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };




  return (
    <div className="league-game-auth-container">

      <div className="league-game-auth-btn-container">
        <button className="delete-league-game-auth-btn" onClick={handleDeleteGames}>🗑️</button>
        <button className="add-league-game-auth-btn" onClick={() => setIsModalOpen(true)}> + Add Game</button>
      </div>

      {/* Create Game Modal */}
      {isModalOpen && (
        <div className="game-schedule-modal-overlay">
          <div className="game-schedule-modal-content">
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

        {message && <p className="message">{message}</p>}
        <table className="game-schedule-table">
          <thead>
            <tr>
              <th>
                <input 
                type="checkbox"
                checked={selectedGames.length > 0 && selectedGames.length === (leagueData.games?.length || 0)}
                onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Date</th>
              <th>Matchup</th>
              <th>Status</th>
              <th>Results</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leagueData?.games?.length === 0 ? (
              <tr><td colSpan="7">No games available</td></tr>
            ) : (
              (leagueData?.games ?? []) // ✅ Ensure games exist, default to empty array if undefined
                .slice() // ✅ Create a copy to prevent modifying the original array
                .sort((a, b) => new Date(a.date) - new Date(b.date)) // ✅ Sort by earliest date
                .map((leagueGame, index) => (
                  <tr key={leagueGame.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedGames.includes(leagueGame.id)}
                        onChange={() => handleCheckboxChange(leagueGame.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>
                      {new Date(leagueGame.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td>
                      <NavLink to={`/games/${leagueGame.id}`}>
                        {getTeamNameById(leagueGame.team1_id)} vs {getTeamNameById(leagueGame.team2_id)}
                      </NavLink>
                    </td>
                    <td>{leagueGame.status.charAt(0).toUpperCase() + leagueGame.status.slice(1)}</td>
                    <td>{leagueGame.score_team1 ?? 0} - {leagueGame.score_team2 ?? 0}</td>
                    <td>
                      <button className="game-schedule-update-btn" onClick={() => openScoreModal(leagueGame)}>
                        🖊 Update Score
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>

        </table>


        {isScoreModalOpen && selectedGame && (
          <div className="game-schedule-modal-overlay">
            <div className="game-schedule-modal-content">
              <h3>Update Score</h3>
              <form onSubmit={handleUpdateScore}>
                <label>
                  {getTeamNameById(selectedGame.team1_id)}
                  <input
                    type="number"
                    name="score_team1"
                    value={scoreForm.score_team1}
                    onChange={handleScoreChange}
                    required
                  />
                </label>
                <label>
                  {getTeamNameById(selectedGame.team2_id)}
                  <input
                    type="number"
                    name="score_team2"
                    value={scoreForm.score_team2}
                    onChange={handleScoreChange}
                    required
                  />
                </label>
                <button type="submit">Update</button>
                <button type="button" onClick={() => setIsScoreModalOpen(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}




      </div>
    </div>
  );
}

export default LeagueGameAuth;
