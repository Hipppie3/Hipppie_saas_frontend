import { useViewToggle } from '../../context/ViewToggleContext';
import AllPlayers from '../AllPlayers/AllPlayers.jsx';
import PlayerList from '../Player/Auth/PlayerListAuth.jsx';
import './PlayerToggle.css';

function PlayerToggle() {
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

   {viewMode === 'card' ? <AllPlayers /> : <PlayerList />}
  </div>
 );
}

export default PlayerToggle;
