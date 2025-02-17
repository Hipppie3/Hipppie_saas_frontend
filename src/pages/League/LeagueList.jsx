import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LeagueAuth from './LeagueAuth';
import LeaguePublic from './LeaguePublic';

function LeagueList() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <LeagueAuth /> : <LeaguePublic />;
}

export default LeagueList;
