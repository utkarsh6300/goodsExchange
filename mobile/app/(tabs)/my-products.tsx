import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMyProducts, Product, useUpdateQuantity } from "../../src/hooks/useProducts";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { AddProductModal } from "../../src/components/AddProductModal";
import { useAuth } from "../../src/contexts/AuthContext";

export default function MyProductsScreen() {
  const router = useRouter();
  const { userToken, isLoading: authLoading } = useAuth();
  const { data: products, isLoading, refetch } = useMyProducts();
  const updateQuantity = useUpdateQuantity();
  
  const [addModalVisible, setAddProductVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setAddProductVisible(true);
  };

  const handleMarkAsSold = (id: string) => {
    updateQuantity.mutate(id);
  };

  const renderItem: ListRenderItem<Product> = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => router.push(`/product/${item._id}`)}
      >
        <Image
          source={item.imagesUrls && item.imagesUrls.length > 0 ? item.imagesUrls[0] : "https://via.placeholder.com/150"}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>{item.price ? `$${item.price}` : "Free"}</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color="#28a745" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.soldButton]}
            onPress={() => handleMarkAsSold(item._id)}
          >
            <Ionicons name="checkmark-done" size={18} color="#666" />
            <Text style={styles.soldButtonText}>Sold</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  if (!userToken) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={80} color="#ccc" />
        <Text style={styles.loginText}>Please login to see your products.</Text>
        <TouchableOpacity 
          style={styles.listButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.listButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          onPress={() => {
            setSelectedProduct(null);
            setAddProductVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlashList<Product>
        data={products}
        renderItem={renderItem}
        numColumns={2}
        onRefresh={() => refetch()}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>You haven't listed any products yet.</Text>
            <TouchableOpacity 
              style={styles.listButton}
              onPress={() => {
                setSelectedProduct(null);
                setAddProductVisible(true);
              }}
            >
              <Text style={styles.listButtonText}>Add Your First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <AddProductModal 
        visible={addModalVisible} 
        product={selectedProduct}
        onClose={() => {
          setAddProductVisible(false);
          setSelectedProduct(null);
          refetch();
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
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
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  editButton: {
  },
  editButtonText: {
    fontSize: 12,
    color: "#28a745",
    marginLeft: 4,
    fontWeight: "600",
  },
  soldButton: {
  },
  soldButtonText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "600",
  },
  loginText: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
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
