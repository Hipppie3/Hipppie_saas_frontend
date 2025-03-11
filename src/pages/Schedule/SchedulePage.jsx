import { useAuth } from "../../context/AuthContext";
import ScheduleAuth from "./Auth/ScheduleAuth";
import SchedulePublic from "./Public/SchedulePublic";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SchedulePage() {
 const { isAuthenticated, loading } = useAuth();
 const navigate = useNavigate();
 const [domain, setDomain] = useState(null);

 useEffect(() => {
  if (loading) return;

  const currentUrl = new URL(window.location.href);
  const urlDomain = currentUrl.searchParams.get("domain");
  setDomain(urlDomain);

  // ✅ If no domain, navigate to the previous page or home
  if (!urlDomain && !isAuthenticated) {
   const previousPage = document.referrer || "/"; // Default to home if no referrer
   navigate(previousPage, { replace: true });
  }
 }, [isAuthenticated, loading, navigate]);

 return loading ? <p>Loading...</p> : isAuthenticated ? <ScheduleAuth /> : <SchedulePublic domain={domain} />;
}

export default SchedulePage;
