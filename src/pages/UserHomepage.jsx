import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './UserHomepage.css';
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const UserHomepage = () => {
  const { domain } = useParams();
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
      <h1>Welcome to {userForDomain ? userForDomain.username : domain}</h1>
    </div>
  );
};

export default UserHomepage;
