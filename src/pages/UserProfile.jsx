import React, {useEffect, useState} from 'react'
import api from '@api'; // Instead of ../../../utils/api
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
