import { useAuth } from "../../context/AuthContext";
import GameAuth from "./Auth/GameAuth";
import GamePublic from "./Public/GamePublic";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDomainInfo from '@useDomainInfo';

function GamePage() {
 const { isAuthenticated, loading } = useAuth();
 const navigate = useNavigate();
  const { slug, domain } = useDomainInfo();

 useEffect(() => {
  if (loading) return;

  if (!slug && !domain && !isAuthenticated) {
   navigate("/", { replace: true });
  }
 }, [slug, domain, isAuthenticated, loading, navigate]);

 return loading ? <p>Loading...</p> : isAuthenticated ? <GameAuth /> : <GamePublic domain={domain} slug={slug}/>;
}

export default GamePage;
