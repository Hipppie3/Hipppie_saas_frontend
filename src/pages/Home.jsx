import React, { useEffect, useState } from "react";
import api from '@api';
import "./Home.css";

function Home() {
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await api.get("/api/users");
        setWebsites(response.data.users);
      } catch (error) {
        console.error("Error fetching websites:", error.response?.data || error.message);
      }
    };

    fetchWebsites();
  }, []);

  const handleRedirect = (domain) => {
    if (domain.includes('.')) {
      // Custom domain like john.com
      window.location.href = `https://${domain}`;
    } else {
      // Subpath on main domain
      window.location.href = `https://sportinghip.com/${domain}`;
    }
  };

  return (
    <div className="home_container">
      {websites.map((website) => (
        <div key={website.id}>
          <button onClick={() => handleRedirect(website.domain)}>
            {website.domain}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Home;
