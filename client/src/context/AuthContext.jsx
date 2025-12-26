import { createContext, useContext, useState } from 'react';


const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();

  const logout = () => {
    setUser('')
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  };

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    if (token != null) return true;
    else return false
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};