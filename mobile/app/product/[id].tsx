import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProduct } from "../../src/hooks/useProducts";
import { Image } from "expo-image";
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/services/api";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id as string);
  const { userToken } = useAuth();

  const handleContactSeller = async () => {
    if (!userToken) {
      router.push("/login");
      return;
    }

    try {
      // Create or get conversation
      const ownerId = typeof product?.owner === "string" ? product.owner : product?.owner._id;
      const response = await api.post("/chat/conversations", {
        otherUserId: ownerId,
        productId: product?._id,
      });

      const conversation = response.data;
      router.push(`/chat/${conversation._id}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not start a conversation with the seller.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text>Error loading product details.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={product.imagesUrls && product.imagesUrls.length > 0 ? product.imagesUrls[0] : "https://via.placeholder.com/150"}
        style={styles.mainImage}
        contentFit="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description || "No description provided."}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detailText}>Category: {product.category}</Text>
          {product.subCategory && <Text style={styles.detailText}>Subcategory: {product.subCategory}</Text>}
          <Text style={styles.detailText}>Quantity: {product.quantity}</Text>
          {product.address && <Text style={styles.detailText}>Location: {product.address}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller</Text>
          <Text style={styles.detailText}>
            Sold by: {typeof product.owner === "string" ? "User" : product.owner.name || product.owner.username}
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContactSeller}>
          <Text style={styles.buttonText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainImage: { width: "100%", height: 300 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  price: { fontSize: 22, color: "#28a745", fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 20, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 16, color: "#444", lineHeight: 24 },
  detailText: { fontSize: 16, color: "#666", marginBottom: 5 },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
