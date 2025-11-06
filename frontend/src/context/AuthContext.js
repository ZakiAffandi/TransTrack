import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const login = (payload) => {
    setUser(payload || { name: 'User' });
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const openLogin = () => setIsAuthModalOpen(true);
  const closeLogin = () => setIsAuthModalOpen(false);

  // Require auth to execute action; open login if not
  const requireAuth = useCallback((action) => {
    if (isAuthenticated) {
      action?.();
    } else {
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    isAuthenticated,
    user,
    login,
    logout,
    openLogin,
    closeLogin,
    isAuthModalOpen,
    requireAuth,
  }), [isAuthenticated, user, isAuthModalOpen, requireAuth]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


