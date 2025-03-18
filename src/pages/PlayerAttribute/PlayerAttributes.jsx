import React, { useState, useEffect } from 'react';
import api from '@api';
import { useAuth } from '../../context/AuthContext';
import './PlayerAttributes.css'

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


  return (
    <div className="player-attributes-container">
      <h2>Player Attributes</h2>

      {/* Add Attribute Form */}
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

      {/* List of Attributes */}
      <ul>
        {attributes.map(attribute => (
          <li key={attribute.id}>
            {attribute.attribute_name} ({attribute.attribute_type}) - {attribute.is_visible ? 'Visible' : 'Hidden'}
            <button onClick={() => toggleVisibility(attribute.id, !attribute.is_visible)}>
              {attribute.is_visible ? 'Hide' : 'Show'}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={resetAttributes}>Reset to Default</button>

    </div>
  );
}

export default PlayerAttributes;
