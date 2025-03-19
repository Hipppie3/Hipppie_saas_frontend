import React, { useState, useEffect } from 'react';
import api from '@api';
import { useAuth } from '../../context/AuthContext';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './PlayerAttributes.css';

function PlayerAttributes() {
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: '', type: 'string' });
  const { user } = useAuth();

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const response = await api.get('/api/playerAttributes', { withCredentials: true });
      setAttributes(response.data);
    } catch (error) {
      console.error("Error fetching attributes", error);
    }
  };

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/playerAttributes', newAttribute, { withCredentials: true });
      setNewAttribute({ name: '', type: 'string' });
      fetchAttributes(); // Refresh the attributes list
    } catch (error) {
      console.error("Error adding attribute", error);
    }
  };

  const toggleVisibility = async (id, isVisible) => {
    try {
      await api.put(`/api/playerAttributes/${id}/toggleAttributeVisibility`, { is_visible: isVisible }, { withCredentials: true });
      fetchAttributes(); // Refresh list
    } catch (error) {
      console.error("Error toggling visibility", error);
    }
  };

  const resetAttributes = async () => {
    try {
      await api.post('/api/playerAttributes/reset', { withCredentials: true });
      fetchAttributes(); // Refresh the list
    } catch (error) {
      console.error("Error resetting attributes", error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = attributes.findIndex(attr => attr.id === active.id);
    const newIndex = attributes.findIndex(attr => attr.id === over.id);

    const reorderedAttributes = arrayMove(attributes, oldIndex, newIndex);
    setAttributes(reorderedAttributes);

    try {
      await api.put('/api/playerAttributes/reorder', {
        attributes: reorderedAttributes.map((attr, index) => ({ id: attr.id, order: index })),
      });
    } catch (error) {
      console.error("Error updating attribute order:", error);
    }
  };

  return (
    <div className="player-attributes-container">
      <h2>Player Attributes</h2>

      <form onSubmit={handleAddAttribute}>
        <input
          type="text"
          placeholder="Attribute Name"
          value={newAttribute.name}
          onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
        />
        <select
          value={newAttribute.type}
          onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value })}
        >
          <option value="string">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
        </select>
        <button type="submit">Add Attribute</button>
      </form>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={attributes.map(attr => attr.id)}>
          <ul>
            {attributes.map(attribute => (
              <SortableAttribute key={attribute.id} attribute={attribute} onToggle={toggleVisibility} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button onClick={resetAttributes}>Reset to Default</button>
    </div>
  );
}

function SortableAttribute({ attribute, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: attribute.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    opacity: attribute.is_visible ? 1 : 0.5,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {attribute.attribute_name} ({attribute.attribute_type}) - {attribute.is_visible ? 'Visible' : 'Hidden'}
      <button onClick={() => onToggle(attribute.id, !attribute.is_visible)}>
        {attribute.is_visible ? 'Hide' : 'Show'}
      </button>
    </li>
  );
}

export default PlayerAttributes;
