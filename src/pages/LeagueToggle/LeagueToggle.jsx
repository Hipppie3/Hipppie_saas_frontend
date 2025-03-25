import { useViewToggle } from '../../context/ViewToggleContext';
import AllLeagues from '../AllLeagues/AllLeagues.jsx';
import LeagueList from '../League/Auth/LeagueListAuth.jsx';
import './LeagueToggle.css'

function LeagueToggle() {
 const { viewMode, toggleViewMode } = useViewToggle();

 return (
  <div>
   <div className="view-toggle-buttons">
    <button
     className={viewMode === 'card' ? 'active' : ''}
     onClick={() => toggleViewMode('card')}
    >
     🧩 Card View
    </button>
    <button
     className={viewMode === 'table' ? 'active' : ''}
     onClick={() => toggleViewMode('table')}
    >
     📄 Table View
    </button>
   </div>

   {viewMode === 'card' ? <AllLeagues /> : <LeagueList />}
  </div>
 );
}

export default LeagueToggle;
