import { useAuth } from '../../context/AuthContext'
import TeamAuth from './Auth/TeamAuth';
import TeamPublic from './Public/TeamPublic'

function Team() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <TeamAuth /> : <TeamPublic />
}

export default Team
