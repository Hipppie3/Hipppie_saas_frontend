import { useViewToggle } from '../../context/ViewToggleContext';
import SingleLeague from '../AllLeagues/SingleLeague.jsx';
import LeagueAuth from '../League/Auth/LeagueAuth.jsx';
import './SingleLeagueToggle.css';

function SingleLeagueToggle() {
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

   {viewMode === 'card' ? <SingleLeague /> : <LeagueAuth />}
  </div>
 );
}

export default SingleLeagueToggle;
