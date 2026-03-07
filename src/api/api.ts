import axios from "axios";
import { getAccessToken } from "./auth";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", 
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  console.log('token from api',token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});