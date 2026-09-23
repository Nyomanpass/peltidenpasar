import axios from "axios";

const BASE = import.meta.env.VITE_API_URL;
if (!BASE) console.error("VITE_API_URL belum di-set — cek file .env");

const api = axios.create({
  baseURL: `${BASE}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;