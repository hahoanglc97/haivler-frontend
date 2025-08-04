import { createContext, useContext, useState, useEffect } from 'react';
import HaivlerAPI from '../services/api';
import { getCookie } from '../utils/cookiesHelper.ts';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initAuth = async () => {
      const token = getCookie("token");
      if (token) {
        const storedUser = HaivlerAPI.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Fetch fresh user data
          const result = await HaivlerAPI.getUserProfile();
          if (result.success) {
            setUser(result.data);
          } else {
            // Token is invalid, clear everything
            setUser(null);
            HaivlerAPI.logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    const result = await HaivlerAPI.login(credentials);
    if (result.success) {
      const userProfile = await HaivlerAPI.getUserProfile();
      if (userProfile.success) {
        setUser(userProfile.data);
      }
    }
    setLoading(false);
    return result;
  };

  const register = async (userData) => {
    setLoading(true);
    const result = await HaivlerAPI.register(userData);
    setLoading(false);
    return result;
  };

  const logout = () => {
    setUser(null);
    HaivlerAPI.logout();
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};