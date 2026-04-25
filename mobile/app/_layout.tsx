import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
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

    // Handle root path
    if (segments.length === 0) {
      router.replace("/(tabs)");
      return;
    }

    // Public tabs: index (Home), map
    // Private tabs: add, chat
    const isPublicTab = tabName === "index" || tabName === "map" || !tabName;

    if (!userToken) {
      // If not logged in and trying to access a private tab or other private routes
      if (inTabsGroup && !isPublicTab) {
        router.replace("/login");
      } else if (!inTabsGroup && !inAuthGroup) {
        // Any other route (like /chat/[id] or /product/[id]) also requires login for guest browsing
        // Actually, web allows viewing products. Let's keep product details public too.
        if (segments[0] === "chat") {
          router.replace("/login");
        }
      }
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
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}
