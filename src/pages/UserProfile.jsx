import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function UserProfile() {
 const {user} = useAuth();
 console.log(user)
 
  return (
    <div>
      
    </div>
  )
}

export default UserProfile
