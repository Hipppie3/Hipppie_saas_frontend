import React from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';  // ✅ Default navbar
import Navbar from './components/Navbar.jsx';  // ✅ League-specific navbar
import Login from './pages/Login.jsx';
import UserList from './pages/UserList.jsx';
import User from './pages/User.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LeagueList from './pages/League/LeagueList.jsx';
import League from './pages/League/League.jsx';
import TeamList from './pages/Team/TeamList.jsx';
import Team from './pages/Team/Team.jsx';
import UserHomepage from './pages/UserHomepage.jsx';
import PlayerList from './pages/Player/PlayerList.jsx';
import Home from './pages/Home.jsx';
import './App.css';


function App() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");  
  const isPublicView = domain || window.location.pathname === "/"; // ✅ Also use UserNavbar for Home
  const isLoginPage = location.pathname === "/login"
  return (
    <div className="app_container">
  {isPublicView || isLoginPage ? <Navbar /> : <Sidebar />}
      <div className="content_wrapper">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/site' element={<UserHomepage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/userList' element={<UserList />} />
          <Route path='/user/:id' element={<User />} />
          <Route path='/leagueList' element={<LeagueList />} />
          <Route path='/league/:id' element={<League />} />
          <Route path='/teamList' element={<TeamList />} />
          <Route path='/teams/:id' element={<Team />} />
          <Route path='/playerList' element={<PlayerList />} />
        </Routes>
    </div>
    </div>
  );
}

export default App;
