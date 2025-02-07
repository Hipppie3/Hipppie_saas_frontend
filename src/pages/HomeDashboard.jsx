import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function HomeDashboard() {
 const { user } = useAuth();
 const navigate = useNavigate();


  return (
    <div>
      <h2>WELCOME {user.username}!</h2>
    </div>
  )
}

export default HomeDashboard
