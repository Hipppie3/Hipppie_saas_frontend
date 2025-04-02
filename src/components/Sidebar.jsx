import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import { FaBars, FaTimes } from 'react-icons/fa';

function Sidebar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);



  // ✅ Toggle Sidebar
  const toggleSidebar = () => setIsOpen(!isOpen);

  // ✅ Logout Function
  const handleLogout = async () => {
    try {
      const response = await logout();
      console.log("Logout Response:", response);

      const { domain, slug } = response || {};

      if (slug) {
        navigate(`/${slug}/login`);
      } else if (domain) {
        navigate(`https://${domain}/login`);
      } else {
        navigate("/login"); // fallback
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };


console.log(user)
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

        {/* Sidebar Content */}
        {isAuthenticated && (
          <>
            {/* Main Links */}
            <ul className="sidebar_list">
              <li><NavLink to="/dashboard" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>Dashboard</NavLink></li>
              <li><NavLink to="/dashboard/gameToggle" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>Schedule</NavLink></li>
              <li><NavLink to="/scheduleBuilder" onClick={toggleSidebar} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>Builder</NavLink></li>
            </ul>

            {/* Settings at bottom */}
            <div className="settings-section">
              <button className="sidebar-button settings-toggle" onClick={() => setShowSettings(prev => !prev)}>
                <span>Settings</span>
                <span className="dropdown-icon">{showSettings ? '▲' : '▼'}</span>
              </button>

              {showSettings && (
                <ul className="sidebar_list sub-settings">
                  <li><NavLink to="/stats" onClick={toggleSidebar}>Stats</NavLink></li>
                  <li><NavLink to="/gamePeriod" onClick={toggleSidebar}>Game Period</NavLink></li>
                  <li><NavLink to="/playerAttributes" onClick={toggleSidebar}>Player</NavLink></li>
                  <li><NavLink to="/userSettings" onClick={toggleSidebar}>User </NavLink></li>
                  {user?.role === 'super_admin' && (
                    <li><NavLink to="/userList" onClick={toggleSidebar}>Users</NavLink></li>
                  )}
                  <li><button className="logout-button" onClick={handleLogout}>Logout</button></li>
                </ul>
              )}
            </div>
          </>
        )}

      </div>
    </>
  );
}

export default Sidebar;
