import axios from "axios";

const api = axios.create({
  baseURL: "https://api.peltidenpasar.org"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // simpan saat login
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
