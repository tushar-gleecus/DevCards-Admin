import axios from "axios";

// Create Axios instance using your environment variable
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Example: http://localhost:8000/api
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach token from localStorage to every request (browser only)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");

      // Skip attaching token for login or register routes
      const publicPaths = ["/login", "/register"];
      const isPublicRoute = publicPaths.some((path) => config.url?.includes(path));

      if (token && !isPublicRoute) {
        config.headers.Authorization = `Bearer ${token}`; // Changed from `Token` to `Bearer`
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle global response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: redirect to login if token expired
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("access_token");
    //   window.location.href = "/auth/v1/login";
    // }
    return Promise.reject(error);
  },
);

export default apiClient;