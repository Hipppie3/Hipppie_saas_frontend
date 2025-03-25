import { useViewToggle } from '../../context/ViewToggleContext';
import AllTeams from '../AllTeams/AllTeams.jsx';
import TeamList from '../Team/Auth/TeamListAuth.jsx';
import './TeamToggle.css';

function TeamToggle() {
 const { viewMode, toggleViewMode } = useViewToggle();

 return (
  <div>
   <div className="view-toggle-dropdown">
    <label htmlFor="view-select"></label>
    <select
     id="view-select"
     value={viewMode}
     onChange={(e) => toggleViewMode(e.target.value)}
    >
     <option value="card">🧩 Card View</option>
     <option value="table">📄 Table View</option>
    </select>
   </div>

   {viewMode === 'card' ? <AllTeams /> : <TeamList />}
  </div>
 );
}

export default TeamToggle;
