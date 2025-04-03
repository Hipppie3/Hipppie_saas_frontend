import React, { useEffect, useState } from 'react';
import './ScheduleBuilder.css';
import api from '@api';
import ScheduleForm from './ScheduleForm';
import TeamList from './TeamList';
import { format, addDays } from 'date-fns';
import GameBuilder from './GameBuilder';

function ScheduleBuilder() {
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [editSchedule, setEditSchedule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedDates, setEditedDates] = useState([]);
  const [editedTimeSlots, setEditedTimeSlots] = useState([]);
  const [weeklyGames, setWeeklyGames] = useState({});
  const [teamUpdates, setTeamUpdates] = useState({});
  const [selectedGameId, setSelectedGameId] = useState(null);




  const fetchSchedules = async (leagueId) => {
    try {
      const res = await api.get(`/api/schedules?leagueId=${leagueId}`, { withCredentials: true });
      setSchedules(res.data.schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchWeekGames = async (scheduleId, weekIndex) => {
    try {
      const res = await api.get(`/api/games/weekly-games?scheduleId=${scheduleId}&weekIndex=${weekIndex}`, {
        withCredentials: true,
      });
      setWeeklyGames((prev) => ({
        ...prev,
        [`${scheduleId}-${weekIndex}`]: res.data.games,
      }));
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };
  const fetchWeekByes = async (scheduleId, weekIndex) => {
    try {
      const res = await api.get(`/api/games/weekly-byes?scheduleId=${scheduleId}&weekIndex=${weekIndex}`, {
        withCredentials: true,
      });
      setWeeklyGames((prev) => ({
        ...prev,
        [`${scheduleId}-${weekIndex}-byes`]: res.data.byes,
      }));
    } catch (err) {
      console.error('Error fetching byes:', err);
    }
  };

  useEffect(() => {
    if (!schedules.length) return;

    const fetchAllGamesAndByes = async () => {
      const requests = [];

      schedules.forEach((schedule) => {
        for (let i = 0; i < schedule.numWeeks; i++) {
          const weekKey = `${schedule.id}-${i}`;
          if (!weeklyGames[weekKey]) {
            requests.push(fetchWeekGames(schedule.id, i));
          }
          const byeKey = `${schedule.id}-${i}-byes`;
          if (!weeklyGames[byeKey]) {
            requests.push(fetchWeekByes(schedule.id, i));
          }
        }
      });

      await Promise.all(requests);
    };

    fetchAllGamesAndByes();
  }, [schedules]);



  const handleUpdateSchedule = async (id) => {
    try {
      await api.put(`/api/schedules/${id}`, editSchedule, { withCredentials: true });
      await fetchSchedules(selectedLeague.id);
      setShowEditModal(false);
      setEditSchedule(null);
      alert("Schedule updated successfully");
    } catch (err) {
      console.error('Error updating schedule:', err);
      alert('Failed to update schedule');
    }
  };

  const handleSaveDateTimeUpdate = async (schedule) => {
    const updated = {
      ...schedule,
      weeklyDates: editedDates.map(d => {
        const date = new Date(d);
        date.setUTCHours(12, 0, 0, 0); // 🛠 Force time to noon UTC
        return date.toISOString();
      }),
      timeSlots: editedTimeSlots,
    };
    try {
      await api.put(`/api/schedules/${schedule.id}`, updated, { withCredentials: true });
      await fetchSchedules(selectedLeague.id);
      setEditMode(false);
      alert("Schedule date/time updated successfully");
    } catch (err) {
      console.error('Error updating schedule date/time:', err);
      alert('Failed to update schedule date/time');
    }
  };


  const fetchTeams = async (leagueId) => {
    try {
      const response = await api.get(`/api/teams/teamsByLeague?leagueId=${leagueId}`, { withCredentials: true });
      setTeams(response.data.teams);
    } catch (error) {
      console.error("Error fetching teams");
    }
  };

  const handleLeagueSelect = async (league) => {
    setSelectedLeague(league);
    setTeams([]); // 🔥 Immediately clear old teams
    await fetchTeams(league.id);
    await fetchSchedules(league.id);
  };


  const handleEdit = (schedule) => {
    setEditSchedule(schedule);
    setShowEditModal(true);
  };

  const handleEditDateTime = (schedule) => {
    const initialDates = schedule.weeklyDates?.length
      ? schedule.weeklyDates.map(formatForInputDate)
      : Array.from({ length: schedule.numWeeks }, (_, i) =>
        formatForInputDate(addDays(new Date(schedule.startDate), i * 7))
      );

    setEditedDates(initialDates);
    setEditedTimeSlots(schedule.timeSlots || []);
    setEditSchedule(schedule);
    setEditMode(true);
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };


  const getWeeklyDate = (startDate, weekIndex) => {
    return addDays(new Date(startDate), 7 * weekIndex);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this schedule?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/schedules/${scheduleId}`, { withCredentials: true });
      await fetchSchedules(selectedLeague.id); // Refresh the schedule list
      alert('Schedule deleted successfully!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule');
    }
  };

  const formatForInputDate = (isoString) => {
    return new Date(isoString).toISOString().split('T')[0];
  };

  const teamIdToName = {};
  teams.forEach((team) => {
    teamIdToName[team.id] = team.name;
  });


  const handleGameClick = async (gameId) => {
    if (!selectedGameId) {
      setSelectedGameId(gameId); // first selection
      return;
    }

    if (selectedGameId === gameId) {
      setSelectedGameId(null); // unselect if same game clicked
      return;
    }

    try {
      await api.put('/api/games/swap', {
        gameId1: selectedGameId,
        gameId2: gameId,
      }, { withCredentials: true });

      // refresh all weekly games for that schedule
      // Find both games from weeklyGames to get scheduleId and weekIndex
      let found = [];
      Object.entries(weeklyGames).forEach(([key, games]) => {
        if (!key.includes('-byes')) {
          games.forEach((g) => {
            if (g.id === selectedGameId || g.id === gameId) {
              const [scheduleId, weekIndex] = key.split('-');
              found.push({ scheduleId, weekIndex });
            }
          });
        }
      });

      // Re-fetch games for those weeks
      for (const entry of found) {
        await fetchWeekGames(entry.scheduleId, entry.weekIndex);
      }

      setSelectedGameId(null);
      alert('Matchups swapped!');
    } catch (err) {
      console.error('Swap error:', err);
      alert('Swap failed.');
      setSelectedGameId(null);
    }
  };

  return (
    <div className="schedule-builder-container">
      <ScheduleForm onLeagueSelect={handleLeagueSelect} refreshSchedules={fetchSchedules} />
      <TeamList teams={teams} refreshTeams={() => fetchTeams(selectedLeague.id)} />


      {selectedLeague && schedules.length > 0 && (
        <div className="existing-schedules">
          <h3>Existing Schedules for {selectedLeague.name}</h3>
          {schedules
            .filter((schedule) => schedule.leagueId === selectedLeague.id)
            .map((schedule) => (
            <div key={schedule.id} className="schedule-block">
              <div className="schedule-header">
                <h4>{schedule.name} — {schedule.numWeeks} weeks</h4>
                <GameBuilder
                  scheduleId={schedule.id}
                  onGenerated={() => {
                    for (let i = 0; i < schedule.numWeeks; i++) {
                      fetchWeekGames(schedule.id, i);
                      fetchWeekByes(schedule.id, i);
                    }
                  }}
                />
                <button onClick={() => handleEdit(schedule)}>Edit Schedule</button>
                <button onClick={() => handleEditDateTime(schedule)}>Edit Schedule Date/Time</button>
                <button onClick={() => handleDeleteSchedule(schedule.id)} style={{ color: 'red' }}>
                  Delete Schedule
                </button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Bye/DH</th>
                    {(editMode && editSchedule?.id === schedule.id ? editedTimeSlots : schedule.timeSlots || []).map((time, index) => (
                      <th key={index}>
                        {editMode && editSchedule?.id === schedule.id ? (
                          <input
                            type="text"
                            value={editedTimeSlots[index] || ''}
                            onChange={(e) => {
                              const updatedSlots = [...editedTimeSlots];
                              updatedSlots[index] = e.target.value;
                              setEditedTimeSlots(updatedSlots);
                            }}
                          />
                        ) : (
                          time
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: schedule.numWeeks }, (_, weekIndex) => (
                    <tr key={weekIndex}>
                      <td>{weekIndex + 1}</td>
                      <td>
                        {editMode && editSchedule?.id === schedule.id ? (
                          <input
                            type="date"
                            value={editedDates[weekIndex] || ''}
                            onChange={(e) => {
                              const updatedDates = [...editedDates];
                              updatedDates[weekIndex] = e.target.value;
                              setEditedDates(updatedDates);
                            }}
                          />

                        ) : (
                          formatDate(
                            schedule.weeklyDates?.[weekIndex] || getWeeklyDate(schedule.startDate, weekIndex)
                          )
                        )}
                      </td>


                      <td>
                        {(weeklyGames[`${schedule.id}-${weekIndex}-byes`] || [])
                          .map((bye) => teamIdToName[bye.teamId])
                          .join(', ') || '—'}
                      </td>
{
  schedule.sameSlot && schedule.timeSlots
    ? schedule.timeSlots.map((timeSlot, index) => {
        const weekKey = `${schedule.id}-${weekIndex}`;
        const games = weeklyGames[weekKey] || [];

        // Log the weekly games to verify they are being loaded correctly
        console.log('Games for this week:', games);

        const formatTime = (time) => {
          // Normalize time to HH:mm format
          return time.slice(0, 5);
        };

        // Format the current time slot correctly
        const formattedSlot = formatTime(timeSlot);  // Initialize formattedSlot with current timeSlot
        const game = games.find((g) => formatTime(g.time) === formattedSlot);  // Match game time with formattedSlot

        if (!game) {
          console.log(`No game found for time slot ${formattedSlot} in week ${weekIndex}`);
        }

      return (
        <td
          key={index}
          onClick={game ? () => handleGameClick(game.id) : undefined}
          style={{
            cursor: game ? 'pointer' : 'default',
            backgroundColor: game && selectedGameId === game.id ? '#ffe58f' : 'transparent',
          }}
        >

          {game ? (
            <>
              <div>
                {teamIdToName[game.team1_id] || 'TBD'} vs {teamIdToName[game.team2_id] || 'BYE'}
              </div>
              <div className="team-unavailable">
                <small style={{ fontSize: '0.75rem', color: '#999' }}>
                  {teams.find(t => t.id === game.team1_id)?.unavailableSlots?.join(', ')}
                </small>
                <br />
                <small style={{ fontSize: '0.75rem', color: '#999' }}>
                  {teams.find(t => t.id === game.team2_id)?.unavailableSlots?.join(', ')}
                </small>
              </div>
            </>
          ) : (
            'No game'
          )}
        </td>
      );

      })
    : null
}




                    </tr>
                  ))}
                </tbody>
              </table>

              {editMode && editSchedule?.id === schedule.id && (
                <div className="modal-update-cancel-button">
                  <button onClick={() => handleSaveDateTimeUpdate(schedule)}>Save Date/Time</button>
                  <button onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showEditModal && editSchedule && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Schedule</h3>
            <label>Name:</label>
            <input
              value={editSchedule.name}
              onChange={(e) => setEditSchedule({ ...editSchedule, name: e.target.value })}
            />

            <label>Start Date:</label>
            <input
              type="date"
              value={editSchedule.startDate ? formatForInputDate(editSchedule.startDate) : ''}

              onChange={(e) => setEditSchedule({ ...editSchedule, startDate: e.target.value })}
            />

            <label>Weeks:</label>
            <input
              type="number"
              value={editSchedule.numWeeks}
              onChange={(e) => setEditSchedule({ ...editSchedule, numWeeks: parseInt(e.target.value) })}
            />

            <div className="modal-update-cancel-button">
              <button onClick={() => handleUpdateSchedule(editSchedule.id)}>Update</button>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleBuilder;
