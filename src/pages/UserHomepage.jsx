import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import './UserHomepage.css';
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import fab from '../Video/fab.mp4'

const UserHomepage = () => {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  const [userForDomain, setUserForDomain] = useState(null);
  const [loadingDomain, setLoadingDomain] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 👇 Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchDomain = async () => {
      if (!domain) return;
      try {
        const response = await api.get(`/api/users/domain/${domain}`);
        setUserForDomain(response.data.user);
      } catch (error) {
        console.error("Error fetching domain:", error.response?.data || error.message);
        setUserForDomain(null);
      } finally {
        setLoadingDomain(false);
      }
    };
    fetchDomain();
  }, [domain]);

  if (authLoading || loadingDomain) return null;

  return (
    <div className="user_homepage">
      {/* Hero Video Section */}
      <section className="homepage-hero-video">
        <video autoPlay muted loop playsInline className="homepage-video">
          <source src={fab} />
        </video>
        <div className="hero-overlay">
          <h1>
            FAB
          </h1>
        </div>
      </section>
      <section className="second-section">
        
      </section>

      {/* Other homepage sections go here */}
    </div>

  );
};

export default UserHomepage;
