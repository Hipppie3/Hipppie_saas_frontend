import React, { useState, useEffect } from 'react';
import api from '@api'; // Instead of ../../../utils/api
import { NavLink, useParams } from 'react-router-dom';
import './LeagueListAuth.css';

function LeagueListAuth() {
  const [leagues, setLeagues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const {id} = useParams();
  const [leagueForm, setLeagueForm] = useState({ name: "", seasonId: null});
  const [updateForm, setUpdateForm] = useState({ id: null, name: "", seasonId: null });
  const [message, setMessage] = useState("");
  const [selectedLeagues, setSelectedLeagues] = useState([]); // ✅ Track selected leagues for bulk delete
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([])


  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await api.get(`/api/leagues`, { withCredentials: true });
        setLeagues(response.data.leagues || []);
      } catch (error) {
        console.error("Error fetching leagues:", error);
      } finally {
        setLoading(false); // 👈 Done loading
      }
    };
    fetchLeagues();
  }, [id]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await api.get('/api/seasons', { withCredentials: true });
        setSeasons(res.data.seasons || []);
      } catch (err) {
        console.error("Error fetching seasons:", err);
      }
    };
    fetchSeasons();
  }, []);

  if (loading) return null; // 👈 Don't show anything until data is ready


  // Create League
  const handleCreateLeague = async (e) => {
    e.preventDefault();
    if (!leagueForm.seasonId) {
      const confirm = window.confirm("This league has no season. Are you sure you want to create it?");
      if (!confirm) return;
    }
    try {
      const response = await api.post('/api/leagues', { ...leagueForm }, { withCredentials: true });
      // Either this for instant feedback:
      setLeagues(prev => [...prev, {
        id: response.data.league.id,
        name: response.data.league.name,
        teamsCount: 0
      }]);
      // Or this for up-to-date fetch:
      // const updated = await api.get(`/api/leagues/leaguesSummary`, { withCredentials: true });
      // setLeagues(updated.data.leagues || []);

      setLeagueForm({ name: "" });
      setMessage(`${response.data.league.name} created successfully`);
      setIsModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating league:', error);
    }
  };


  // Update League
  const handleUpdateLeague = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/leagues/${updateForm.id}`, { name: updateForm.name, seasonId: updateForm.seasonId }, { withCredentials: true });
      const updated = await api.get('/api/leagues', { withCredentials: true });
      setLeagues(updated.data.leagues || []);
      setMessage(`${response.data.league.name} updated successfully`);
      setIsUpdateModalOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating league:', error);
    }
  };


  // Bulk Delete Leagues
  const handleDeleteLeagues = async () => {
    if (!selectedLeagues.length) {
      return alert("Please select at least one league to delete.");
    }
    if (!window.confirm("Are you sure you want to delete the selected leagues?")) return;
    try {
      await Promise.all(selectedLeagues.map(id => api.delete(`/api/leagues/${id}`, { withCredentials: true })));
      setLeagues((prevLeagues) => prevLeagues.filter(league => !selectedLeagues.includes(league.id)));
      setSelectedLeagues([]); // Clear selection after deletion
      setMessage("Leagues deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting leagues:", error);
    }
  };

  // Open Update Modal
  const openUpdateModal = (league) => {
    setUpdateForm({ id: league.id, name: league.name, seasonId: league.seasonId || null });
    setIsUpdateModalOpen(true);
  };

  // Handle Checkbox Selection
  const handleCheckboxChange = (id) => {
    setSelectedLeagues(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
    );
  };

  // Select All Leagues
  const handleSelectAll = () => {
    if (selectedLeagues.length === leagues.length) {
      setSelectedLeagues([]); // Unselect all if already selected
    } else {
      setSelectedLeagues(leagues.map(league => league.id)); // Select all leagues
    }
  };



  return (
    <div className="leagueList_auth">


      <div className="leagueList-btn-container">
        <button className="delete-leagueList-btn" onClick={handleDeleteLeagues}>🗑️</button>
        <h2>LEAGUES</h2>
        <button className="add-leagueList-btn" onClick={() => setIsModalOpen(true)}> + Add League</button>
      </div>

      {/* Create League Modal */}
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
              <select
                value={leagueForm.seasonId || ''}
                onChange={(e) =>
                  setLeagueForm({ ...leagueForm, seasonId: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">No Season</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>{season.name}</option>
                ))}
              </select>

              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Update League Modal */}
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
              <select
                value={updateForm.seasonId || ''}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, seasonId: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">No Season</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>{season.name}</option>
                ))}
              </select>

              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}

      <table className="leagueList-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedLeagues.length === leagues.length}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Leagues</th>
            <th>Season</th>
            <th># Teams</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {leagues.length === 0 ? (
            <tr><td colSpan="5">No leagues available</td></tr>
          ) : (
            leagues.map((league, index) => (
              <tr key={league.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedLeagues.includes(league.id)}
                    onChange={() => handleCheckboxChange(league.id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>
                  <NavLink to={`/leagues/${league.id}`}>{league.name}</NavLink>
                </td>
                <td>{seasons.find(s => s.id === league.seasonId)?.name || "No Season"}</td>
                <td>{league.teamsCount}</td>
                <td>
                  <button className="leagueList-update-btn" onClick={() => openUpdateModal(league)}>
                    <span>🖊</span> EDIT
                  </button>
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
