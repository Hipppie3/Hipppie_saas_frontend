
import { useAuth } from '../../context/AuthContext'
import PlayerAuth from './Auth/PlayerAuth'
import PlayerPublic from './Public/PlayerPublic'

function Player() {
  const {isAuthenticated} = useAuth()
    return isAuthenticated ? <PlayerAuth /> : <PlayerPublic />
  }

export default Player
