import { useEffect, useState } from "react";
import api from "@api";
import "./SeasonList.css";
import { NavLink, useNavigate } from "react-router-dom";

function SeasonList() {
 const [seasons, setSeasons] = useState([]);
 const [seasonForm, setSeasonForm] = useState({ name: "", startDate: "", finishDate: "", isActive: true });
 const [updateForm, setUpdateForm] = useState({ id: null, name: "", startDate: "", finishDate: "", isActive: true });
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
 const [selectedSeasons, setSelectedSeasons] = useState([]);
 const [message, setMessage] = useState("");
 const navigate = useNavigate();
 
 useEffect(() => {
  const fetchSeasons = async () => {
   try {
    const res = await api.get("/api/seasons", { withCredentials: true });
    setSeasons(res.data.seasons || []);
   } catch (err) {
    console.error("Error fetching seasons:", err);
   }
  };
  fetchSeasons();
 }, []);

 const handleCreateSeason = async (e) => {
  e.preventDefault();
  try {
   const res = await api.post("/api/seasons", seasonForm, { withCredentials: true });
   setSeasons((prev) => [...prev, res.data.season]);
   setSeasonForm({ name: "", startDate: "", finishDate: "", isActive: true });
   setIsModalOpen(false);
   setMessage(`${res.data.season.name} created`);
   setTimeout(() => setMessage(""), 3000);
  } catch (err) {
   console.error("Create error:", err);
  }
 };

 const handleUpdateSeason = async (e) => {
  e.preventDefault();
  try {
   const res = await api.put(`/api/seasons/${updateForm.id}`, updateForm, { withCredentials: true });
   const updated = await api.get("/api/seasons", { withCredentials: true });
   setSeasons(updated.data.seasons || []);
   setIsUpdateModalOpen(false);
   setMessage(`${res.data.season.name} updated`);
   setTimeout(() => setMessage(""), 3000);
  } catch (err) {
   console.error("Update error:", err);
  }
 };

 const handleDeleteSeasons = async () => {
  if (!selectedSeasons.length) return alert("Select at least one season to delete.");
  if (!window.confirm("Delete selected seasons?")) return;
  try {
   await Promise.all(
    selectedSeasons.map((id) => api.delete(`/api/seasons/${id}`, { withCredentials: true }))
   );
   setSeasons((prev) => prev.filter((s) => !selectedSeasons.includes(s.id)));
   setSelectedSeasons([]);
   setMessage("Seasons deleted");
   setTimeout(() => setMessage(""), 3000);
  } catch (err) {
   console.error("Delete error:", err);
  }
 };

 const openUpdateModal = (season) => {
  setUpdateForm({
   id: season.id,
   name: season.name,
   startDate: season.startDate,
   finishDate: season.finishDate,
   isActive: season.isActive,
  });
  setIsUpdateModalOpen(true);
 };

 const handleCheckboxChange = (id) => {
  setSelectedSeasons((prev) =>
   prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
  );
 };

 const handleSelectAll = () => {
  if (selectedSeasons.length === seasons.length) {
   setSelectedSeasons([]);
  } else {
   setSelectedSeasons(seasons.map((s) => s.id));
  }
 };

 const toLocalDateInput = (dateStr) => {
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset(); // in minutes
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
 };


 return (
  <div className="season_auth_container">
   <div className="season-btn-container">
    <button className="delete-season-btn" onClick={handleDeleteSeasons}>🗑️</button>
    <h2>SEASONS</h2>
    <button className="add-season-btn" onClick={() => setIsModalOpen(true)}>+ Add Season</button>
   </div>

   {isModalOpen && (
    <div className="modal-overlay">
     <div className="modal-content">
      <h3>Create Season</h3>
      <form onSubmit={handleCreateSeason}>
       <input type="text" value={seasonForm.name} placeholder="Season name" onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })} required />
       <input type="date" value={seasonForm.startDate} onChange={(e) => setSeasonForm({ ...seasonForm, startDate: e.target.value })} />
       <input type="date" value={seasonForm.finishDate} onChange={(e) => setSeasonForm({ ...seasonForm, finishDate: e.target.value })} />
       <label>
        Active:
        <input type="checkbox" checked={seasonForm.isActive} onChange={(e) => setSeasonForm({ ...seasonForm, isActive: e.target.checked })} />
       </label>
       <button type="submit">Create</button>
       <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
      </form>
     </div>
    </div>
   )}

   {isUpdateModalOpen && (
    <div className="modal-overlay">
     <div className="modal-content">
      <h3>Update Season</h3>
      <form onSubmit={handleUpdateSeason}>
       <input type="text" value={updateForm.name} onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })} required />
       <input
        type="date"
        value={updateForm.startDate ? toLocalDateInput(updateForm.startDate) : ""}
        onChange={(e) => setUpdateForm({ ...updateForm, startDate: e.target.value })}
       />

       <input
        type="date"
        value={updateForm.finishDate ? toLocalDateInput(updateForm.finishDate) : ""}
        onChange={(e) => setUpdateForm({ ...updateForm, finishDate: e.target.value })}
       />

       <label>
        Active:
        <input type="checkbox" checked={updateForm.isActive} onChange={(e) => setUpdateForm({ ...updateForm, isActive: e.target.checked })} />
       </label>
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
      <th><input type="checkbox" checked={selectedSeasons.length === seasons.length} onChange={handleSelectAll} /></th>
      <th>ID</th>
      <th>Name</th>
      <th>Start</th>
      <th>Finish</th>
      <th>Active</th>
      <th></th>
     </tr>
    </thead>
    <tbody>
     {seasons.length === 0 ? (
      <tr><td colSpan="6">No seasons available</td></tr>
     ) : (
      seasons.map((season, i) => (
       <tr key={season.id}>
        <td><input type="checkbox" checked={selectedSeasons.includes(season.id)} onChange={() => handleCheckboxChange(season.id)} /></td>
        <td>{i + 1}</td>
        <td className='season-name-link' onClick={() => navigate(`/dashboard/singleSeasonToggle/${season.id}`)}>{season.name}</td>
        <td>{new Date(season.startDate).toLocaleDateString()}</td>
        <td>{new Date(season.finishDate).toLocaleDateString()}</td>
        <td>{season.isActive ? "✅" : "❌"}</td>
        <td>
         <button className="season-update-btn" onClick={() => openUpdateModal(season)}>✏️ EDIT</button>
        </td>
       </tr>
      ))
     )}
    </tbody>
   </table>
  </div>
 );
}

export default SeasonList;
