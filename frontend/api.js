import axios from "axios";

//const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE = "https://railway.com?referralCode=gKJ-9H"; 

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  // ggf. headers: { 'Content-Type': 'application/json' }
});

export default api;