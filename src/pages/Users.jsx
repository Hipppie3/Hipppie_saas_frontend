import React, {useState, useEffect} from 'react'
import axios from 'axios'


function Users() {
const [users, setUsers] = useState([]);

useEffect(() => {
  const getUser = async () => {
  try {
    const response = await axios.get('/api/users');
    setUsers(response.data.users);

  } catch (error) {
    console.error('Error fetching users')
  }
  };
  getUser()
},[])




  return (
    <div>
        {users.map((user) => (
          <div key={user.id}>
            <h2>{user.username}</h2>
            <h3>{user.email}</h3>
          </div>
        ))}
    </div>
  )
}

export default Users
