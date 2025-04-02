import { useAuth } from "../../context/AuthContext";
import TeamListAuth from "./Auth/TeamListAuth";
import TeamListPublic from "./Public/TeamListPublic";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDomainInfo from "@useDomainInfo"; // alias you set in Vite

function TeamList() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { slug, domain } = useDomainInfo();

  useEffect(() => {
    if (loading) return;

    if (!slug && !domain && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [slug, domain, isAuthenticated, loading, navigate]);

  return loading ? <p>Loading...</p> : isAuthenticated ? <TeamListAuth /> : <TeamListPublic slug={slug} domain={domain} />;
}

export default TeamList;
