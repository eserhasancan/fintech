// src/axiosConfig.js
import axios from "axios";

// 1) Base URL
axios.defaults.baseURL = "http://localhost:5000/api";

// 2) Hem common hem de tekil isteklere Authorization ekleyelim
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
axios.interceptors.request.use(config => {
  const t = localStorage.getItem("token");
  if (t) {
    config.headers["Authorization"] = `Bearer ${t}`;
  }
  return config;
});
