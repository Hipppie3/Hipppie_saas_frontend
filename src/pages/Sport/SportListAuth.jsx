import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { NavLink, useParams } from 'react-router-dom';

function SportListAuth() {
const [sports, setSports] = useState([]);


useEffect(() => {
  const fetchSport = async () => {
  try {
    const response = await axios.get('/api/sports')
    setSports(response.data)
    console.log(response.data)
  } catch (error) {
    console.error("Error fetching sport:", error)
  }
  };
  fetchSport()
},[]);


  return (
    <div>
      {sports.length > 0 ? (
      sports.map((sport) => (
        <div key={sport.id}>
          <h3><NavLink to={`/sports/${sport.id}`}>{sport.name}</NavLink></h3>
        </div>
      ))
      ) : (
        <p>No sports available</p>
      )}
    </div>
  )
}

export default SportListAuth
