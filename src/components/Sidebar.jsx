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
      console.log("Logout Response:", response);

      if (response?.domain) {
        console.log(`Navigating to: /login?domain=${response.domain}`);

        setTimeout(() => {
          navigate(`/login?domain=${response.domain}`, { replace: true });

          // ✅ Clear the entire session history so "Back" doesn't work
          window.history.pushState(null, null, `/login?domain=${response.domain}`);
          window.history.pushState(null, null, `/login?domain=${response.domain}`);
          window.addEventListener("popstate", () => {
            navigate(`/login?domain=${response.domain}`, { replace: true });
          });
        }, 100);
      } else {
        console.warn("No domain found in logout response, redirecting to home");
        navigate("/", { replace: true });

        // ✅ Prevent back navigation after logout
        window.history.pushState(null, null, "/");
        window.history.pushState(null, null, "/");
        window.addEventListener("popstate", () => {
          navigate("/", { replace: true });
        });
      }
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
