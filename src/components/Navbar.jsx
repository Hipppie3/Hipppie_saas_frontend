import React, { useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons
import './Navbar.css';

function Navbar({ userForDomain } ) {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Toggle Sidebar
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Close menu when a link is clicked
  const closeMenu = () => setIsOpen(false);

  const showDropdown = () => setIsDropdownOpen(true)
  const hideDropdown = () => setIsDropdownOpen(false)
  
  return (
    <nav className={`navbar_container ${userForDomain?.theme}-theme`}>
      {/* Hamburger Menu Button */}
      <button className="navbar_hamburger" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      {domain && 
      <ul className={`navbar_list ${isOpen ? 'open' : ''}`}>
        <div className="navbar_links_group">
        <li><NavLink to={`/site?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>HOME</NavLink></li>
        {/* <li><NavLink to={`/leagueList?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>LEAGUES</NavLink></li> */}
        <li><NavLink to={`/teamList?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>STANDINGS</NavLink></li>
        <li><NavLink to={`/playerList?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>PLAYERS</NavLink></li>
        <li><NavLink to={`/schedule?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>SCHEDULE</NavLink></li>
          </div>
        <div className="navbar_login_link">
        <li><NavLink to={`/login?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"} onClick={closeMenu}>LOGIN</NavLink></li>
        </div>
      </ul>
}
    </nav>
  );
}

export default Navbar;
