import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { LocationProvider } from "../src/contexts/LocationContext";
import { SocketProvider } from "../src/contexts/SocketContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { KeyboardProvider } from "react-native-keyboard-controller";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
});

function RootLayoutNav() {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const tabName = inTabsGroup ? segments[1] : null;

    // Define which routes are accessible without a token
    const isPublicRoute = 
      segments.length === 0 || // Root
      (segments.length === 1 && segments[0] === "(tabs)") || // Initial tabs entry
      tabName === "index" || // Home tab
      tabName === "profile" || // Profile tab (public view or redirected internally)
      tabName === "my-products" || // My products tab
      segments[0] === "product" || // Product details
      inAuthGroup; // Login/Signup

    if (!userToken && !isPublicRoute) {
      // Trying to access private route (Chat, Sell) without token
      console.log("[Navigation] Redirecting to login: Private route accessed without token.");
      router.replace("/login");
    } else if (userToken && inAuthGroup) {
      // Logged in user trying to access login/signup
      console.log("[Navigation] Redirecting to home: Authenticated user tried to access auth group.");
      router.replace("/(tabs)");
    }
  }, [userToken, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="product/[id]" options={{ headerShown: true, title: "Product Details" }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: "Chat" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <AuthProvider>
          <SocketProvider>
            <LocationProvider>
              <RootLayoutNav />
            </LocationProvider>
          </SocketProvider>
        </AuthProvider>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
