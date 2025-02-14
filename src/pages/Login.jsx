import React, { useState } from 'react';
import { FaUser, FaLock } from "react-icons/fa";  // ✅ Import icons
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ✅ Import useAuth
import './Login.css'

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", email: "" })
  const [localLoading, setLocalLoading] = useState(false)
  const [toggleLogin, setToggleLogin] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const { login, register } = useAuth();  
  const navigate = useNavigate()

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleRegisterInput = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setLocalLoading(true);
  setErrorMessage("");  // ✅ Reset error message before submitting

  const response = await login(formData);  // ✅ Get response from `login()`

  if (response.success) {
    navigate('/dashboard', { replace: true });  // ✅ Redirect if successful
  } else {
    setErrorMessage(response.message); 
    setTimeout(() => {
    setErrorMessage("")
    }, 3000); 
  }
  setLocalLoading(false);
};


const handleRegister = async (e) => {
  e.preventDefault();
  setLocalLoading(true);
  setErrorMessage("");  // ✅ Reset error message before submitting
  const response = await register(registerData);  // ✅ Get response from `register()`
  if (response.success) {
    navigate('/dashboard', { replace: true });  // ✅ Redirect if successful
  } else {
    setErrorMessage(response.message); 
    setTimeout(() => {
      setErrorMessage("")
    }, 3000);
  }
  setLocalLoading(false);
};

  const toggleSignup = () => {
    setToggleLogin((prev) => !prev)
  }

  return (
    <div className='login_container'>

    {toggleLogin ? (
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
      <p>Don't have an account? <button className="login_form_register_btn" onClick={toggleSignup}>Register</button></p>
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
        <button className="register_form_btn" type='submit' disabled={localLoading}>{localLoading ? "Registering..." : "REGISTER"}</button>
      </form> 
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <p>Already have an account? <button className="register_form_login_btn" onClick={toggleSignup}>Login</button></p>
      </div>
      )
}
    </div>
  );
}

export default Login;
