import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

function Navbar({ userForDomain }) {
  const [isOpen, setIsOpen] = useState(false);

  const theme = userForDomain?.theme || 'light';
  const slug = userForDomain?.slug;
  const hostname = window.location.hostname;
  const mainDomain = "sportinghip.com";
  const isCustomDomain = hostname !== mainDomain && hostname !== "www.sportinghip.com";

  const basePath = isCustomDomain ? "" : `/${slug || ""}`;

  if (!userForDomain) return null;

  const isVisible = Boolean(isCustomDomain || slug);
  if (!isVisible) return null;
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`navbar_container ${theme}-theme`}>
      <button className="navbar_hamburger" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {isVisible && (
        <ul className={`navbar_list ${isOpen ? 'open' : ''}`}>
          <li>
            <NavLink
              to={`${basePath}`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              HOME
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${basePath}/teamList`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              STANDINGS
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${basePath}/playerList`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              PLAYERS
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${basePath}/schedule`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              SCHEDULE
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`${basePath}/login`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              LOGIN
            </NavLink>
          </li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
