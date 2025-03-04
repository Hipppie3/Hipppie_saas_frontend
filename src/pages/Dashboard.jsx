import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'

function Dashboard() {
  const { user, loading } = useAuth(); // ✅ Also get loading state
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);
  const [successDeleteMessage, setSuccessDeleteMessage] = useState('')

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
    </div>
  );
}

export default Dashboard;
