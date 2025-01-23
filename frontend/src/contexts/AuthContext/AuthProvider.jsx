import React, { useReducer, useEffect } from "react";
import verifyToken from '../../verifyToken';
import AuthContext from "./AuthContext";
import { authReducer, initialState } from "./state";

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const isTokenValid = await verifyToken(token); // Wait for token verification
        if (isTokenValid) {
          dispatch({ type: 'LOGIN' });
        } else {
          // Token is invalid; remove it and log out
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    initializeAuth(); // Call the async function
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

