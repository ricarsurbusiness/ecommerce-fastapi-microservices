import axios from "axios";

const API_URL = import.meta.env.VITE_AUTH_API || "http://localhost:8000/auth";

export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
};

export const login = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  return res.data;
};
