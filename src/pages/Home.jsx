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
          const city = biz.city ;

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

  const groupBySport = () => {
    const grouped = {};
    businesses
      .filter((b) => !selectedState || b.state?.includes(selectedState))
      .forEach((biz) => {
        const sport = biz.sport?.toLowerCase() || "other";
        if (!grouped[sport]) grouped[sport] = [];
        grouped[sport].push(biz);
      });
    return grouped;
  };

  const groupedBusinesses = groupBySport();

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

        <div className="website_card_group_container">
          {Object.entries(groupedBusinesses).map(([sport, list]) => (
            <div key={sport} className="website_card_group">
              <h5>{sport.charAt(0).toUpperCase() + sport.slice(1)} Leagues</h5>
              <div className="website_card_list">
                {list.map((biz) => (
                  <div key={biz.id} className="website_card_item">
                    {biz.website && (
                      <a
                        href={biz.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="website_link"
                      >
                        {biz.name}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Home;
