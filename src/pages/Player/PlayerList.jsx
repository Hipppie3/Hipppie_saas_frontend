import React from 'react'
import './PlayerList.css'
import PlayerListAuth from './PlayerListAuth'
import PlayerListPublic from './PlayerListPublic'
import { useAuth } from '../../context/AuthContext';

function PlayerList() {
const { isAuthenticated } = useAuth();
  return (
    <div className="playerList_container">
      {isAuthenticated ? <PlayerListAuth /> : <PlayerListPublic/ >}
    </div>
  )
}

export default PlayerList
