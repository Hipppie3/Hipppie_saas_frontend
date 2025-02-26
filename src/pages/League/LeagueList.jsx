import { useAuth } from '../../context/AuthContext';
import LeagueListAuth from './Auth/LeagueListAuth';
import LeagueListPublic from './Public/LeagueListPublic';

function LeagueList() {
  const { isAuthenticated } = useAuth();
    return isAuthenticated ? <LeagueListAuth /> : <LeagueListPublic />;
  }

export default LeagueList;
