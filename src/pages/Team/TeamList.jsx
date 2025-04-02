import { useAuth } from "../../context/AuthContext";
import TeamListAuth from "./Auth/TeamListAuth";
import TeamListPublic from "./Public/TeamListPublic";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TeamList() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const hostname = window.location.hostname.replace(/^www\./, '');
  const mainDomain = "sportinghip.com";
  const isLocalhost = hostname === "localhost";
  const isCustomDomain = !isLocalhost && hostname !== mainDomain;

  const slug = !isCustomDomain ? window.location.pathname.split("/")[1] : null;
  const domain = isCustomDomain ? hostname : null;


  useEffect(() => {
    if (loading) return;

    // ❌ Don't redirect anymore unless both are null
    if (!slug && !domain && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [slug, domain, isAuthenticated, loading, navigate]);

  return loading ? <p>Loading...</p> : isAuthenticated ? <TeamListAuth /> : <TeamListPublic slug={slug} domain={domain} />;
}


export default TeamList;
