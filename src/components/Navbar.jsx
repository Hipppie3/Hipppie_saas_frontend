import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from  '../context/AuthContext'


function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading, user } = useAuth();


  // ✅ Logout Function
  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  console.log(user)

  return (
    <div>
      {isAuthenticated ? 
      (
        <div>
          <NavLink to='/dashboard'>DASHBOARD</NavLink>
          <NavLink to='/leagueList'>LEAGUES</NavLink>
          <NavLink to='/teamList'>TEAMS</NavLink>
          {user?.role === 'super_admin' && (<NavLink to='/userList'>USERS</NavLink>)}
          <button onClick={handleLogout}>LOGOUT</button>
        </div>
      ) 
      : 
      (
        <div>
          <NavLink to='/login'>LOGIN</NavLink>
        </div>
      )}
    </div>
  );
}

export default Navbar;
