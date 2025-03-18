import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@api'; // Instead of ../../../utils/api
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
      const response = await api.get(`/api/stats/${sportId}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoading(false);
  };
console.log(user)
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return; // ✅ Prevent unnecessary updates

    // Get indexes before and after drag
    const oldIndex = stats.findIndex(stat => stat.id === active.id);
    const newIndex = stats.findIndex(stat => stat.id === over.id);

    // ✅ Reorder stats in state
    const reorderedStats = arrayMove(stats, oldIndex, newIndex);
    setStats(reorderedStats);

    try {
      // ✅ Save the new order in the database
      await api.put('/api/stats/reorder', {
        stats: reorderedStats.map((stat, index) => ({ id: stat.id, order: index })),
      });

      // ✅ Fetch the updated stats again from the backend to confirm order
      fetchStatsBySport();
    } catch (error) {
      console.error("Error updating stat order:", error);
    }
  };



  const handleHideStat = async (id, currentVisibility) => {
    try {
      await api.put(`/api/stats/${id}/toggle-visibility`, { hidden: !currentVisibility });

      // ✅ Maintain the current order instead of fetching from backend again
      setStats((prevStats) =>
        prevStats
          .map(stat =>
            stat.id === id ? { ...stat, hidden: !currentVisibility } : stat
          )
          .sort((a, b) => a.order - b.order) // ✅ Ensure order stays consistent
      );
    } catch (error) {
      console.error("Error hiding stat:", error);
    }
  };


  const handleResetStats = async () => {
    if (!window.confirm("Are you sure you want to reset stats to default? This will remove duplicates and restore original stats.")) return;

    try {
      const sportId = user.sports[0].id;
      await api.post('/api/stats/reset', { sportId });
      fetchStatsBySport(); // ✅ Refresh the stats after reset
    } catch (error) {
      console.error("Error resetting stats:", error);
    }
  };
  const handleAddStat = async () => {
    if (!newStat.name || !newStat.shortName) {
      return alert("Please fill all fields");
    }

    try {
      const sportId = user.sports[0].id;
      const response = await api.post('/api/stats', {
        sportId,
        name: newStat.name,
        shortName: newStat.shortName
      });

      setStats([...stats, response.data]); // ✅ Add new stat to the list
      setNewStat({ name: '', shortName: '' }); // ✅ Reset input fields
    } catch (error) {
      console.error("Error adding stat:", error);
    }
  };


  if (!user) return <p>Loading user...</p>;
  if (loading) return <p>Loading stats...</p>;

  return (
    <div className="statAuth-container">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}> {/* ✅ Fix applied here */}
        <SortableContext items={stats.map(stat => stat.id)}> {/* ✅ Keep all stats sortable */}
          <div className="stats-list">
            {stats.map((stat) => (
              <SortableStat key={stat.id} stat={stat} onHide={handleHideStat} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="bottom-stat">
        <div className="add-stat-form">
          <h3>Add New Stat</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!newStat.name || !newStat.shortName) return alert("Please fill all fields");
            handleAddStat();
          }}>
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
          <button className="reset-button" onClick={handleResetStats}>Reset Stats</button> {/* ✅ Reset Button */}
        </div>
      </div>
    </div>
  );
}

function SortableStat({ stat, onHide }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    opacity: stat.hidden ? 0.5 : 1,  // ✅ Gray out hidden stats
  };

  return (
    <div ref={setNodeRef} style={style} className="stat-item">
      <h3 {...attributes} {...listeners}>
        {stat.name} ({stat.shortName})
      </h3>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onHide(stat.id, stat.hidden);
        }}
      >
        {stat.hidden ? 'Unhide' : 'Hide'}
      </button>
    </div>
  );
}

export default Stats;
