import { useEffect, useState } from "react";
import api from '@api';
import './SeasonList.css'
import { useNavigate } from "react-router-dom";

function SeasonList() {
 const [seasons, setSeasons] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [seasonForm, setSeasonForm] = useState({
  name: '',
  startDate: '',
  finishDate: '',
  isActive: true,
  isVisible: true
 });
 const [showEditModal, setShowEditModal] = useState(false); // To show/hide modal
 const [selectedSeason, setSelectedSeason] = useState(null); // Store season data for editing
 const navigate = useNavigate();


 useEffect(() => {
  const fetchSeasons = async () => {
   try {
    const response = await api.get('/api/seasons', { withCrendentials: true });
    setSeasons(response.data.seasons);
    console.log(response.data.seasons)
   } catch (error) {
    console.error("Error fetching seasons:", error)
   }
  }; fetchSeasons()
 }, []);

 const handleCreateSeason = async (e) => {
  e.preventDefault();
  try {
   const response = await api.post('/api/seasons', seasonForm, { withCredentials: true });

   setSeasons(prev => [...prev, response.data.season]);
   setShowForm(false);
   setSeasonForm({
    name: '',
    startDate: '',
    finishDate: '',
    isActive: true,
    isVisible: true
   });
  } catch (error) {
   console.error("Create season error:", error);
  }
 };

 const handleUpdateSeason = async (e) => {
  e.preventDefault();
  try {
   const response = await api.put(`/api/seasons/${selectedSeason.id}`, selectedSeason, { withCredentials: true });

   // Update the local seasons state after success
   setSeasons(prev => prev.map(season =>
    season.id === selectedSeason.id ? { ...season, ...selectedSeason } : season
   ));

   setShowEditModal(false);  // Close the modal after update
  } catch (error) {
   console.error("Update season error:", error);
  }
 };

 const handleDeleteSeason = async (id) => {
  if (!window.confirm("Are you sure you want to delete this season? Everything associated with this season will be deleted!" )) return;

  try {
   await api.delete(`/api/seasons/${id}`, { withCredentials: true });
   setSeasons(prev => prev.filter(season => season.id !== id));
  } catch (error) {
   console.error("Delete season error:", error);
  }
 };




 return (
  <div className="seasonList-container">

   {showForm && (
    <div className="modal">
     <div className="modal-content">
      <h2>New Season</h2>
      <form className="season_form" onSubmit={handleCreateSeason}>
       <input
        type="text"
        placeholder="Season Name"
        value={seasonForm.name}
        onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
       />
       <input
        type="date"
        value={seasonForm.startDate}
        onChange={(e) => setSeasonForm({ ...seasonForm, startDate: e.target.value })}
       />
       <input
        type="date"
        value={seasonForm.finishDate}
        onChange={(e) => setSeasonForm({ ...seasonForm, finishDate: e.target.value })}
       />
       <div className="modal-buttons-container">
        <label className="switch">
         <input
          type="checkbox"
          checked={seasonForm.isActive}
          onChange={(e) =>
           setSeasonForm({
            ...seasonForm,
            isActive: e.target.checked
           })
          }
         />
         <span className="slider" />
        </label>
        <div className="modal-update-cancel-button">
         <button type="submit">Create</button>
         <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        </div>
       </div>
      </form>
     </div>
    </div>
   )}


   {showEditModal && (
    <div className="modal">
     <div className="modal-content">
      <h2>Edit Season</h2>
      <form onSubmit={(e) => handleUpdateSeason(e, selectedSeason.id)}>
       <input
        type="text"
        placeholder="Season Name"
        value={selectedSeason.name}
        onChange={(e) => setSelectedSeason({ ...selectedSeason, name: e.target.value })}
       />
       <input
        type="date"
        value={selectedSeason.startDate ? new Date(selectedSeason.startDate).toISOString().split('T')[0] : ''} 
        onChange={(e) => setSelectedSeason({ ...selectedSeason, startDate: e.target.value })}
       />
       <input
        type="date"
        value={selectedSeason.finishDate ? new Date(selectedSeason.finishDate).toISOString().split('T')[0] : ''} 
        onChange={(e) => setSelectedSeason({ ...selectedSeason, finishDate: e.target.value })}
       />
       <div className="modal-buttons-container">
       <label className="switch">
        <input
         type="checkbox"
         checked={selectedSeason.isActive}
         onChange={(e) =>
          setSelectedSeason({
           ...selectedSeason,
           isActive: e.target.checked
          })
         }
        />
        <span className="slider" />
       </label>
        <div className="modal-update-cancel-button">
         <button type="submit">Update</button>
         <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
        </div>
       </div>
      </form>
     </div>
    </div>
   )}


    <div className="season-card-container">    
    <div className="season-card add-season-card" onClick={() => setShowForm(true)}>
     <div className="add-season-content">
      <span className="add-icon">＋</span>
      <p>Add Season</p>
     </div>
    </div>


    {seasons.map((season) => (
     <div className="season-card" onClick={() => navigate(`/dashboard/singleSeasonToggle/${season.id}`)} key={season.id}>
      <h3>{season.name}</h3>
      <p>Start Date: {new Date(season.startDate).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</p>
      <p>Finish Date: {new Date(season.finishDate).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</p>
      <p className="season_status">
       <span className={`status_dot ${season.isActive ? 'active' : 'inactive'}`}></span>
       {season.isActive ? "Active" : "Inactive"}
      </p>

      {/* Edit Button */}
      <button onClick={(e) => {
       e.stopPropagation();
       setSelectedSeason(season);
       setShowEditModal(true);
      }}>
       Edit
      </button>
      <button
       onClick={(e) => {
        e.stopPropagation(); // prevents navigating to the season page
        handleDeleteSeason(season.id);
       }}
      >
       Delete
      </button>

     </div>
    ))}
    </div>
  </div>
 );
}

export default SeasonList;
