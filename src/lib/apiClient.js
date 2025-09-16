import axios from "axios";
import { setupAuthInterceptor } from "@/utils/axiosInterceptors";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
  withCredentials: false,
});

if (typeof setupAuthInterceptor === "function") {
  setupAuthInterceptor(apiClient);
}

export default apiClient;
