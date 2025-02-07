import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'


function Users() {
const { user, deleteUser } = useAuth();
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

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    const response = await deleteUser(userId);
    if (response.success) {
      setUsers(users.filter(user => user.id !== userId));  // ✅ Remove user from state
    } else {
      alert(response.message);
    }
  };




  return (
    <div>
      <h2>All Users</h2>
      {users.length === 0 ? <p>No users found.</p> : (
        <ul>
          {users.map((userItem) => (
            <li key={userItem.id}>
              {userItem.username} ({userItem.role})
              {user?.role === "super_admin" && (  // ✅ Only super_admin can see delete button
                <button onClick={() => handleDelete(userItem.id)}>Delete</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users
