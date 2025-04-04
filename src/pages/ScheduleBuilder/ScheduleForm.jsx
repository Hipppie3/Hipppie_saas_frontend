import React, { useEffect, useState } from 'react';
import api from '@api';
import './ScheduleForm.css'

function ScheduleForm({ onLeagueSelect, refreshSchedules }) {
 const [name, setName] = useState('');
 const [startDate, setStartDate] = useState('');
 const [numWeeks, setNumWeeks] = useState(8);
 const [gameDays, setGameDays] = useState([]);
 const [sameSlot, setSameSlot] = useState(true);
 const [timeSlots, setTimeSlots] = useState([]);
 const [weeklyTimeSlots, setWeeklyTimeSlots] = useState([]);
 const [leagues, setLeagues] = useState([]);
 const [selectedLeagueId, setSelectedLeagueId] = useState(null);
 const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

 useEffect(() => {
  const fetchLeagues = async () => {
   try {
    const response = await api.get('/api/leagues', { withCredentials: true });
    setLeagues(response.data.leagues);
   } catch (err) {
    console.error('Error fetching leagues', err);
   }
  };
  fetchLeagues();
 }, []);

 const handleLeagueChange = (e) => {
  const leagueId = parseInt(e.target.value);
  setSelectedLeagueId(leagueId);
  const selectedLeague = leagues.find(l => l.id === leagueId);
  if (selectedLeague) {
   onLeagueSelect(selectedLeague);
  }
 };

 const handleCheckboxChange = (day) => {
  setGameDays(gameDays.includes(day)
   ? gameDays.filter(d => d !== day)
   : [...gameDays, day]
  );
 };

 const handleSameSlotChange = (e) => {
  setSameSlot(e.target.checked);
  if (e.target.checked) {
   setWeeklyTimeSlots([]);
  } else {
   setTimeSlots([]);
  }
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
   const payload = {
    name,
    leagueId: selectedLeagueId,
    startDate,
    numWeeks,
    gameDays,
    sameSlot,
    timeSlots: sameSlot ? timeSlots : null,
    weeklyTimeSlots: !sameSlot ? weeklyTimeSlots : null,
   };
   const res = await api.post('/api/schedules', payload, { withCredentials: true });
   alert('Schedule created successfully!');
   refreshSchedules(selectedLeagueId);
  } catch (err) {
   console.error('Error creating schedule:', err);
   alert('Failed to create schedule');
  }
 };

 return (
  <form className="schedule-form" onSubmit={handleSubmit}>
   <h3>Create New Schedule</h3>

   <label>League:</label>
   <select value={selectedLeagueId || ''} onChange={handleLeagueChange} required>
    <option value="">Select a league</option>
    {leagues.map((league) => (
     <option key={league.id} value={league.id}>{league.name}</option>
    ))}
   </select>

   <label>Schedule Name:</label>
   <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

   <label>Start Date:</label>
   <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

   <label>Number of Weeks:</label>
   <input type="number" value={numWeeks} onChange={(e) => setNumWeeks(parseInt(e.target.value))} min={1} />

   <label>Game Days:</label>
   <div className="checkbox-group">
    {allDays.map((day) => (
     <label key={day}>
      <input
       type="checkbox"
       checked={gameDays.includes(day)}
       onChange={() => handleCheckboxChange(day)}
      />
      {day}
     </label>
    ))}
   </div>

   <label>
    <input
     type="checkbox"
     checked={sameSlot}
     onChange={handleSameSlotChange}
    />
    Use same time slots every week
   </label>

   {sameSlot ? (
    <div>
     <label></label>
     {timeSlots.map((slot, i) => (
      <div key={i}>
       <input
        type="time"
        value={slot}
        onChange={(e) => {
         const updated = [...timeSlots];
         updated[i] = e.target.value;
         setTimeSlots(updated);
        }}
       />

       <button
        className="schedule-form-cancel-button"
        type="button"
        onClick={() => {
         const updated = [...timeSlots];
         updated.splice(i, 1);
         setTimeSlots(updated);
        }}
       >
        Cancel
       </button>
      </div>
     ))}
     <button
      className="schedule-form-add-slot-button"
      type="button"
      onClick={() => setTimeSlots([...timeSlots, ''])}
     >
      + Add Time Slot
     </button>
    </div>
   ) : (
    <div>
     <label>Weekly Time Slots:</label>
     {Array.from({ length: numWeeks }, (_, index) => (
      <div key={index}>
       <label>Week {index + 1} Time Slots:</label>
       {(weeklyTimeSlots[index] || []).map((slot, slotIndex) => (
        <div key={slotIndex}>
         <input
          type="time"
          value={slot}
          onChange={(e) => {
           const updated = [...(weeklyTimeSlots[index] || [])];
           updated[slotIndex] = e.target.value;
           const newWeekly = [...weeklyTimeSlots];
           newWeekly[index] = updated;
           setWeeklyTimeSlots(newWeekly);
          }}
         />
         <button
          type="button"
          onClick={() => {
           const updated = [...(weeklyTimeSlots[index] || [])];
           updated.splice(slotIndex, 1);
           const newWeekly = [...weeklyTimeSlots];
           newWeekly[index] = updated;
           setWeeklyTimeSlots(newWeekly);
          }}
         >
          Remove
         </button>
        </div>
       ))}
       <button
        type="button"
        onClick={() => {
         const updated = [...weeklyTimeSlots];
         if (!updated[index]) updated[index] = [];
         updated[index].push('');
         setWeeklyTimeSlots(updated);
        }}
       >
        + Add Time Slot for Week {index + 1}
       </button>
      </div>
     ))}
    </div>
   )}

   <button type="submit">Create Schedule</button>
  </form>
 );
}

export default ScheduleForm;
