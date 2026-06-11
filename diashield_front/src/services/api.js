import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (window.location.pathname !== "/login") {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      error.message = data?.detail || `Request failed (${status})`;
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail[0]?.msg || "Validation error";
  }
  if (typeof detail === "string") return detail;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response) return `Request failed (${err.response.status})`;
  if (err?.message) return err.message;
  return "An unexpected error occurred";
}

export default API;