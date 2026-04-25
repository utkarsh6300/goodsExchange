import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { LocationProvider } from "../src/contexts/LocationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

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
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const tabName = segments[1];

    // Align with Frontend Navigation:
    // Public: Home (index), Map, Product Details (product/[id])
    // Private: Chat (chat), Sell (add)
    
    const isPublicRoute = 
      tabName === "index" || 
      tabName === "map" || 
      segments[0] === "product" ||
      inAuthGroup ||
      segments.length === 0;

    if (!userToken && !isPublicRoute) {
      // Redirect to login if trying to access private routes (Chat, Sell, etc)
      router.replace("/login");
    } else if (userToken && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth screens
      router.replace("/(tabs)");
    }
  }, [userToken, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: "Product Details" }} />
      <Stack.Screen name="chat/[id]" options={{ title: "Chat" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <RootLayoutNav />
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
