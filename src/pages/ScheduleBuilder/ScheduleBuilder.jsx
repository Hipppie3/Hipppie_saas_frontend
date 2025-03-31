import React, { useEffect, useState } from 'react';
import './scheduleBuilder.css';
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
  useEffect(() => {
    if (!schedules.length) return;

    const fetchAllGames = async () => {
      const requests = [];

      schedules.forEach((schedule) => {
        for (let i = 0; i < schedule.numWeeks; i++) {
          const weekKey = `${schedule.id}-${i}`;
          if (!weeklyGames[weekKey]) {
            requests.push(fetchWeekGames(schedule.id, i));
          }
        }
      });

      await Promise.all(requests);
    };

    fetchAllGames();
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
   const response = await api.get(`/api/teams?leagueId=${leagueId}`, { withCredentials: true });
   setTeams(response.data.teams);
  } catch (error) {
   console.error("Error fetching teams");
  }
 };

 const handleLeagueSelect = async (league) => {
  setSelectedLeague(league);
  fetchTeams(league.id);
  fetchSchedules(league.id);
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


 return (
  <div className="schedule-builder-container">
   <ScheduleForm onLeagueSelect={handleLeagueSelect} refreshSchedules={fetchSchedules} />
   <TeamList teams={teams} />

   {selectedLeague && schedules.length > 0 && (
    <div className="existing-schedules">
     <h3>Existing Schedules for {selectedLeague.name}</h3>
     {schedules.map((schedule) => (
      <div key={schedule.id} className="schedule-block">
       <div className="schedule-header">
        <h4>{schedule.name} — {schedule.numWeeks} weeks</h4>
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
 

           <td></td>
           
             {schedule.sameSlot && schedule.timeSlots
               ? schedule.timeSlots.map((_, index) => {
                 const weekKey = `${schedule.id}-${weekIndex}`;
                 const games = weeklyGames[weekKey] || [];

                 const formattedSlot = schedule.timeSlots[index].replace(/"/g, '').padStart(5, '0') + ':00';
                 const game = games.find((g) => g.time === formattedSlot);

                 return (
                   <td key={index}>
                     {game
                       ? `${teamIdToName[game.team1_id] || 'TBD'} vs ${teamIdToName[game.team2_id] || 'BYE'}`
                       : '—'}
                   </td>
                 );
               })
               : null}


             <td>
               <GameBuilder scheduleId={schedule.id} weekIndex={weekIndex} onGenerated={() => fetchWeekGames(schedule.id, weekIndex)} />
             </td>
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
