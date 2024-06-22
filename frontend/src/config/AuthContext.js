// AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import useCurrentUser from './UseCurrentUser';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const {user, loading, loggedIn} = useCurrentUser();
  const [isAuthenticated, setIsAuthenticated] = useState(loggedIn);

  console.log(loggedIn)
  useState(() => {
    if (!loading) {
      console.log(loggedIn)
      setIsAuthenticated(loggedIn);
    }    
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  if (loading)
    return null

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};