import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './GamePeriod.css';

function GamePeriod() {
 const [gamePeriods, setGamePeriods] = useState([]);
 const [loading, setLoading] = useState(true);
 const [newPeriod, setNewPeriod] = useState({ name: '', periodNumber: '' });
 const { user } = useAuth();

 useEffect(() => {
  const fetchGamePeriods = async () => {
   if (!user) return;
   try {
    const sportId = user.sports[0].id;
    const response = await axios.get(`/api/gamePeriods/${sportId}`, { withCredentials: true });
    setGamePeriods(response.data);
   } catch (error) {
    console.error("Error fetching game periods:", error);
   } finally {
    setLoading(false);
   }
  };
  fetchGamePeriods();
 }, [user]);

 const handleDeletePeriod = async (periodId) => {
  try {
   await axios.delete(`/api/gamePeriods/${periodId}`, { withCredentials: true });
   setGamePeriods(gamePeriods.filter(period => period.id !== periodId));
  } catch (error) {
   console.error("Error deleting game period:", error);
  }
 };

 const handleAddPeriod = async () => {
  try {
   const sportId = user.sports[0].id; // Ensure sportId is correctly passed
   const response = await axios.post(
    `/api/gamePeriods`,
    { sportId, name: newPeriod.name },
    { withCredentials: true }
   );
   setGamePeriods([...gamePeriods, response.data]);
  } catch (error) {
   console.error("Error adding game period:", error);
  }
 };


 const handleResetPeriods = async () => {
  try {
   const sportId = user.sports[0].id;
   console.log(sportId); // Log to confirm
   const response = await axios.post(`/api/gamePeriods/reset/${sportId}`, {}, { withCredentials: true });
   setGamePeriods(response.data);
  } catch (error) {
   console.error("Error resetting game periods:", error);
  }
 };

console.log(gamePeriods)
 return (
  <div className="game-period-container">
   {loading ? (
    <p>Loading...</p>
   ) : (
    <div>
     {gamePeriods.map((period) => (
      <div key={period.id}>
       <p>{period.name}</p>
       <button onClick={() => handleDeletePeriod(period.id)}>Delete</button>
      </div>
     ))}
     <div>
      <input
       type="text"
       placeholder="Period Name"
       value={newPeriod.name}
       onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
      />
      <button onClick={handleAddPeriod}>Add Game Period</button>
     </div>
     <button onClick={handleResetPeriods}>Reset to Default</button>
    </div>
   )}
  </div>
 );
}

export default GamePeriod;
