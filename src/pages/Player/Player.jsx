import { useAuth } from '../../context/AuthContext'
import PlayerAuth from './Auth/PlayerAuth';
import PlayerPublic from './Public/PlayerPublic';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDomainInfo from '@useDomainInfo';

function Player() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { domain, slug } = useDomainInfo();

  useEffect(() => {
    if (loading) return;

    if (!slug && !domain && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate, domain, slug]);

  return loading ? <p>Loading...</p> : isAuthenticated ? <PlayerAuth /> : <PlayerPublic domain={domain} />;
}
export default Player
