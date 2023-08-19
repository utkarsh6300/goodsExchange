import React, { useReducer, useEffect } from "react";

import verifyToken from '../../verifyToken';

import AuthContext from "./AuthContext";
import { authReducer, initialState } from "./state";

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  useEffect(() => {
    // Initialize state with token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token (you should implement token verification logic)
      const isTokenValid = verifyToken(token);
      if (isTokenValid) {
        dispatch({ type: 'LOGIN' });
      } else {
        // Remove invalid token and log out
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      }
    }
  }, []);
  

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );

}

export default AuthProvider;
