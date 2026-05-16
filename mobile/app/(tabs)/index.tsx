import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Button } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useProducts, Product } from "../../src/hooks/useProducts";
import { Image } from "expo-image";
import { useLocationContext } from "../../src/contexts/LocationContext";

export default function HomeScreen() {
  const router = useRouter();
  const { location, refreshLocation, errorMsg, isLoading: isLocLoading } = useLocationContext();

  const { data: products, isLoading: isProdLoading, refetch } = useProducts(
    location?.coords.latitude,
    location?.coords.longitude
  );

  // Mandatory Location UI
  if (!location && errorMsg) {
    return (
      <View style={styles.mandatoryContainer}>
        <Text style={styles.mandatoryTitle}>Location Required</Text>
        <Text style={styles.mandatoryText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
          <Text style={styles.retryButtonText}>Grant Permission & Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLocLoading && !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 10 }}>Locating...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${item._id}`)}
    >
      <Image
        source={item.imagesUrls && item.imagesUrls.length > 0 ? item.imagesUrls[0] : "https://via.placeholder.com/150"}
        style={styles.image}
        contentFit="cover"
        transition={500}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>{item.price ? `$${item.price}` : "Free"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={products}
        renderItem={renderItem}
        numColumns={2}
        onRefresh={() => refetch()}
        refreshing={isProdLoading}
        ListEmptyComponent={
          !isProdLoading ? <Text style={styles.empty}>No products found nearby.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 5 },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: "100%", height: 150 },
  info: { padding: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, color: "#28a745", marginTop: 5 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#666" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  mandatoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  mandatoryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  mandatoryText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
