import React, { useEffect, useState } from "react";
import api from '@api'; // Instead of ../../../utils/api
import { NavLink } from "react-router-dom";
import "./Home.css";

function Home() {
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        console.log("Fetching from:", api.defaults.baseURL); // ✅ Debugging
        const response = await api.get("/api/users");
        setWebsites(response.data.users);
        console.log("Fetched websites:", response.data.users);
      } catch (error) {
        console.error(
          "Error fetching websites:",
          error.response?.data || error.message
        );
      }
    };

    fetchWebsites();
  }, []);

  console.log("VITE_API_URL from env:", import.meta.env.VITE_API_URL);
  console.log("API Base URL from axios:", api.defaults.baseURL);

  return (
    <div className="home_container">
      {websites.map((website) => (
        <div key={website.id}>
          <a
            href={
              website.domain === "sportinghip.com"
                ? `/site?domain=${website.domain}` // local preview
                : `https://${website.domain}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {website.domain}
          </a>

        </div>
      ))}
    </div>
  );
}

export default Home;
