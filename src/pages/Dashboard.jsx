import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@api';
import DashboardStatCard from './DashboardCards/DashboardStatCard';
import './Dashboard.css'
import { useViewToggle } from '../context/ViewToggleContext'; // or wherever it's located


function Dashboard() {
  const { user, loading } = useAuth(); // ✅ Also get loading state
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [successDeleteMessage, setSuccessDeleteMessage] = useState('');
  const { viewMode, toggleViewMode } = useViewToggle();


  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      const currentUrl = new URL(window.location.href);
      const domain = currentUrl.searchParams.get("domain");
      if (domain) {
        navigate(`/site?domain=${domain}`, { replace: true }); // ✅ Redirect to public site instead of login
      } else {
        navigate("/", { replace: true }); // ✅ Default to home if no domain exists
      }
    }
  }, [user, loading, navigate]);



  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/api/users/dashboardStats', { withCredentials: true });
        setDashboardStats(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);


  // ✅ Prevent error by showing loading state before rendering
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Redirecting...</p>;
  }



  return (
    <div className="dashboard_container">
      <h2 className="dashboard_welcome_msg">WELCOME {user.username}!</h2>
      <div className="view-toggle-buttons">
        <button
          className={viewMode === 'card' ? 'active' : ''}
          onClick={() => toggleViewMode('card')}
        >
          🧩 Card View
        </button>
        <button
          className={viewMode === 'table' ? 'active' : ''}
          onClick={() => toggleViewMode('table')}
        >
          📄 Table View
        </button>
      </div>

      <div className="dashboard_stats_wrapper">
      {/* <DashboardStatCard title="Sports" count={user?.sports?.length || 0} /> */}
      <DashboardStatCard title="Seasons" count={dashboardStats?.seasonCount} onClick={() => navigate('/dashboard/seasonToggle')} />
        <DashboardStatCard title="Leagues" count={dashboardStats?.leagueCount} onClick={() => navigate('/dashboard/leagueToggle')}/>
      <DashboardStatCard title="Teams" count={dashboardStats?.teamCount} onClick={() => navigate('/dashboard/teamToggle')} />
        <DashboardStatCard title="Players" count={dashboardStats?.playerCount} onClick={() => navigate('/dashboard/playerToggle')} />
        <DashboardStatCard title="Games" count={dashboardStats?.gameCount} onClick={() => navigate('/dashboard/gameToggle')} />
      </div>
    </div>
  );
}

export default Dashboard;
