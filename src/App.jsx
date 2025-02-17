import React from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';  // ✅ Default navbar
import UserNavbar from './components/UserNavbar.jsx';  // ✅ League-specific navbar
import Login from './pages/Login.jsx';
import UserList from './pages/UserList.jsx';
import User from './pages/User.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LeagueList from './pages/LeagueList.jsx';
import League from './pages/League.jsx';
import TeamList from './pages/TeamList.jsx';
import Team from './pages/Team.jsx';
import UserHomepage from './pages/UserHomepage.jsx';
import PlayerList from './pages/PlayerList.jsx';
import Home from './pages/Home.jsx';
import './App.css';


function App() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");  
  return (
    <div className="app_container">
  {domain ? <UserNavbar /> : <Navbar />}
      <div>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/site' element={<UserHomepage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/userList' element={<UserList />} />
          <Route path='/user/:id' element={<User />} />
          <Route path='/leagueList' element={<LeagueList />} />
          <Route path='/site/leagueList' element={<LeagueList />} />
          <Route path='/league/:id' element={<League />} />
          <Route path='/site/league/:id' element={<League />} />
          <Route path='/teamList' element={<TeamList />} />
          <Route path='/site/teamList' element={<TeamList />} />
          <Route path='/teams/:id' element={<Team />} />
          <Route path='/site/team/:id' element={<Team />} />
          <Route path='/playerList' element={<PlayerList />} />
        </Routes>
    </div>
    </div>
  );
}

export default App;
