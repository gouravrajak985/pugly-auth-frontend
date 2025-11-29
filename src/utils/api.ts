import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { showGlobalToast } from '../contexts/ToastContext';

// ✅ Define your backend error structure (optional)
interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

// ✅ Extend Axios config types globally
declare module 'axios' {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
  }
}

// ✅ Create a custom config type (since InternalAxiosRequestConfig doesn’t include our custom field)
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  requiresAuth?: boolean;
}

// ✅ Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor — attach token only if requiresAuth = true
api.interceptors.request.use(
  (config: CustomAxiosRequestConfig): CustomAxiosRequestConfig => {
    const token = localStorage.getItem('token');

    if (config.requiresAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    showGlobalToast('Request setup failed', 'error');
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor — handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,

  (error: AxiosError<ApiErrorResponse>) => {
    // 1️⃣ Handle Unauthorized (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      showGlobalToast('Session expired. Please login again.', 'error');
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    // 2️⃣ Extract backend message safely
    let errorMessage = 'An unexpected error occurred.';

    if (error.response) {
      // If backend sends text (string) instead of JSON
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
      // If backend sends object (like { message: "...", error: "..." })
      else if (typeof error.response.data === 'object' && error.response.data !== null) {
        errorMessage =
          (error.response.data as ApiErrorResponse).message ||
          (error.response.data as ApiErrorResponse).error ||
          JSON.stringify(error.response.data);
      }
    } else if (error.request) {
      // Request made but no response (Network/CORS)
      errorMessage = 'No response from server. Please check your internet connection.';
    } else {
      // Axios itself failed
      errorMessage = error.message || 'Something went wrong in setup.';
    }

    // 3️⃣ Show the toast with final extracted message
    showGlobalToast(errorMessage, 'error');

    // 4️⃣ Reject so component can handle it if needed
    return Promise.reject(error);
  }
);


export default api;
