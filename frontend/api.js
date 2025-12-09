import axios from "axios";

const BASE = import.meta.env.VITE_API_URL 
           || "https://<dein-projekt>.railway.app";

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
});

export default api;
