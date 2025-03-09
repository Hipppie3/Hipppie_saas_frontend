import React, { useEffect, useState } from 'react'
import './ScheduleAuth.css'
import axios from 'axios';

function ScheduleAuth() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
      const response = await axios.get('/api/games')
      console.log(response.data);
      setGames(response.data)
      } catch(error) {
        console.log("Error feching games:", error)
      }
    };
    fetchGames();
  },[])

  return (
    <div className='schedule-container'>
      <div className='schedule-league-name-container'>

      </div>

        <div className='schedule-game-container'>
        <table className='schedule-game-container-table'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Matchup</th>
                <th>Results</th>
              </tr>
            </thead>
              <tbody>
                {games.slice()
                .sort((a,b) => new Date(a.date) - new Date(b.date))
                .map((game) => {
                  // Ensure the teams match their respective scores
                  const homeTeam = game.homeTeam?.id === game.team1_id ? game.homeTeam : game.awayTeam;
                  const awayTeam = game.awayTeam?.id === game.team2_id ? game.awayTeam : game.homeTeam;
                  const homeScore = game.homeTeam?.id === game.team1_id ? game.score_team1 : game.score_team2;
                  const awayScore = game.awayTeam?.id === game.team2_id ? game.score_team2 : game.score_team1;

                  return (
                    <tr key={game.id}>
                      <td>{new Date(game.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                      <td>{homeTeam?.name} vs {awayTeam?.name}</td>
                      <td>
                      {homeScore} - {awayScore} 
                      </td>
                    </tr>
                  );
                })}
              </tbody>
          </table>
        </div>

    </div>
  )
}

export default ScheduleAuth;
