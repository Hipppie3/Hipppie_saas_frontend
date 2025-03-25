import { useEffect, useState } from "react";
import api from '@api';
import '../AllSeason/SeasonList.css';
import { useNavigate } from "react-router-dom";

function AllGames() {
  const [games, setGames] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [gameForm, setGameForm] = useState({
    leagueId: '',
    team1_id: '',
    team2_id: '',
    date: '',
    location: '',
    time: '',
    status: 'scheduled',
  });
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      const res = await api.get('/api/games', { withCredentials: true });
      setGames(res.data.games);
    };
    fetchGames();
  }, []);

  useEffect(() => {
    const fetchLeagues = async () => {
      const res = await api.get('/api/leagues', { withCredentials: true });
      setLeagues(res.data.leagues);
    };
    fetchLeagues();
  }, []);



  const handleGameFormChange = (e) => {
    const { name, value } = e.target;

    setGameForm(prev => ({
      ...prev,
      [name]: value,
      // Reset teams if league is changed
      ...(name === 'leagueId' ? { team1_id: '', team2_id: '' } : {})
    }));
  };


  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (gameForm.team1_id === gameForm.team2_id) {
      return alert('Teams must be different.');
    }

    const res = await api.post('/api/games', gameForm, { withCredentials: true });
    setGames(prev => [...prev, res.data.game]);
    setShowForm(false);
    setGameForm({
      leagueId: '',
      team1_id: '',
      team2_id: '',
      date: '',
      location: '',
      time: '',
      status: 'scheduled',
    });
    const refreshGames = async () => {
      const res = await api.get('/api/games', { withCredentials: true });
      setGames(res.data.games);
    };
    await refreshGames();
  };

  const handleDeleteGame = async (id) => {
    if (!window.confirm("Delete this game?")) return;
    await api.delete(`/api/games/${id}`, { withCredentials: true });
    setGames(prev => prev.filter(g => g.id !== id));
  };
  console.log(leagues)






  const selectedLeague = leagues.find(l => l.id === Number(gameForm.leagueId));
  const filteredTeams = selectedLeague?.teams || [];

  return (
    <div className="seasonList-container">
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>New Game</h2>
            <form onSubmit={handleCreateGame}>
              <select name="leagueId" value={gameForm.leagueId} onChange={handleGameFormChange} required>
                <option value="">Select League</option>
                {leagues.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>

              <select name="team1_id" value={gameForm.team1_id} onChange={handleGameFormChange} required>
                <option value="">Home Team</option>
                {filteredTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <select name="team2_id" value={gameForm.team2_id} onChange={handleGameFormChange} required>
                <option value="">Away Team</option>
                {filteredTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <input type="date" name="date" value={gameForm.date} onChange={handleGameFormChange} required />
              <input type="text" name="location" placeholder="Location" value={gameForm.location} onChange={handleGameFormChange} />
              <input type="time" name="time" value={gameForm.time} onChange={handleGameFormChange} />
              <div className="modal-update-cancel-button">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="season-card-container">
        <div className="season-card add-season-card" onClick={() => setShowForm(true)}>
          <div className="add-season-content">
            <span className="add-icon">＋</span>
            <p>Add Game</p>
          </div>
        </div>

        {games
          .filter(game => game && game.date) // ✅ prevent crashing
          .map(game => (
            <div key={game.id} className="season-card" onClick={() => navigate(`/games/${game.id}`)}>
              <h3>  {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              }).format(new Date(game.date))}
              </h3>
              <p>Location: {game.location}</p>
              <p>Match: {game.homeTeam?.name || 'Home'} vs {game.awayTeam?.name || 'Away'}</p>
              <p>Time: {game.time}</p>
              <p>Status: {game.status}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteGame(game.id);
                }}
              >Delete</button>
            </div>
          ))}

      </div>
    </div>
  );
}

export default AllGames;
