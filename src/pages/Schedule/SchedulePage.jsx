import { useAuth } from "../../context/AuthContext";
import ScheduleAuth from "./Auth/ScheduleAuth";
import SchedulePublic from "./Public/SchedulePublic";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDomainInfo from "@useDomainInfo";

function SchedulePage() {
 const { isAuthenticated, loading } = useAuth();
 const navigate = useNavigate();
 const { slug, domain } = useDomainInfo();

 useEffect(() => {
  if (loading) return;

  if (!slug && !domain && !isAuthenticated) {
   navigate("/", { replace: true });
  }
 }, [slug, domain, isAuthenticated, loading, navigate]);

 return loading ? <p>Loading...</p> : isAuthenticated ? <ScheduleAuth /> : <SchedulePublic slug={slug} domain={domain} />;
}

export default SchedulePage;
