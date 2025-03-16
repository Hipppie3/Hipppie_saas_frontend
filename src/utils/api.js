import axios from "axios";

// ✅ Load VITE_API_URL properly
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5122"; // Fallback to localhost in development

console.log("✅ API Base URL:", API_BASE_URL); // Debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Ensure cookies work with credentials
});

export default api;
