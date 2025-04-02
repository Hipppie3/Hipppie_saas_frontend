import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import './UserHomepage.css';
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const UserHomepage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain") || window.location.hostname;
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
    const fetchUser = async () => {
      try {
        if (domain) {
          const formattedDomain = domain.includes('.') ? domain : `${domain}.com`;
          const res = await api.get(`/api/users/domain/${formattedDomain}`);
          setUserForDomain(res.data.user);
          console.log("Set userForDomain to:", res.data.user);

        } else if (slug) {
          const res = await api.get(`/api/users/slug/${slug}`);
          setUserForDomain(res.data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err.response?.data || err.message);
        setUserForDomain(null);
      } finally {
        setLoadingDomain(false);
      }
    };
    fetchUser();
  }, [domain, slug]);


  if (authLoading || loadingDomain) return null;
  console.log("Final userForDomain state:", userForDomain);

  return (
    <div className="user_homepage">
      <h1>
        Welcome to {userForDomain?.username || userForDomain?.domain || domain || "our site"}
      </h1>

    </div>
  );
};

export default UserHomepage;
