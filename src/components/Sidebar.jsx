import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import { FaBars, FaTimes } from 'react-icons/fa';

function Sidebar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);


  // ✅ Toggle Sidebar
  const toggleSidebar = () => setIsOpen(!isOpen);

  // ✅ Logout Function
  const handleLogout = async () => {
    try {
      
      const response = await logout();
      console.log("Logout Response:", response); // Debugging Step

      // ✅ Directly access domain from response
      const domain = response?.domain;

      if (!domain) {
        console.warn("Domain not found in logout response");
        navigate("/"); // Default fallback
        return;
      }

      navigate(`/login?domain=${domain}`);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };


  if (loading) return <div>Loading...</div>;

  return (
    <>
      {/* ✅ Hamburger Menu for Mobile */}
      <button className="hamburger" onClick={toggleSidebar}>
        <FaBars />
      </button>

      {/* ✅ Sidebar (Hidden by default, slides in when toggled) */}
      <div className={`sidebar_container ${isOpen ? 'open' : ''}`}>
        {/* ✅ Close Button */}
        <button className="close_sidebar" onClick={toggleSidebar}>
          <FaTimes />
        </button>

        {isAuthenticated && (
          <ul className="sidebar_list">
            <li><NavLink to="/dashboard" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>Dashboard</NavLink></li>
            <li><NavLink to="/leagueList" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>Leagues</NavLink></li>
            <li><NavLink to="/teamList" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>Teams</NavLink></li>
            <li><NavLink to="/playerList" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>Players</NavLink></li>
            <li><NavLink to="/stats" onClick={toggleSidebar} className={({ isActive }) => isActive ? " active-class" : "inactive-class"}>Stats</NavLink></li>
            {user?.role === 'super_admin' && (
              <li><NavLink to="/userList" onClick={toggleSidebar}>Users</NavLink></li>
            )}
            <li><button className="sidebar-button" onClick={handleLogout}>Logout</button></li>
          </ul>
        )}
      </div>
    </>
  );
}

export default Sidebar;
