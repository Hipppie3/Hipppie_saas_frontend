import { useAuth } from '../../context/AuthContext';
import TeamListAuth from './Auth/TeamListAuth';
import TeamListPublic from './Public/TeamListPublic';

function TeamList() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <TeamListAuth /> : <TeamListPublic />;
}

export default TeamList
