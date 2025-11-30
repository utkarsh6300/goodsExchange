import React, { useReducer, useEffect } from "react";

import verifyToken from '../../verifyToken';
import { setLogoutHandler } from '../../services/api';

import AuthContext from "./AuthContext";
import { authReducer, initialState } from "./state";

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Register logout handler for API interceptor
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      dispatch({ type: 'LOGOUT' });
    };
    setLogoutHandler(handleLogout);
  }, []);

  useEffect(() => {
    // Initialize state with token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token (you should implement token verification logic)
      const run = async () => {
        const isTokenValid = await verifyToken(token);
        if (isTokenValid) {
          // set logged in state and user if available
          const userId = localStorage.getItem('userId');
          if (userId) {
            dispatch({ type: 'SET_USER', payload: { id: userId } });
          } else {
            dispatch({ type: 'LOGIN' });
          }
        } else {
        // Remove invalid token and log out
        localStorage.removeItem('token');
          localStorage.removeItem('userId');
        dispatch({ type: 'LOGOUT' });
      }
      };
      run();
    }
  }, []);
  

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );

}

export default AuthProvider;
