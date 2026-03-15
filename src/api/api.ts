import axios from "axios";
import { getAccessToken } from "./auth";

export const api = axios.create({
  baseURL: "https://skillswap-backend-nsxl.onrender.com/api", 
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  console.log('token from api',token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});