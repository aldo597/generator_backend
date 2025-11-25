import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  // ggf. headers: { 'Content-Type': 'application/json' }
});

export default api;