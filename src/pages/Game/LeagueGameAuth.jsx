import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './LeagueGameAuth.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LeagueGameAuth({ leagueInfo }) {
  const [gameForm, setGameForm] = useState({
    leagueId: leagueInfo?.id,
    team1_id: '',
    team2_id: '',
    date: '',
    status: 'scheduled',
  });
  const [games, setGames] = useState([]);
  const [leagueData, setLeagueData] = useState(leagueInfo); // Add a separate state to store the league data
  const {user} = useAuth();


  useEffect(() => {
    // When leagueInfo changes, update the form's leagueId and set the league data state
    if (leagueInfo?.id) {
      setGameForm((prevForm) => ({
        ...prevForm,
        leagueId: leagueInfo.id,
      }));
      setLeagueData(leagueInfo); // Update the league data state
    }
  }, [leagueInfo]);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    console.log(gameForm.team1_id);
    console.log(gameForm.team2_id);
    if (gameForm.team1_id === gameForm.team2_id) {
      alert('Teams must be different.');
      return;
    }
    try {
      const response = await axios.post('/api/games', {...gameForm, userId: user.id }, { withCredentials: true });
      console.log(response.data);

      // After submitting the game, re-fetch the league info to ensure we have the latest data
      const leagueResponse = await axios.get(`/api/leagues/${gameForm.leagueId}`, { withCredentials: true });
      setLeagueData(leagueResponse.data.league); // Update leagueData with the latest response
      setGames(leagueResponse.data.league.games); // Directly update games state with the new games

      setGameForm({
        leagueId: leagueInfo?.id,
        team1_id: '',
        team2_id: '',
        date: '',
        status: 'scheduled',
      });
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

  const leagueGames = leagueData?.games || []; // Use the leagueData state for rendering games
  const teams = leagueData?.teams || [];

  if (!leagueInfo) {
    return <div>Loading...</div>; // Show a loading message if leagueInfo is not available yet
  }

  // Function to find team name by ID
  const getTeamNameById = (teamId) => {
    const team = teams.find((team) => team.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  return (
    <div className="league-game-auth-container">
      <form className="league-game-auth-form" onSubmit={handleCreateGame}>
        <label>
          Home Team
          <select name="team1_id" value={gameForm.team1_id} onChange={handleGameForm}>
            <option value="">Select a team</option> {/* Default empty option */}
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Away Team
          <select name="team2_id" value={gameForm.team2_id} onChange={handleGameForm}>
            <option value="">Select a team</option> {/* Default empty option */}
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input type="date" name="date" value={gameForm.date} onChange={handleGameForm} />
        </label>
        <button type="submit">Submit</button>
      </form>
      <div className="game-schedule-container">
        <h3>Schedule</h3>
        {leagueGames.map((leagueGame) => (
          <div className="game-schedules" key={leagueGame.id}>
            <p>
              Date:{' '}
              {new Date(leagueGame.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <NavLink to={`/games/${leagueGame.id}`}><p>{getTeamNameById(leagueGame.team1_id)} vs {getTeamNameById(leagueGame.team2_id)}</p></NavLink>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeagueGameAuth;
