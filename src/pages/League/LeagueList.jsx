import { useAuth } from "../../context/AuthContext";
import LeagueListAuth from "./Auth/LeagueListAuth";
import LeagueListPublic from "./Public/LeagueListPublic";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LeagueList() {
  const { isAuthenticated, loading } = useAuth(); // ✅ Get loading state
  const navigate = useNavigate();
  const [domain, setDomain] = useState(null);

  useEffect(() => {
    if (loading) return; // ✅ Wait for authentication check to complete

    const currentUrl = new URL(window.location.href);
    const urlDomain = currentUrl.searchParams.get("domain");
    setDomain(urlDomain);

    // ✅ Redirect ONLY if authentication is confirmed as false
    if (!urlDomain && !isAuthenticated) {
      const previousPage = document.referrer || "/"; // Default to home if no referrer
      navigate(previousPage, { replace: true });
    }
  }, [isAuthenticated, loading, navigate]); // ✅ Now waits for `loading`

  return loading ? <p>Loading...</p> : isAuthenticated ? <LeagueListAuth /> : <LeagueListPublic domain={domain} />;
}

export default LeagueList;
