import axios from "axios";

// ✅ Make sure the correct environment variable is used
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5122";

const api = axios.create({
 baseURL: API_BASE_URL,
 withCredentials: true, // ✅ Required for authentication cookies/sessions
});

export default api;
