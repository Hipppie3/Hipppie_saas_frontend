import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Homepage = () => {
  // Get query parameters from URL
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const domain = queryParams.get('domain');

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Ensure the domain is properly encoded
        const encodedDomain = encodeURIComponent(domain);
        console.log("Fetching data for domain:", encodedDomain);
        const response = await axios.get(`/api/users/${encodedDomain}`);
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (domain) {
      fetchUserData();
    }
  }, [domain]);

  return (
    <div>
      {userData ? (
        <div>
          <h1>{userData.user}</h1>
          <p>{userData.email}</p>
          <p>{userData.domain}</p>
        </div>
      ) : (
        <p>Welcome</p>
      )}
    </div>
  );
};

export default Homepage;
