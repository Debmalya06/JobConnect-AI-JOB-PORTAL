import API_URL from '../utils/api';;
import { createContext, useState, useEffect, useContext, useCallback } from "react";

const AuthContext = createContext({
  user: null,
  userType: null,
  login: () => {},
  logout: () => {},
  loading: false,
  refreshUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: token },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserType(data.userType);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        setUser(null);
        setUserType(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (token, userData, type) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userType", type);
    setUser(userData);
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setUser(null);
    setUserType(null);
  };

  // Call this after a profile update to refresh in-memory user from DB
  const refreshUser = () => fetchUser();

  return (
    <AuthContext.Provider value={{ user, userType, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};



