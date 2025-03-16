import React, { useEffect, useState } from 'react';
import api from '@api'; // Instead of ../../../utils/api
import { useAuth } from '../../context/AuthContext';
import './GamePeriod.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    const response = await api.get(`/api/gamePeriods/${sportId}`, { withCredentials: true });

    setGamePeriods(response.data); // Show all, handle visibility in UI
   } catch (error) {
    console.error("Error fetching game periods:", error);
   } finally {
    setLoading(false);
   }
  };
  fetchGamePeriods();
 }, [user]);

 const handleHidePeriod = async (periodId) => {
  try {
   await api.put(`/api/gamePeriods/hide/${periodId}`, {}, { withCredentials: true });
   setGamePeriods(gamePeriods.map(period =>
    period.id === periodId ? { ...period, hidden: true } : period
   ));
  } catch (error) {
   console.error("Error hiding game period:", error);
  }
 };

 const handleUnhidePeriod = async (periodId) => {
  try {
   await api.put(`/api/gamePeriods/unhide/${periodId}`, {}, { withCredentials: true });
   setGamePeriods(gamePeriods.map(period =>
    period.id === periodId ? { ...period, hidden: false } : period
   ));
  } catch (error) {
   console.error("Error unhiding game period:", error);
  }
 };

 const handleAddPeriod = async () => {
  try {
   const sportId = user.sports[0].id;
   await api.post(
    `/api/gamePeriods`,
    { sportId, name: newPeriod.name },
    { withCredentials: true }
   );

   // ✅ Refetch game periods after adding a new one
   const updatedResponse = await api.get(`/api/gamePeriods/${sportId}`, { withCredentials: true });
   setGamePeriods(updatedResponse.data); // ✅ Update gamePeriods state with the latest data
  } catch (error) {
   console.error("Error adding game period:", error);
  }
 };

 const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = gamePeriods.findIndex(period => period.id === active.id);
  const newIndex = gamePeriods.findIndex(period => period.id === over.id);

  const reorderedPeriods = arrayMove(gamePeriods, oldIndex, newIndex);
  setGamePeriods(reorderedPeriods);

  try {
   await api.put('/api/gamePeriods/reorder', {
    gamePeriods: reorderedPeriods.map((period, index) => ({ id: period.id, order: index })),
   });
  } catch (error) {
   console.error("Error updating game period order:", error);
  }
 };



 const handleResetPeriods = async () => {
  try {
   const sportId = user.sports[0].id;
   console.log(sportId);
   const response = await api.post(`/api/gamePeriods/reset/${sportId}`, {}, { withCredentials: true });
   setGamePeriods(response.data);
  } catch (error) {
   console.error("Error resetting game periods:", error);
  }
 };

 
 return (

  
  <div className="game-period-container">
   
   {loading ? (
    <p>Loading...</p>
   ) : (
    <div>
     {gamePeriods.map((period) => (
      <div key={period.id} style={{ opacity: period.hidden ? 0.5 : 1 }}>
       <p>{period.name}</p>
       {period.hidden ? (
        <button onClick={() => handleUnhidePeriod(period.id)}>Unhide</button>
       ) : (
        <button onClick={() => handleHidePeriod(period.id)}>Hide</button>
       )}
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
     <button onClick={handleResetPeriods}>Reset to Default</button> {/* ✅ Reset button added back */}
    </div>
   )}
  </div>
 );
}

export default GamePeriod;
