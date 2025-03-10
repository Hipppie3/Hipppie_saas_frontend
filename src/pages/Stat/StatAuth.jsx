import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './StatAuth.css';
import { useAuth } from '../../context/AuthContext';

function Stats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStat, setNewStat] = useState({ name: '', shortName: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchStatsBySport();
  }, [user]);

  const fetchStatsBySport = async () => {
    if (!user || !user.sports || user.sports.length === 0) return;
    try {
      const sportId = user.sports[0].id;
      const response = await axios.get(`/api/stats/${sportId}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoading(false);
  };

  const handleAddStat = async (e) => {
    e.preventDefault();
    if (!newStat.name || !newStat.shortName) return alert("Please fill all fields");
    try {
      const sportId = user.sports[0].id;
      const response = await axios.post('/api/stats', {
        sportId,
        name: newStat.name,
        shortName: newStat.shortName
      });
      setStats([...stats, response.data]);
      setNewStat({ name: '', shortName: '' });
    } catch (error) {
      console.error("Error adding stat:", error);
    }
  };

  const handleDeleteStat = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this stat?")) return;
      await axios.delete(`/api/stats/${id}`);
      setStats(stats.filter(stat => stat.id !== id));
    } catch (error) {
      console.error("Error deleting stat:", error);
    }
  };

  const handleResetStats = async () => {
    try {
      if (!window.confirm("Are you sure you want to reset stats to default? This will delete all current stats and restore the original ones.")) return;
      const sportId = user.sports[0].id;
      await axios.post(`/api/stats/reset`, { sportId });
      fetchStatsBySport();
    } catch (error) {
      console.error("Error resetting stats:", error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stats.findIndex(stat => stat.id === active.id);
    const newIndex = stats.findIndex(stat => stat.id === over.id);
    const reorderedStats = arrayMove(stats, oldIndex, newIndex);

    setStats(reorderedStats);

    try {
      await axios.put('/api/stats/reorder', {
        stats: reorderedStats.map((stat, index) => ({ id: stat.id, order: index })),
      });
    } catch (error) {
      console.error("Error updating stat order:", error);
    }
  };


  if (!user) return <p>Loading user...</p>;
  if (loading) return <p>Loading stats...</p>;

  return (
    <div className="statAuth-container">
    
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stats.map(stat => stat.id)}>
          <div className="stats-list">
            {stats.map((stat) => (
              <SortableStat key={stat.id} stat={stat} onDelete={handleDeleteStat} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="bottom-stat">
      <div className="add-stat-form">
        <h3>Add New Stat</h3>
        <form onSubmit={handleAddStat}>
          <input
            type="text"
            placeholder="Stat Name"
            value={newStat.name}
            onChange={(e) => setNewStat({ ...newStat, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Short Name"
            value={newStat.shortName}
            onChange={(e) => setNewStat({ ...newStat, shortName: e.target.value })}
          />
          <button className='add-stat-btn' type="submit">Add Stat</button>
        </form>
          <button className="stat-reset-button" onClick={handleResetStats}>Reset to Default</button>
      </div>

      </div>
    </div>
  );
}

function SortableStat({ stat, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab", // ✅ Change cursor to indicate draggable
    backgroundColor: isDragging ? "#f0f0f0" : "#fff", // ✅ Highlight when dragging
    border: isDragging ? "2px solid #007bff" : "1px solid #ddd", // ✅ Add border effect
    opacity: isDragging ? 0.7 : 1, // ✅ Slight transparency while dragging
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="stat-item">
      <h3>{stat.name} ({stat.shortName})</h3>
      <button onClick={() => onDelete(stat.id)}>Delete</button>
    </div>
  );
}


export default Stats;
