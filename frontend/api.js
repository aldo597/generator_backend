import axios from 'axios';

// Create an instance of axios with the base URLgit
const api = axios.create({
  //baseURL: "http://localhost:8001"
  baseURL: "https://aldo597.github.io/generator/"
});

// Export the Axios instance
export default api;