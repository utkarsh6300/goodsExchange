import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMyProducts, Product } from "../../src/hooks/useProducts";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { AddProductModal } from "../../src/components/AddProductModal";

export default function MyProductsScreen() {
  const router = useRouter();
  const { data: products, isLoading, refetch } = useMyProducts();
  const [addModalVisible, setAddProductVisible] = useState(false);

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
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.quantity > 0 ? "Active" : "Sold"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !products) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setAddProductVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlashList
        data={products}
        renderItem={renderItem}
        numColumns={2}
        onRefresh={refetch}
        refreshing={isLoading}
        estimatedItemSize={200}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>You haven't listed any products yet.</Text>
            <TouchableOpacity 
              style={styles.listButton}
              onPress={() => setAddProductVisible(true)}
            >
              <Text style={styles.listButtonText}>List Your First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <AddProductModal 
        visible={addModalVisible} 
        onClose={() => {
          setAddProductVisible(false);
          refetch();
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  addButton: {
    backgroundColor: "#28a745",
    padding: 8,
    borderRadius: 20,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: "100%", height: 140 },
  info: { padding: 10 },
  title: { fontSize: 15, fontWeight: "bold", color: "#333" },
  price: { fontSize: 14, color: "#28a745", marginTop: 4, fontWeight: "600" },
  statusBadge: {
    marginTop: 8,
    backgroundColor: "#e9ecef",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 11, color: "#666", fontWeight: "500" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
    marginBottom: 30,
  },
  listButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  listButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
