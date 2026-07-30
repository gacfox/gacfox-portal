import { useState, useEffect } from "react";
import { AuthContext } from "@/utils/AuthContext";
import { getToken, saveToken, setUnauthorizedHandler } from "@/utils/api";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getToken());

  // API 层收到 401 时强制登出
  useEffect(() => {
    setUnauthorizedHandler(() => {
      saveToken(null);
      setToken(null);
    });
  }, []);

  const login = (newToken) => {
    saveToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    saveToken(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
