import React, { useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons
import './Navbar.css';

function Navbar() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  const [isOpen, setIsOpen] = useState(false);

  // Toggle Sidebar
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Close menu when a link is clicked
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar_container">
      {/* Hamburger Menu Button */}
      <button className="hamburger" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      {domain ? (
      <ul className={`navbar_list ${isOpen ? 'open' : ''}`}>
        <li><NavLink to={`/site?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>HOME</NavLink></li>
        <li><NavLink to={`/leagueList?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>LEAGUES</NavLink></li>
        <li><NavLink to={`/teamList?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>TEAMS</NavLink></li>
        <li><NavLink to="/playerList" className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>PLAYERS</NavLink></li>
      </ul>
      ) : (
        <ul className={`navbar_list ${isOpen ? 'open' : ''}`}>
          <li><NavLink to='/' className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>HOME</NavLink></li>
          <li><NavLink to='/login' className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>LOGIN</NavLink></li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
