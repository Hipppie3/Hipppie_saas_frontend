import React from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx'; 

import StatAuth from './pages/Stat/StatAuth.jsx'
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import UserHomepage from './pages/UserHomepage.jsx';
import Dashboard from './pages/Dashboard.jsx';

import UserList from './pages/UserList.jsx';
import User from './pages/User.jsx';
import LeagueList from './pages/League/LeagueList.jsx';
import League from './pages/League/League.jsx';
import TeamList from './pages/Team/TeamList.jsx';
import Team from './pages/Team/Team.jsx';
import PlayerList from './pages/Player/PlayerList.jsx';
import Player from './pages/Player/Player.jsx';
import GamePage from './pages/Game/GamePage.jsx';
import SchedulePage from './pages/Schedule/SchedulePage.jsx';
import GamePeriod from './pages/GamePeriod/GamePeriod.jsx'





function App() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");  
  const isPublicView = domain || window.location.pathname === "/"; // ✅ Also use UserNavbar for Home
  const isLoginPage = location.pathname === "/login"
  
  return (
    <div className="app_container">
  {isPublicView || isLoginPage ?  <Navbar /> : <Sidebar />}
      <div className={isPublicView ? "content_wrapper_public" : "content_wrapper"}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/site' element={<UserHomepage />} />
          <Route path='/dashboard' element={<Dashboard />} />

          <Route path='/userList' element={<UserList />} />
          <Route path='/user/:id' element={<User />} />
          <Route path='/leagueList' element={<LeagueList />} />
          <Route path='/leagues/:id' element={<League />} />
          <Route path='/teamList' element={<TeamList />} />
          <Route path='/teams/:id' element={<Team />} />
          <Route path='/playerList' element={<PlayerList />} />
          <Route path='/players/:id' element={<Player />} />
          <Route path='/schedule' element={<SchedulePage />} />
          <Route path='/games/:id' element={<GamePage />} />
          <Route path='/stats' element={<StatAuth />} />
          <Route path='/gamePeriod' element={<GamePeriod />} />
        </Routes>
    </div>
    </div>
  );
}

export default App;
