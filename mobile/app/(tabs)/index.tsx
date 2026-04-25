import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useProducts, Product } from "../../src/hooks/useProducts";
import { Image } from "expo-image";
import { useLocation } from "../../src/hooks/useLocation";

export default function HomeScreen() {
  const router = useRouter();
  const { location, getLocation } = useLocation();

  useEffect(() => {
    getLocation();
  }, []);

  const { data: products, isLoading, refetch } = useProducts(
    location?.coords.latitude,
    location?.coords.longitude
  );

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
        estimatedItemSize={200}
        numColumns={2}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>No products found nearby.</Text> : null
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
});
