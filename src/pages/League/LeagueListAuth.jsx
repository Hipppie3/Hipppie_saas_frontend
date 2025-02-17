import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import './LeagueListAuth.css';

function LeagueListAuth() {
  const [leagues, setLeagues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [leagueForm, setLeagueForm] = useState({ name: "" });
  const [updateForm, setUpdateForm] = useState({ id: null, name: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await axios.get('/api/leagues', { withCredentials: true });
        setLeagues(response.data.leagues || []);
      } catch (error) {
        console.error("Error fetching leagues:", error);
      }
    };
    fetchLeagues();
  }, []);

  // ✅ Create League
  const handleCreateLeague = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/leagues', leagueForm, { withCredentials: true });
      setLeagues([...leagues, response.data.league]);
      setLeagueForm({ name: "" });
      setMessage(`${response.data.league.name} created successfully`);
      setIsModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating league:', error);
    }
  };

  // ✅ Delete League
  const handleDeleteLeague = async (id) => {
    if (!window.confirm("Are you sure you want to delete this league?")) return;
    try {
      const response = await axios.delete(`/api/leagues/${id}`, { withCredentials: true });
      if (response.data.success) {
        setLeagues(leagues.filter(league => league.id !== id));
        setMessage("League deleted successfully");
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting league:', error);
    }
  };

  // ✅ Open Update Modal
  const openUpdateModal = (league) => {
    setUpdateForm({ id: league.id, name: league.name });
    setIsUpdateModalOpen(true);
  };

  // ✅ Handle Update League
  const handleUpdateLeague = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/leagues/${updateForm.id}`, { name: updateForm.name }, { withCredentials: true });
      setLeagues(leagues.map(league => league.id === updateForm.id ? response.data.league : league));
      setMessage(`${response.data.league.name} updated successfully`);
      setIsUpdateModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating league:', error);
    }
  };

  return (
    <div className="leagueList_auth">
      <button className="add-league-btn" onClick={() => setIsModalOpen(true)}>Add League</button>

      {/* ✅ Create League Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create League</h3>
            <form onSubmit={handleCreateLeague}>
              <input 
                type="text"
                name="name"
                value={leagueForm.name}
                onChange={(e) => setLeagueForm({ name: e.target.value })}
                placeholder="Enter league name"
                required
              />
              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Update League Modal */}
      {isUpdateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update League</h3>
            <form onSubmit={handleUpdateLeague}>
              <input 
                type="text"
                name="name"
                value={updateForm.name}
                onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                required
              />
              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}

      <table className="league-table">
        <thead>
          <tr>
            <th>Leagues</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leagues.length === 0 ? (
            <tr><td colSpan="2">No leagues available</td></tr>
          ) : (
            leagues.map((league) => (
              <tr key={league.id}>
                <td>
                  <NavLink to={`/league/${league.id}`}>{league.name}</NavLink>
                </td>
                <td>
                  <button className="update-btn" onClick={() => openUpdateModal(league)}>Update</button>
                  <button className="delete-btn" onClick={() => handleDeleteLeague(league.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeagueListAuth;
