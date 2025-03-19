import React, { useEffect, useState } from 'react';
import api from '@api'; // Instead of ../../../utils/api
import { useAuth } from '../../context/AuthContext';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './GamePeriod.css';

function GamePeriod() {
  const [gamePeriods, setGamePeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPeriod, setNewPeriod] = useState({ name: '' });
  const { user } = useAuth();

  useEffect(() => {
    const fetchGamePeriods = async () => {
      if (!user) return;
      try {
        const sportId = user.sports[0].id;
        const response = await api.get(`/api/gamePeriods/${sportId}`, { withCredentials: true });

        setGamePeriods(response.data.sort((a, b) => a.order - b.order)); // ✅ Ensure sorting by order
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
      setGamePeriods((prev) =>
        prev.map(period =>
          period.id === periodId ? { ...period, hidden: true } : period
        )
      );
    } catch (error) {
      console.error("Error hiding game period:", error);
    }
  };

  const handleUnhidePeriod = async (periodId) => {
    try {
      await api.put(`/api/gamePeriods/unhide/${periodId}`, {}, { withCredentials: true });
      setGamePeriods((prev) =>
        prev.map(period =>
          period.id === periodId ? { ...period, hidden: false } : period
        )
      );
    } catch (error) {
      console.error("Error unhiding game period:", error);
    }
  };

  const handleAddPeriod = async () => {
    try {
      const sportId = user.sports[0].id;
      await api.post(`/api/gamePeriods`, { sportId, name: newPeriod.name }, { withCredentials: true });

      // ✅ Refetch game periods after adding a new one
      const updatedResponse = await api.get(`/api/gamePeriods/${sportId}`, { withCredentials: true });
      setGamePeriods(updatedResponse.data.sort((a, b) => a.order - b.order));
      setNewPeriod({ name: "" });
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
      const response = await api.post(`/api/gamePeriods/reset/${sportId}`, {}, { withCredentials: true });
      setGamePeriods(response.data.sort((a, b) => a.order - b.order)); // ✅ Ensure sorting by order
    } catch (error) {
      console.error("Error resetting game periods:", error);
    }
  };

  const handleHideAllPeriods = async () => {
    try {
      const periodIds = gamePeriods.map(period => period.id);
      await Promise.all(
        periodIds.map(periodId =>
          api.put(`/api/gamePeriods/hide/${periodId}`, {}, { withCredentials: true })
        )
      );
      setGamePeriods((prev) => prev.map(period => ({ ...period, hidden: true })));
    } catch (error) {
      console.error("Error hiding all game periods:", error);
    }
  };

  return (
    <div className="game-period-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={gamePeriods.map(period => period.id)}>
              {gamePeriods
                .sort((a, b) => a.order - b.order) // ✅ Ensure sorting
                .map((period) => (
                  <SortablePeriod key={period.id} period={period} onHide={handleHidePeriod} onUnhide={handleUnhidePeriod} />
                ))}
            </SortableContext>
          </DndContext>

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
          <button onClick={handleHideAllPeriods}>Hide All</button>
        </div>
      )}
    </div>
  );
}

function SortablePeriod({ period, onHide, onUnhide }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: period.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    opacity: period.hidden ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="period-item">
      <p {...attributes} {...listeners}>{period.name}</p>
      {period.hidden ? (
        <button onClick={() => onUnhide(period.id)}>Unhide</button>
      ) : (
        <button onClick={() => onHide(period.id)}>Hide</button>
      )}
    </div>
  );
}

export default GamePeriod;
