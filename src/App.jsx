import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Users from './pages/Users.jsx';
import HomeDashboard from './pages/HomeDashboard.jsx';


function App() {

  return (
    <div>
      <Navbar />
      <div>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/users' element={<Users />} />
          <Route path='/homedashboard' element={<HomeDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
