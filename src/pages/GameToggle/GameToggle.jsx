import { useViewToggle } from '../../context/ViewToggleContext';
import AllGames from '../AllGames/AllGames.jsx';
import GameList from '../Game/Auth/LeagueGameAuth.jsx';
import './GameToggle.css';

function GameToggle() {
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

   {viewMode === 'card' ? <AllGames /> : <GameList />}
  </div>
 );
}

export default GameToggle;
