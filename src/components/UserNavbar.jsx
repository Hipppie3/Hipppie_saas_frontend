import React from 'react'
import {NavLink, useSearchParams} from 'react-router-dom'

function UserNavbar() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain")
  console.log(domain)
  return (
 <nav>
  <ul>
   <li><NavLink to={`/site/leagueList?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>LEAGUES</NavLink></li>
  <li><NavLink to={`/site/teamList?domain=${domain}`} className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>TEAMS</NavLink></li>
  <li><NavLink to="/playerList" className={({ isActive }) => isActive ? "active-class" : "inactive-class"}>PLAYERS</NavLink></li>
  </ul>
 </nav>
  )
}

export default UserNavbar
