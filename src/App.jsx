// App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import './App.css';
import NProgress from 'nprogress';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';

import StatAuth from './pages/Stat/StatAuth.jsx';
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
import GamePeriod from './pages/GamePeriod/GamePeriod.jsx';
import UserSettings from './pages/UserSettingsPage.jsx';
import PlayerAttributes from './pages/PlayerAttribute/PlayerAttributes.jsx';
import SchedulePage from './pages/Schedule/SchedulePage.jsx';
import SeasonList from './pages/AllSeason/SeasonList.jsx';
import SeasonLeagues from './pages/AllSeason/Leagues/SeasonLeagues.jsx';
import AllLeagues from './pages/AllLeagues/AllLeagues.jsx';
import AllTeams from './pages/AllTeams/AllTeams.jsx';
import AllPlayers from './pages/AllPlayers/AllPlayers.jsx';
import AllGames from './pages/AllGames/AllGames.jsx';
import SingleLeague from './pages/AllLeagues/SingleLeague.jsx';
import Season from './pages/Season/Auth/Season.jsx';
import SingleTeam from './pages/AllTeams/SingleTeam.jsx';
import SeasonToggle from './pages/SeasonToggle/SeasonToggle.jsx';
import LeagueToggle from './pages/LeagueToggle/LeagueToggle.jsx';
import TeamToggle from './pages/TeamToggle/TeamToggle.jsx';
import PlayerToggle from './pages/PlayerToggle/PlayerToggle.jsx';
import GameToggle from './pages/GameToggle/GameToggle.jsx';
import SingleLeagueToggle from './pages/SingleLeagueToggle/SingleLeagueToggle.jsx';
import SingleTeamToggle from './pages/SingleTeamToggle/SingleTeamToggle.jsx';
import SingleSeasonToggle from './pages/SingleSeasonToggle/SingleSeasonToggle';
import { useAuth } from './context/AuthContext';
import api from '@api';
import ScheduleBuilder from './pages/ScheduleBuilder/ScheduleBuilder';

function App() {
  const { slug } = useParams(); // <-- Needed for slug route
  const domainFromHost = window.location.hostname;
  const [userForDomain, setUserForDomain] = useState(null);
  const [loadingDomain, setLoadingDomain] = useState(true);
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  const isSlugRoute = /^\/[a-zA-Z0-9-_]+$/.test(location.pathname);
  const isLocalhost = domainFromHost === "localhost";
  const isSaaSRootDomain = ["sportinghip.com", "www.sportinghip.com"].includes(domainFromHost);
  const isCustomDomain = !isLocalhost && !isSaaSRootDomain;
  const isPublicView = (isCustomDomain || isSlugRoute || location.pathname === "/") && !isAuthenticated;
  const isLoginPage = location.pathname === "/login";



  useEffect(() => {
    const fetchUser = async () => {
      try {

        if (isCustomDomain) {
          const domain = domainFromHost.replace(/^www\./, '');
          const res = await api.get(`/api/users/domain/${domain}`);
          setUserForDomain(res.data.user);
        } else {
          const slugFromPath = location.pathname.split("/")[1];
          if (slugFromPath) {
            const res = await api.get(`/api/users/slug/${slugFromPath}`);
            setUserForDomain(res.data.user);
          } else {
            setUserForDomain(null);
          }
        }
      } catch (err) {
        console.error("Error fetching domain/slug user:", err.response?.data || err.message);
        setUserForDomain(null);
      } finally {
        setLoadingDomain(false);
      }
    };

    fetchUser();
  }, [ domainFromHost, location.pathname]);

  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, [location]);

  if (loading || loadingDomain) {
    return <p></p>;
  }

  return (
    <div className="app_container">
      {isPublicView || isLoginPage ? <Navbar userForDomain={userForDomain} /> : <Sidebar />}
      <div className={isPublicView ? `content_wrapper_public ${userForDomain?.theme || 'light'}-theme` : "content_wrapper"}>
        <Routes>
          <Route path='/' element={isCustomDomain ? <UserHomepage /> : <Home />} />
          <Route path='/login' element={isCustomDomain ? <Login /> : <Login />} /> 
          <Route path='/:slug/login' element={<Login />} />
          <Route path='/site' element={<UserHomepage />} />
          <Route path='/:slug' element={<UserHomepage />} />

          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/userList' element={<UserList />} />
          <Route path='/user/:id' element={<User />} />

          <Route path='/leagueList' element={<LeagueList />} />
          <Route path='/leagues/:id' element={<League />} />
          <Route path='/teamList' element={<TeamList />} />
          <Route path='/:slug/teamList' element={<TeamList />} />
          <Route path='/teams/:id' element={<Team />} />
          <Route path='/playerList' element={<PlayerList />} />
          <Route path='/players/:id' element={<Player />} />
          <Route path='/schedule' element={<SchedulePage />} />
          <Route path='/games/:id' element={<GamePage />} />
          <Route path='/stats' element={<StatAuth />} />
          <Route path='/gamePeriod' element={<GamePeriod />} />
          <Route path='/userSettings' element={<UserSettings />} />
          <Route path='/playerAttributes' element={<PlayerAttributes />} />
          <Route path='/seasonList' element={<SeasonList />} />
          <Route path='/seasonLeagues/:seasonId' element={<SeasonLeagues />} />
          <Route path='/season/:seasonId' element={<Season />} />
          <Route path='/dashboard/leagues' element={<AllLeagues />} />
          <Route path='/dashboard/teams' element={<AllTeams />} />
          <Route path='/dashboard/players' element={<AllPlayers />} />
          <Route path='/dashboard/games' element={<AllGames />} />
          <Route path='/dashboard/leagues/:id' element={<SingleLeague />} />
          <Route path='/dashboard/teams/:id' element={<SingleTeam />} />
          <Route path='/dashboard/seasonToggle' element={<SeasonToggle />} />
          <Route path='/dashboard/leagueToggle' element={<LeagueToggle />} />
          <Route path='/dashboard/teamToggle' element={<TeamToggle />} />
          <Route path='/dashboard/playerToggle' element={<PlayerToggle />} />
          <Route path='/dashboard/gameToggle' element={<GameToggle />} />
          <Route path='/dashboard/singleLeagueToggle/:id' element={<SingleLeagueToggle />} />
          <Route path='/dashboard/singleTeamToggle/:id' element={<SingleTeamToggle />} />
          <Route path='/dashboard/singleSeasonToggle/:id' element={<SingleSeasonToggle />} />
          <Route path='/scheduleBuilder' element={<ScheduleBuilder />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
