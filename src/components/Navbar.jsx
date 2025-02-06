import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ✅ Use Auth Context

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth(); // ✅ Use context

  // ✅ Logout Function
  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, { withCredentials: true });
      setIsAuthenticated(false); // ✅ Update state immediately
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <NavLink to='/users'>USERS</NavLink>
          <button onClick={handleLogout}>LOGOUT</button>
        </div>
      ) : (
        <div>
          <NavLink to='/login'>LOGIN</NavLink>
        </div>
      )}
    </div>
  );
}

export default Navbar;
