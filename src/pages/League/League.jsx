import { useAuth } from '../../context/AuthContext'
import LeagueAuth from './Auth/LeagueAuth';
import LeaguePublic from './Public/LeaguePublic';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function League() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [domain, setDomain] = useState(null);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const urlDomain = currentUrl.searchParams.get("domain");
    setDomain(urlDomain);

    // ✅ If no domain, navigate to the previous page or home
    if (!urlDomain && !isAuthenticated) {
      const previousPage = document.referrer || "/"; // Default to home if no referrer
      navigate(previousPage, { replace: true });
    }
  }, [navigate]);

  return isAuthenticated ? <LeagueAuth /> : <LeaguePublic domain={domain} />;
}
export default League
