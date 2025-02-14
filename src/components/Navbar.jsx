import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // Import the CSS file

function Navbar() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading, user } = useAuth();

  // ✅ Logout Function
  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  console.log(user);

  return (
    <div className="navbar_container"> 

      {isAuthenticated ? (

        <ul className="nav_list">
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>DASHBOARD</NavLink></li>
          <li><NavLink to="/leagueList" className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>LEAGUES</NavLink></li>
          <li><NavLink to="/teamList" className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>TEAMS</NavLink></li>
          <li><NavLink to="/playerList" className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>PLAYERS</NavLink></li>
          {user?.role === 'super_admin' && (
          <li><NavLink to="/userList">USERS</NavLink></li>
          )}
          <li><button className="nav-button" onClick={handleLogout}>LOGOUT</button></li>
        </ul>
        ) : (
        <ul className="nav_list">
          <li><NavLink to='/' className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>HOME</NavLink></li>
          <li><NavLink to="/login" className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>LOGIN</NavLink></li>
        </ul>
      )}

    </div>
  );
}

export default Navbar;
