import { useAuth } from '../../context/AuthContext'
import PlayerAuth from './Auth/PlayerAuth';
import PlayerPublic from './Public/PlayerPublic';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function Player() {
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

  return isAuthenticated ? <PlayerAuth /> : <PlayerPublic domain={domain} />;
}
export default Player
