import { useViewToggle } from '../../context/ViewToggleContext';
import SingleSeason from '../AllSeason/Leagues/SeasonLeagues.jsx';
import SeasonAuth from '../Season/Auth/Season.jsx';

function SingleSeasonToggle() {
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

   {viewMode === 'card' ? <SingleSeason /> : <SeasonAuth />}
  </div>
 );
}

export default SingleSeasonToggle;
