import React, { createContext, useContext, useEffect, ReactNode } from "react";
import socketService from "../services/socketService";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  // We no longer automatically connect/disconnect here.
  // Connection is handled on-demand in specific screens.

  return (
    <SocketContext.Provider value={{ isConnected: !!socketService.socket?.connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
