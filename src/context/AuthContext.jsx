import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Create Context
const AuthContext = createContext();

// ✅ Provide Context to Entire App
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Function to Check Auth from Backend
  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/users/check-auth', { withCredentials: true });
      setIsAuthenticated(response.data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  // ✅ Check Auth on First Render
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook to Use AuthContext
export const useAuth = () => useContext(AuthContext);
