import React, { useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

function Navbar({ userForDomain }) {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain") || window.location.hostname;
  const [isOpen, setIsOpen] = useState(false);

  const theme = userForDomain?.theme || 'light';
  const slug = userForDomain?.slug;
  const hasDomain = Boolean(domain);
  const hasSlug = Boolean(slug);
  const isVisible = hasDomain || hasSlug;

  const basePath = hasDomain ? `?domain=${domain}` : '';
  const prefix = hasDomain ? '' : `/${slug || ''}`;

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
              to={hasDomain ? `/site${basePath}` : `${prefix}`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              HOME
            </NavLink>
          </li>
          <li>
            <NavLink
              to={hasDomain ? `/teamList${basePath}` : `${prefix}/teamList`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              STANDINGS
            </NavLink>
          </li>
          <li>
            <NavLink
              to={hasDomain ? `/playerList${basePath}` : `${prefix}/playerList`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              PLAYERS
            </NavLink>
          </li>
          <li>
            <NavLink
              to={hasDomain ? `/schedule${basePath}` : `${prefix}/schedule`}
              className={({ isActive }) => isActive ? "active-class" : "inactive-class"}
              onClick={closeMenu}
            >
              SCHEDULE
            </NavLink>
          </li>
          <li>
            <NavLink
              to={hasDomain ? `/login${basePath}` : `${prefix}/login`}
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
