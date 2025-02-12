import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // Import the CSS file

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading, user } = useAuth();

  // ✅ Logout Function
  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

const handleHomeClick = () => {
  if (user) {
    // Redirect to homepage with domain as query parameter
    navigate(`/user?domain=${encodeURIComponent(user.domain)}`);
  } 
};


  if (loading) {
    return <div>Loading...</div>;
  }
  console.log(user);

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <button className="nav-button" onClick={handleHomeClick}>HOME</button>
          <NavLink to="/dashboard">DASHBOARD</NavLink>
          <NavLink to="/leagueList">LEAGUES</NavLink>
          <NavLink to="/teamList">TEAMS</NavLink>
          {user?.role === 'super_admin' && <NavLink to="/userList">USERS</NavLink>}
          <button className="nav-button" onClick={handleLogout}>LOGOUT</button>
        </div>
      ) : (
        <div>
          <NavLink to="/login">LOGIN</NavLink>
        </div>
      )}
    </div>
  );
}

export default Navbar;
