import React, { useEffect, useState } from "react";
import api from "@api";
import "./Home.css";

function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [states, setStates] = useState({});

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await api.get("/api/businesses");
        const data = res.data || [];

        // Build state -> city map
        const stateMap = {};
        data.forEach((biz) => {
          const stateList = biz.state?.split(",").map((s) => s.trim()) || [];
          const city = biz.city || "Unknown";

          stateList.forEach((state) => {
            if (!stateMap[state]) stateMap[state] = new Set();
            stateMap[state].add(city);
          });
        });

        const formattedStates = {};
        Object.keys(stateMap).forEach((state) => {
          formattedStates[state] = [...stateMap[state]];
        });

        setBusinesses(data);
        setStates(formattedStates);
      } catch (err) {
        console.error("Error fetching businesses:", err);
      }
    };

    fetchBusinesses();
  }, []);

  const getFilteredBusinesses = () => {
    if (!selectedState) return businesses;
    return businesses.filter((b) => b.state?.includes(selectedState));
  };

  return (
    <div className="home_container">
      <div className="home_filters">
        {Object.keys(states).map((state) => (
          <div key={state} className="state-container">
            <button
              className={`state-button ${selectedState === state ? "active" : ""}`}
              onClick={() =>
                setSelectedState(selectedState === state ? null : state)
              }
            >
              {state}
            </button>

            {selectedState === state && (
              <div className="city-dropdown">
                {states[state].map((city) => (
                  <button key={city} className="city-button">
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="home_sections">
        <section className="selected_city_section">
          <p>{selectedState ? selectedState : "Welcome to SportingHip"}</p>
        </section>

        <div className="website_list_container">
          
          {getFilteredBusinesses().map((biz) => (
            <section key={biz.id} className="website_card">
              <h5>Basketball Leagues</h5>
              <div className="website_name">
              {biz.website && (
                <a
                  href={biz.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {biz.name}
                </a>
              )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
