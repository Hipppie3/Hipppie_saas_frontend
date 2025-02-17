import React from 'react'
import { useAuth } from '../../context/AuthContext';
import TeamListAuth from './TeamListAuth';
import TeamListPublic from './TeamListPublic';

function TeamList() {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <TeamListAuth /> : <TeamListPublic />;
}

export default TeamList
