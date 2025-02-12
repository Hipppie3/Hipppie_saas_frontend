import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Create Context
const AuthContext = createContext();

// ✅ Provide Context to Entire App
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Function to Check Auths from Backend
  const checkAuth = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/users/check-auth', { withCredentials: true });
      setIsAuthenticated(response.data.authenticated);
      setUser(response.data.user || null);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null)
    }
    setLoading(false)
  };

const login = async (formData) => {
  setLoading(true);
  try {
    const response = await axios.post('/api/users/login', formData, { withCredentials: true });
    console.log(response.data)
    await checkAuth();
    setLoading(false);
    return { success: true };  // ✅ Return success so `Login.jsx` knows it's successful
  } catch (error) {
    setLoading(false);
    return { success: false, message: "Login failed. Please check your credentials." };  // ✅ Return error message
  }
};

const register = async (registerData) => {
  setLoading(true);
  try {
    await axios.post('/api/users/register', registerData, { withCredentials: true });
    await checkAuth();
    setLoading(false);
    return { success: true };  // ✅ Return success so `Login.jsx` knows it's successful
  } catch (error) {
    setLoading(false);
    return { success: false, message: "Registration failed. Please try again." };  // ✅ Return error message
  }
};

  // Logout Function
  const logout = async () => {
    try {
      await axios.post('/api/users/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`, { withCredentials: true });
      return { success: true};
    } catch (error) {
      console.error("Delete failed", error);
      return { success: false, message: 'Failed to delete user'};
    }
  };



  // ✅ Check Auth on First Render
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, checkAuth, login, register, logout, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook to Use AuthContext
export const useAuth = () => useContext(AuthContext);
