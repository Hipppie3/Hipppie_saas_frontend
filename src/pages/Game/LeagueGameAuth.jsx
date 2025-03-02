import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function LeagueGameAuth() {
  const [games, setGames] = useState([]);
  const { id } = useParams();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gamesPerTeam, setGamesPerTeam] = useState(7);
  const [selectedDays, setSelectedDays] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`/api/games/league/${id}`);
        setGames(response.data);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };
    fetchGames();
  }, []);

  // Handle game day selection
  const handleDayChange = (day) => {
    setSelectedDays(prevDays =>
      prevDays.includes(day)
        ? prevDays.filter(d => d !== day) // Remove if already selected
        : [...prevDays, day] // Add if not selected
    );
  };

  // Handle schedule generation
  const generateSchedule = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || selectedDays.length === 0) {
      setMessage("Please fill all fields and select at least one game day.");
      return;
    }

    try {
      const response = await axios.post('/api/games/generate-schedule', {
        leagueId: id,
        startDate,
        endDate,
        gameDays: selectedDays,
        gamesPerTeam,
      });

      setMessage("Schedule generated successfully!");
      setGames(response.data.games); // Update game list
    } catch (error) {
      console.error("Error generating schedule:", error);
      setMessage("Failed to generate schedule.");
    }
  };

  return (
    <div>
      <h2>Generate League Schedule</h2>
      <form onSubmit={generateSchedule}>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

        <label>Games per Team:</label>
        <input type="number" value={gamesPerTeam} onChange={(e) => setGamesPerTeam(e.target.value)} min="1" required />

        <label>Select Game Days:</label>
        <div>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
            <label key={day}>
              <input type="checkbox" value={day} onChange={() => handleDayChange(day)} />
              {day}
            </label>
          ))}
        </div>

        <button type="submit">Generate Schedule</button>
      </form>

      {message && <p>{message}</p>}

      <h2>Scheduled Games</h2>
      {games.length > 0 ? (
        games.map((game) => (
          <div key={game.id}>
            <h3>{game.homeTeam?.name} vs {game.awayTeam?.name}</h3>
            <p>Date: {game.date}</p>
          </div>
        ))
      ) : (
        <p>No Games Yet</p>
      )}
    </div>
  );
}

export default LeagueGameAuth;
