import { useAuth } from '../../context/AuthContext';
import TeamAuth from './Auth/TeamAuth';
import TeamPublic from './Public/TeamPublic';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDomainInfo from '@useDomainInfo';

function Team() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { domain, slug } = useDomainInfo();

  useEffect(() => {
    if (loading) return;

    if (!slug && !domain && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate, domain, slug]);

  return loading ? <p>Loading...</p> : isAuthenticated ? <TeamAuth /> : <TeamPublic />;
}

export default Team;
