import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'


function UserList() {
const { user, deleteUser } = useAuth();
const [users, setUsers] = useState([]);
const [message, setMessage] = useState('');

useEffect(() => {
  const getUser = async () => {
  try {
    const response = await axios.get('/api/users/userList', { withCredentials: true});
    setUsers(response.data.users);

  } catch (error) {
    console.error('Error fetching users')
  }
  };
  getUser()
},[])

console.log(users)
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    const response = await deleteUser(userId);
    if (response.success) {
      setUsers(users.filter(user => user.id !== userId));  // ✅ Remove user from state
      setMessage(`User ${userId} deleted successfully`)
      setTimeout(() => setMessage(''), 3000)
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
      {message && <p>{message}</p>}
    </div>
  );
}

export default UserList
