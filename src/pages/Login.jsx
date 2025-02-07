import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ✅ Import useAuth

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
    navigate('/homedashboard', { replace: true });  // ✅ Redirect if successful
  } else {
    setErrorMessage(response.message);  // ✅ Show error message in UI
  }

  setLocalLoading(false);
};


const handleRegister = async (e) => {
  e.preventDefault();
  setLocalLoading(true);
  setErrorMessage("");  // ✅ Reset error message before submitting

  const response = await register(registerData);  // ✅ Get response from `register()`

  if (response.success) {
    navigate('/homedashboard', { replace: true });  // ✅ Redirect if successful
  } else {
    setErrorMessage(response.message);  // ✅ Show error message in UI

  }

  setLocalLoading(false);
};



  const toggleSignup = () => {
    setToggleLogin((prev) => !prev)
  }

  return (
    <div>
    {toggleLogin ? (
      <div>
      <form onSubmit={handleLogin}>
        <label>
          Username
          <input
            type='text'
            name='username'
            value={formData.username}
            onChange={handleInput}
          />
        </label>
        <label>
          Password
          <input
            type='password'
            name='password'
            value={formData.password}
            onChange={handleInput}
          />
        </label>
        <button type='submit' disabled={localLoading}>{localLoading ? "Loggin in..." : "LOGIN"}</button>
      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <button onClick={toggleSignup}>REGISTER</button>
      </div>
        )
        :
        (
      <div>
      <form onSubmit={handleRegister}>
        <label>
          Username
          <input
            type='text'
            name='username'
            value={registerData.username}
            onChange={handleRegisterInput}
          />
        </label>
        <label>
          Password
          <input
            type='password'
            name='password'
            value={registerData.password}
            onChange={handleRegisterInput}
          />
        </label>
        <label>
          Email
          <input
            type='email'
            name='email'
            value={registerData.email}
            onChange={handleRegisterInput}
          />
        </label>
        <button type='submit' disabled={localLoading}>{localLoading ? "Registering..." : "REGISTER"}</button>
      </form> 
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <button onClick={toggleSignup}>LOGIN</button>
      </div>
      )
}
    </div>
  );
}

export default Login;
