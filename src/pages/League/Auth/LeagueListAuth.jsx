import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useParams } from 'react-router-dom';
import './LeagueListAuth.css';

function LeagueListAuth() {
  const [leagues, setLeagues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const {id} = useParams();
  const [leagueForm, setLeagueForm] = useState({ name: ""});
  const [updateForm, setUpdateForm] = useState({ id: null, name: "" });
  const [message, setMessage] = useState("");
  const [selectedLeagues, setSelectedLeagues] = useState([]); // ✅ Track selected leagues for bulk delete
  const [toggleLeagueForm, setToggleLeagueForm] = useState(true);

  // Fetch Leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await axios.get(`/api/leagues`, { withCredentials: true });
        setLeagues(response.data.leagues || []);
        console.log(response.data.leagues)
      } catch (error) {
        console.error("Error fetching leagues:", error);
      }
    };
    fetchLeagues();
  }, [id]);

  // Create League
  const handleCreateLeague = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/leagues', { ...leagueForm}, { withCredentials: true });
      const newLeague = await axios.get(`/api/leagues`, { withCredentials: true });
      setLeagues(newLeague.data.leagues || []);
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
      const response = await axios.put(`/api/leagues/${updateForm.id}`, { name: updateForm.name }, { withCredentials: true });
      const updatedLeagues = await axios.get('/api/leagues', { withCredentials: true });
      setLeagues(updatedLeagues.data.leagues || []);
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
      await Promise.all(selectedLeagues.map(id => axios.delete(`/api/leagues/${id}`, { withCredentials: true })));
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
    setUpdateForm({ id: league.id, name: league.name });
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

  const handleToggleLeagueForm = () => {
    setToggleLeagueForm(prevToggle => !prevToggle)
  }

  return (
    <div className="leagueList_auth">

      <button onClick={handleToggleLeagueForm}>{toggleLeagueForm ? "Edit League" : "Hide League"}</button>
      {toggleLeagueForm ? (
        <div>
          {leagues.map((league) => (
            <div key={league.id}>
              <h2>{league.name}</h2>
            </div>
          ))}
        </div>
      ) : (
        <>
      <div className="leagueList-btn-container">
        <button className="delete-leagueList-btn" onClick={handleDeleteLeagues}>🗑️</button>
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
                <td>{league.teams?.length || 0}</td>
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
          </>
      )}
    </div>
  );
}

export default LeagueListAuth;
