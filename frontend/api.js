import axios from "axios";

const BASE = import.meta.env.VITE_API_URL 
           || "https://generatorbackend-production-6bce.up.railway.app/";

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
});

export default api;
