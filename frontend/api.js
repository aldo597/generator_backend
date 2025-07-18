import axios from 'axios';

const api = axios.create({
  //baseURL: "http://localhost:8001"
  baseURL: "https://generatorbackend-production-6bce.up.railway.app/"
});

export default api;