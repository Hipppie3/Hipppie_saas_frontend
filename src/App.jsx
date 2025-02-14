import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import UserList from './pages/UserList.jsx';
import User from './pages/User.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LeagueList from './pages/LeagueList.jsx';
import League from './pages/League.jsx';
import TeamList from './pages/TeamList.jsx';
import Team from './pages/Team.jsx'
import Homepage from './pages/Homepage.jsx';
import PlayerList from './pages/PlayerList.jsx';
import Home from './pages/Home.jsx';
import './App.css';

function App() {


  return (
    <div className="app_container">
      <Navbar />
      <div>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/playerList' element={<PlayerList />} />
          <Route path='/user' element={<Homepage />} />
          <Route path='/login' element={<Login />} /> {/* ✅ Login page without Navbar */}
          <Route path='/userList' element={<UserList />} />
          <Route path='/user/:id' element={<User />} />
          <Route path='/leagueList' element={<LeagueList />} />
          <Route path='/league/:id' element={<League />} />
          <Route path='/teamList' element={<TeamList />} />
          <Route path='/teams/:id' element={<Team />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
