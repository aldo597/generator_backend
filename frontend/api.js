import axios from "axios";

const BASE = import.meta.env.VITE_API_URL 
           || "https://railway.com?referralCode=gKJ-9H";

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
});

export default api;
