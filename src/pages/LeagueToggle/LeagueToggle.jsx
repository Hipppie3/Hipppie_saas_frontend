import { useViewToggle } from '../../context/ViewToggleContext';
import AllLeagues from '../AllLeagues/AllLeagues.jsx';
import LeagueList from '../League/Auth/LeagueListAuth.jsx';
import './LeagueToggle.css';

function LeagueToggle() {
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

      {viewMode === 'card' ? <AllLeagues /> : <LeagueList />}
    </div>
  );
}

export default LeagueToggle;
