import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import './UserHomePage.css';

const UserHomepage = () => {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain"); // ✅ Get domain from URL
  const [user, setUser, isAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    const fetchDomain = async () => {
      if (!domain) return;

      console.log("Fetching domain:", `/api/users/domain/${domain}`);
      try {
        const response = await axios.get(`/api/users/domain/${domain}`);
        console.log("Domain response:", response.data);
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching domain:", error.response?.data || error.message);
        setUser(null); // ✅ Set user to null on error
      } finally {
        setLoading(false); // ✅ Stop loading when request finishes
      }
    };

    fetchDomain();
  }, [domain]); // ✅ Fetch again when domain changes

  console.log(isAuthenticated)
  return (
    <div className="user_homepage">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <h1>Welcome to {user ? user.username : domain}</h1>
      )}
    </div>
  );
};

export default UserHomepage;
