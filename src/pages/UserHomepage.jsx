import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const UserHomepage = () => {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain"); // ✅ Get domain from URL
  const [user, setUser] = useState(null);


  useEffect(() => {
    const fetchDomain = async () => {
      if (!domain) return;
      console.log("Fetching domain:", `/api/users/domain/${domain}`);  // ✅ Debug log
      try {
        const response = await axios.get(`/api/users/domain/${domain}`);
        console.log("Domain response:", response.data);
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching domain:", error.response?.data || error.message);
      }
    };
    fetchDomain();
  }, [domain]);

  return (
    <div>
      <h1>Welcome to {user ? user.username : domain}</h1>
    </div>
  );
};

export default UserHomepage;
