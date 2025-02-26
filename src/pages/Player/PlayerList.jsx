import PlayerListAuth from './Auth/PlayerListAuth'
import PlayerListPublic from './Public/PlayerListPublic'
import { useAuth } from '../../context/AuthContext';

function PlayerList() {
const { isAuthenticated } = useAuth();

return isAuthenticated ? <PlayerListAuth /> : <PlayerListPublic />
}

export default PlayerList
