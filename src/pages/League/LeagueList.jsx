import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LeagueListAuth from './LeagueListAuth';
import LeagueListPublic from './LeagueListPublic';

function LeagueList() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <LeagueListAuth /> : <LeagueListPublic />;
}

export default LeagueList;
