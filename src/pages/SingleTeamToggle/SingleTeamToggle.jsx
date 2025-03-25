import { useViewToggle } from '../../context/ViewToggleContext';
import SingleTeam from '../AllTeams/SingleTeam.jsx';
import TeamAuth from '../Team/Auth/TeamAuth.jsx';
import './SingleTeamToggle.css';

function SingleTeamToggle() {
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

   {viewMode === 'card' ? <SingleTeam /> : <TeamAuth />}
  </div>
 );
}

export default SingleTeamToggle;
