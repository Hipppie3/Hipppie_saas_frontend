import { createContext, useContext, useState, useEffect } from 'react';
import api from "../utils/api"; // ✅ Correct API instance

// ✅ Create Context
const AuthContext = createContext();

// ✅ Provide Context to Entire App
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Function to Check Auths from Backend
  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users/check-auth', { withCredentials: true });
      setIsAuthenticated(response.data.authenticated);
      setUser(response.data.user || null);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (formData) => {
    try {
      // Extract domain from URL query if available
      const domainFromURL = window.location.search.includes("domain=")
        ? new URLSearchParams(window.location.search).get("domain")
        : null;

      // Extract slug from the path
      const slugFromPath = window.location.pathname.split("/")[1] || null;

      // Construct the payload
      const payload = {
        ...formData,
        domain: formData.domain || domainFromURL || undefined,  // Assign domain if available
        slug: slugFromPath !== "login" ? slugFromPath : undefined  // Assign slug if available
      };

      // Send POST request with credentials
      const response = await api.post('/api/users/login', payload, { withCredentials: true });

      // Check if login was successful
      await checkAuth();

      return { success: true };
    } catch (error) {
      return { success: false, message: "Login failed. Please check your credentials." };
    }
  };



  // Logout Function
  const logout = async () => {
    try {
      const response = await api.post('/api/users/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
      console.log(response.data)
      return response.data; 
// ✅ Ensure the response is returned
    } catch (error) {
      console.error('Logout failed:', error);
      return null; // ✅ Prevent `undefined`
    }
  };


  const deleteUser = async (userId) => {
    console.log(userId)
    try {
      await api.delete(`/api/users/${userId}`, { withCredentials: true });
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
