import axios from "axios";
import { apiBaseUrl } from "./config";


const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const sessionData = localStorage.getItem("auth_session");
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch (error) {
      console.error("Failed to parse auth session:", error);
    }
  }

  return config;
});

export default apiClient;
