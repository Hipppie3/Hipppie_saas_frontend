import { useEffect, useState } from "react";
import api from "@api";
import { useParams, useNavigate } from "react-router-dom";
import "./Season.css";

function Season() {
 const { id: seasonId } = useParams();
 const navigate = useNavigate();
 const [leagues, setLeagues] = useState([]);
 const [leagueForm, setLeagueForm] = useState({ name: "" });
 const [updateForm, setUpdateForm] = useState({ id: null, name: "" });
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
 const [selectedLeagues, setSelectedLeagues] = useState([]);
 const [loading, setLoading] = useState(true);
 const [message, setMessage] = useState("");

 useEffect(() => {
  const fetchLeagues = async () => {
   try {
    const res = await api.get("/api/leagues", { withCredentials: true });
    setLeagues(res.data.leagues || []);
   } catch (err) {
    console.error("Fetch leagues error:", err);
   } finally {
    setLoading(false); // ✅ Only after fetch completes
   }
  };
  fetchLeagues();
 }, []);

 const filteredLeagues = leagues.filter((l) => l.seasonId === Number(seasonId));

 const handleCreateLeague = async (e) => {
  e.preventDefault();
  try {
   const res = await api.post("/api/leagues", {
    ...leagueForm,
    seasonId: Number(seasonId),
   }, { withCredentials: true });

   setLeagues((prev) => [...prev, res.data.league]);
   setLeagueForm({ name: "" });
   setIsModalOpen(false);
   setMessage(`${res.data.league.name} created`);
   setTimeout(() => setMessage(""), 3000);
  } catch (err) {
   console.error("Create error:", err);
  }
 };

 const handleUpdateLeague = async (e) => {
  e.preventDefault();
  try {
   const res = await api.put(`/api/leagues/${updateForm.id}`, updateForm, { withCredentials: true });
   setLeagues((prev) =>
    prev.map((l) => (l.id === updateForm.id ? res.data.league : l))
   );
   setIsUpdateModalOpen(false);
   setMessage(`${res.data.league.name} updated`);
   setTimeout(() => setMessage(""), 3000);
  } catch (err) {
   console.error("Update error:", err);
  }
 };

 const handleDeleteLeagues = async () => {
  if (!selectedLeagues.length) return alert("Select at least one league.");
  if (!window.confirm("Delete selected leagues?")) return;
  try {
   await Promise.all(
    selectedLeagues.map((id) => api.delete(`/api/leagues/${id}`, { withCredentials: true }))
   );
   setLeagues((prev) => prev.filter((l) => !selectedLeagues.includes(l.id)));
   setSelectedLeagues([]);
   setMessage("Leagues deleted");
   setTimeout(() => setMessage(""), 3000);
  } catch (err) {
   console.error("Delete error:", err);
  }
 };

 const openUpdateModal = (league) => {
  setUpdateForm({ id: league.id, name: league.name });
  setIsUpdateModalOpen(true);
 };

 const handleCheckboxChange = (id) => {
  setSelectedLeagues((prev) =>
   prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
 };

 const handleSelectAll = () => {
  if (selectedLeagues.length === filteredLeagues.length) {
   setSelectedLeagues([]);
  } else {
   setSelectedLeagues(filteredLeagues.map((l) => l.id));
  }
 };

 return (
  <div className="season_auth_container">
   <div className="season-btn-container">
    <button className="delete-season-btn" onClick={handleDeleteLeagues}>🗑️</button>
    <h2>LEAGUES IN SEASON</h2>
    <button className="add-season-btn" onClick={() => setIsModalOpen(true)}>+ Add League</button>
   </div>

   {isModalOpen && (
    <div className="modal-overlay">
     <div className="modal-content">
      <h3>Create League</h3>
      <form onSubmit={handleCreateLeague}>
       <input type="text" placeholder="League Name" value={leagueForm.name} onChange={(e) => setLeagueForm({ name: e.target.value })} required />
       <button type="submit">Create</button>
       <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
      </form>
     </div>
    </div>
   )}

   {isUpdateModalOpen && (
    <div className="modal-overlay">
     <div className="modal-content">
      <h3>Update League</h3>
      <form onSubmit={handleUpdateLeague}>
       <input type="text" value={updateForm.name} onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })} required />
       <button type="submit">Update</button>
       <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
      </form>
     </div>
    </div>
   )}

   {message && <p className="message">{message}</p>}

   <table className="season-table">
    <thead>
     <tr>
      <th><input type="checkbox" checked={selectedLeagues.length === filteredLeagues.length} onChange={handleSelectAll} /></th>
      <th>ID</th>
      <th>League Name</th>
      <th>Teams</th>
      <th></th>
     </tr>
    </thead>
    <tbody>
     {loading ? null : 
     filteredLeagues.length === 0 ? (
      <tr><td colSpan="5">No leagues available</td></tr>
     ) : (
      filteredLeagues.map((league, i) => (
       <tr key={league.id}>
        <td><input type="checkbox" checked={selectedLeagues.includes(league.id)} onChange={() => handleCheckboxChange(league.id)} /></td>
        <td>{i + 1}</td>
        <td className='season-name-link' onClick={() => navigate(`/dashboard/singleLeagueToggle/${league.id}`)} >
         {league.name}
        </td>
        <td>{league.teamsCount || 0}</td>
        <td>
         <button className="season-update-btn" onClick={() => openUpdateModal(league)}>✏️ EDIT</button>
        </td>
       </tr>
      ))
     )}
    </tbody>
   </table>
  </div>
 );
}

export default Season;
