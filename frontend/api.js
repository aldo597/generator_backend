import axios from "axios";

// Base URL: Railway Deployment
const BASE = import.meta.env.VITE_API_URL 
           || "https://generatorbackend-production-6bce.up.railway.app";

const api = axios.create({
  baseURL: BASE,    // Axios baut automatisch die vollständige URL
  timeout: 30000,   // 30 Sekunden Timeout
});

export default api;
