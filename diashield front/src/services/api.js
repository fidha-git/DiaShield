import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

// Request interceptor to add Authorization header if token exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization Header:", { Authorization: `Bearer ${token}` });
    } else {
      // If not on login/register, redirect to login
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;