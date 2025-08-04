import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "../utils/cookiesHelper.ts";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Obfuscated endpoint mappings (from backend)
const OBFUSCATED_ENDPOINTS = {
  REGISTER: "/api/x/1f217a698b25",
  LOGIN: "/api/x/9592fc5373e2",
  LOGOUT: "/api/x/3f6b4e4dc96d",
  USER_PROFILE: "/api/x/5baaf1c55a0a",
  POSTS: "/api/x/ff0d498c575b",
  COMMENTS: "/api/x/0ebcf2cda524",
  REACTIONS: "/api/x/7e7cc3288efb",
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data
      deleteCookie("token");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

class HaivlerAPI {
  // Authentication endpoints
  static async register(userData) {
    try {
      const response = await apiClient.post(
        OBFUSCATED_ENDPOINTS.REGISTER,
        userData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      };
    }
  }

  static async login(credentials) {
    try {
      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const response = await apiClient.post(
        OBFUSCATED_ENDPOINTS.LOGIN,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("response", response);

      const { access_token, token_type } = response.data;
      // localStorage.setItem('token', access_token);
      setCookie("token", access_token); // Set token cookie for 7 days

      // Get user profile after successful login
      const userProfile = await this.getUserProfile();
      if (userProfile.success) {
        // localStorage.setItem("user", JSON.stringify(userProfile.data));
        getCookie("token");
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  }

  static logout() {
    // Clear token from cookies
    deleteCookie("token");
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // In case token was also stored in localStorage
    // Redirect to login page
    window.location.href = "/login";
  }

  // User endpoints
  static async getUserProfile() {
    try {
      const response = await apiClient.get(OBFUSCATED_ENDPOINTS.USER_PROFILE);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch user profile",
      };
    }
  }

  static async updateUserProfile(userData) {
    try {
      const response = await apiClient.put(
        OBFUSCATED_ENDPOINTS.USER_PROFILE,
        userData
      );
      localStorage.setItem("user", JSON.stringify(response.data));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update profile",
      };
    }
  }

  // Posts endpoints
  static async getPosts(page = 0, limit = 10, sort = "new") {
    try {
      const response = await apiClient.get(OBFUSCATED_ENDPOINTS.POSTS, {
        params: { page, limit, sort },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch posts",
      };
    }
  }

  static async getPost(postId) {
    try {
      const response = await apiClient.get(
        `${OBFUSCATED_ENDPOINTS.POSTS}/${postId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch post",
      };
    }
  }

  static async createPost(postData) {
    try {
      const formData = new FormData();
      formData.append("title", postData.title);
      if (postData.description) {
        formData.append("description", postData.description);
      }
      formData.append("image", postData.image);

      const response = await apiClient.post(
        OBFUSCATED_ENDPOINTS.POSTS,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to create post",
      };
    }
  }

  static async updatePost(postId, postData) {
    try {
      const response = await apiClient.put(
        `${OBFUSCATED_ENDPOINTS.POSTS}/${postId}`,
        postData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update post",
      };
    }
  }

  static async deletePost(postId) {
    try {
      const response = await apiClient.delete(
        `${OBFUSCATED_ENDPOINTS.POSTS}/${postId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to delete post",
      };
    }
  }

  // Comments endpoints
  static async getComments(postId) {
    try {
      const response = await apiClient.get(
        `/api/x/ff0d498c575b/${postId}/comments`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch comments",
      };
    }
  }

  static async createComment(postId, content) {
    try {
      const response = await apiClient.post(
        `/api/x/ff0d498c575b/${postId}/comments`,
        {
          content,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to create comment",
      };
    }
  }

  static async deleteComment(commentId) {
    try {
      const response = await apiClient.delete(
        `/api/x/0ebcf2cda524/${commentId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to delete comment",
      };
    }
  }

  // Reactions endpoints
  static async getReactions(postId) {
    try {
      const response = await apiClient.get(
        `/api/x/ff0d498c575b/${postId}/reactions`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch reactions",
      };
    }
  }

  static async createReaction(postId, reactionType) {
    try {
      const response = await apiClient.post(
        `/api/x/ff0d498c575b/${postId}/reaction`,
        {
          reaction_type: reactionType,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to create reaction",
      };
    }
  }

  static async deleteReaction(postId) {
    try {
      const response = await apiClient.delete(
        `/api/x/ff0d498c575b/${postId}/reaction`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to delete reaction",
      };
    }
  }

  // Utility methods
  static getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}

export default HaivlerAPI;
