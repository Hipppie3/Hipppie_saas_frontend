import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { NavLink } from 'react-router-dom'
import './Home.css'

function Home() {
  const [websites, setWebsites] = useState([])

  useEffect(() => {
const fetchWebsites = async () => {
  try {
    const response = await axios.get('/api/users', { withCredentials: false });
    setWebsites(response.data.users);
    console.log('Fetched websites:', response.data.users);
  } catch (error) {
    console.error('Error fetching websites:', error.response?.data || error.message);
  }
};
    fetchWebsites();
  },[])


  return (
    <div className="home_container">
      {websites.map((website) => (
        <div key={website.id}> 
        <NavLink to={`/site?domain=${website.domain}`}>{website.domain}</NavLink>
        </div>
      ))}
    </div>
  )
}

export default Home
