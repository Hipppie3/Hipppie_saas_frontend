import { useViewToggle } from '../../context/ViewToggleContext';
import AllSeason from '../AllSeason/SeasonList.jsx';
import SeasonsAuth from '../Season/Auth/SeasonList.jsx';


function SeasonToggle() {
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

   {viewMode === 'card' ? <AllSeason /> : <SeasonsAuth />}
  </div>
 );
}

export default SeasonToggle;
