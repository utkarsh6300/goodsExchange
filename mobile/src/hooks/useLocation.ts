import { useLocationContext } from "../contexts/LocationContext";

/**
 * Hook to consume LocationContext.
 * Unified with the Context provider to ensure single source of truth.
 */
export const useLocation = () => {
  const { location, address, errorMsg, refreshLocation, isLoading } = useLocationContext();

  return { 
    location, 
    address, 
    errorMsg, 
    isLoading,
    getLocation: refreshLocation // Aliased for compatibility
  };
};
