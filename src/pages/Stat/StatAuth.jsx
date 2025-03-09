import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './StatAuth.css';
import { useAuth } from '../../context/AuthContext';

function Stats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();


  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`/api/stats/user/${user.id}`);
        setStats(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
      setLoading(false);
    };

    fetchUserStats();
  }, [user]);

  

  if (!user) return <p>Loading user...</p>
  if (loading) return <p>Loading stats...</p>;
  if (!stats.length) return <p>No stats available for your sport.</p>;


  return (
    <div className="statAuth-container">
      <h2 className="stats-title">Stats for Your Sport</h2>
      <div className="stats-list">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-item">
            <h3>{stat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stats;
