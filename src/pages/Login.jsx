import React, { useState, useEffect  } from 'react';
import { FaUser, FaLock } from "react-icons/fa";  // ✅ Import icons

import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ✅ Import useAuth
import './Login.css'

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  // const [registerData, setRegisterData] = useState({ username: "", password: "", email: "", domain: "" })
  const [localLoading, setLocalLoading] = useState(false)
  const [toggleLogin, setToggleLogin] = useState(true)
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const domain = searchParams.get("domain") || window.location.hostname;
  const slugMatch = location.pathname.match(/^\/([a-zA-Z0-9-_]+)/);
  const slug = slugMatch ? slugMatch[1] : null;
  const [errorMessage, setErrorMessage] = useState("")
  const { login, register, isAuthenticated, loading } = useAuth();  
  const navigate = useNavigate()


  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
  
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setErrorMessage("");

    const loginPayload = { ...formData };
    if (domain) loginPayload.domain = domain;
    else if (slug) loginPayload.slug = slug;
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
    <div className='login_container'>

    {/* {toggleLogin ? ( */}
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
        <button className="login_form_btn" type='submit' disabled={localLoading}>{localLoading ? "Loggin in..." : "LOGIN"}</button>
      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {/* <p>Don't have an account? <button className="login_form_register_btn" onClick={toggleSignup}>Register</button></p>
      </div>
        )
        :
        (
      <div className="register_form_container">
      <h3 className="register_form_title">Register</h3>
      <form onSubmit={handleRegister} className="register_form">
        <label className="register_form_label">
          Username
          <input
            type='text'
            name='username'
            value={registerData.username}
            onChange={handleRegisterInput}
            placeholder='👤   Type in Username'
            className="register_form_input"
          />
        </label>
        <label className="register_form_label">
          Password
          <input
            type='password'
            name='password'
            value={registerData.password}
            onChange={handleRegisterInput}
            placeholder='🔒   Type in Password'
            className="register_form_input"
          />
        </label>
        <label className="register_form_label">
          Email
          <input
            type='email'
            name='email'
            value={registerData.email}
            onChange={handleRegisterInput}
            placeholder="📧   Type in your email"
            className="register_form_input"
          />
        </label>
                <label className="register_form_label">
          Domain
          <input
            type='text'
            name='domain'
            value={registerData.domain}
            onChange={handleRegisterInput}
            placeholder="🌍   Type in your Domain"
            className="register_form_input"
          />
        </label>
        <button className="register_form_btn" type='submit' disabled={localLoading}>{localLoading ? "Registering..." : "REGISTER"}</button>
      </form> 
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <p>Already have an account? <button className="register_form_login_btn" onClick={toggleSignup}>Login</button></p>
      </div>
      )
} */}
</div>
    </div>
  );
}

export default Login;
