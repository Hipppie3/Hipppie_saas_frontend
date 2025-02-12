import React, { useState, useEffect }from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function User() {
 const {id} = useParams();
 const [user, setUser] = useState([]);

 console.log(id)
  return (
    <div>
      
    </div>
  )
}

export default User
