import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ Import AuthContext

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth(); // ✅ Use context to update state

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const login = async () => {
      try {
        const response = await axios.post('/api/users/login', formData, {
          withCredentials: true, // ✅ Ensure session cookies are sent
        });

        console.log('Login successful:', response.data.message);
        
        // ✅ Update authentication state immediately
        setIsAuthenticated(true);
        
        navigate('/users'); // ✅ Redirect after login
      } catch (error) {
        console.error('Incorrect username or password');
      }
    };

    login();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
        <button type='submit'>SUBMIT</button>
      </form>
    </div>
  );
}

export default Login;
