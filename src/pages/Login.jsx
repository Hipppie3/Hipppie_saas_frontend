import React, { useState, useEffect } from 'react';
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
//updated
  const hostname = window.location.hostname.replace(/^www\./, '');
  const mainDomain = "sportinghip.com";
  const isCustomDomain = hostname !== mainDomain;
  const slug = !isCustomDomain ? location.pathname.split("/")[1] : null;
  const domain = isCustomDomain ? hostname : null;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setErrorMessage("");

    const loginPayload = { ...formData };
    if (domain) loginPayload.domain = domain;
    if (slug) loginPayload.slug = slug;

    const response = await login(loginPayload);
    if (response.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMessage(response.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
    setLocalLoading(false);
  };

  if (loading) return <p></p>;

  return (
    <div className="login_container">
      <div className="login_form_container">
        <h3 className="login_form_container_title">Login</h3>
        <form onSubmit={handleLogin} className="login_form">
          <label className="login_form_label">
            Username
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleInput}
              placeholder="👤  Type your username"
            />
          </label>
          <label className="login_form_label">
            Password
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleInput}
              placeholder="🔒  Type your password"
            />
          </label>
          <button className="login_form_btn" type='submit' disabled={localLoading}>
            {localLoading ? "Logging in..." : "LOGIN"}
          </button>
        </form>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Login;
