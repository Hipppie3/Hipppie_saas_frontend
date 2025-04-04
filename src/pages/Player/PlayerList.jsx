import { useAuth } from "../../context/AuthContext";
import PlayerListAuth from "./Auth/PlayerListAuth";
import PlayerListPublic from "./Public/PlayerListPublic";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDomainInfo from '@useDomainInfo';
function PlayerList() {
 const { isAuthenticated, loading } = useAuth();
 const navigate = useNavigate();
  const { slug, domain } = useDomainInfo();

 useEffect(() => {
  if (loading) return;

  if (!slug && !domain && !isAuthenticated) {
   navigate("/", { replace: true });
  }
 }, [slug, domain, isAuthenticated, loading, navigate]);

 return loading ? <p>Loading...</p> : isAuthenticated ? <PlayerListAuth /> : <PlayerListPublic slug={slug} domain={domain} />;
}

export default PlayerList;
