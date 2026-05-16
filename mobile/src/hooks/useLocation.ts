import { useLocationContext } from "../contexts/LocationContext";

/**
 * Hook to consume LocationContext.
 * Unified with the Context provider to ensure single source of truth.
 */
export const useLocation = () => {
  const { location, address, errorMsg, refreshLocation, isLoading, manualSetCoords } = useLocationContext();

  return { 
    location, 
    address, 
    errorMsg, 
    isLoading,
    manualSetCoords,
    getLocation: refreshLocation // Aliased for compatibility
  };
};
