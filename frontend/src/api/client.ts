/**
 * Axios instance pre-configured with:
 * - Base URL from VITE_API_BASE_URL
 * - JWT Bearer token injection (request interceptor)
 * - Automatic token refresh on 401 (response interceptor)
 * - Standardised error handling & envelope unwrapping
 */
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { TokenStorage } from "@/features/auth/services/tokenStorage";
import { AUTH_ENDPOINTS } from "./endpoints";

// ─────────────────────────────────────────
// Create instance
// ─────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────
// Request interceptor — inject access token
// ─────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─────────────────────────────────────────
// Response interceptor — handle 401 / refresh
// ─────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if the 401 error came from the login or token refresh endpoints themselves
      const isAuthRequest =
        originalRequest.url?.includes(AUTH_ENDPOINTS.LOGIN) ||
        originalRequest.url?.includes(AUTH_ENDPOINTS.TOKEN_REFRESH);

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenStorage.getRefreshToken();

      if (!refreshToken) {
        TokenStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
        const { data } = await axios.post(
          `${baseUrl}${AUTH_ENDPOINTS.TOKEN_REFRESH}`,
          { refresh: refreshToken }
        );

        const newAccessToken = data.data?.access ?? data.access;
        if (!newAccessToken) {
          throw new Error("No access token returned from refresh endpoint.");
        }

        TokenStorage.setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        TokenStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
