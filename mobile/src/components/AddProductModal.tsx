import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useSaveProduct, useUpdateProduct, Product } from "../hooks/useProducts";
import { useLocationContext } from "../contexts/LocationContext";

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const AddProductModal = ({ visible, onClose, product }: AddProductModalProps) => {
  const { location, address } = useLocationContext();
  const saveProduct = useSaveProduct();
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setCategory(product.category);
      setQuantity(product.quantity.toString());
      setImages(product.imagesUrls);
    } else if (visible) {
      resetForm();
    }
  }, [product, visible]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setQuantity("1");
    setImages([]);
    setLoading(false);
  };

  const handleClose = () => {
    if (!product) {
      resetForm();
    }
    onClose();
  };

  const pickImage = async () => {
    if (product) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photos to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  const removeImage = (index: number) => {
    if (product) return;
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name || !price || !category || !quantity) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (images.length === 0 && !product) {
      Alert.alert("Error", "Please add at least one image.");
      return;
    }

    if (!location && !product) {
      Alert.alert("Error", "Location is required. Please enable location services.");
      return;
    }

    setLoading(true);
    try {
      if (product) {
        await updateProduct.mutateAsync({
          id: product._id,
          data: {
            name,
            description,
            price: Number(price),
            category,
            quantity: Number(quantity),
            address: product.address,
            coordinates: JSON.stringify(product.location.coordinates),
          },
        });
        Alert.alert("Success", "Product updated successfully!");
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("quantity", quantity);
        formData.append("address", address || "");
        
        formData.append(
          "coordinates",
          JSON.stringify([location!.coords.longitude, location!.coords.latitude])
        );

        images.forEach((uri, index) => {
          const fileName = uri.split("/").pop();
          const fileType = fileName?.split(".").pop();
          
          // @ts-ignore
          formData.append("images", {
            uri,
            name: fileName || `image_${index}.jpg`,
            type: `image/${fileType === "jpg" ? "jpeg" : fileType || "jpeg"}`,
          });
        });

        await saveProduct.mutateAsync(formData);
        Alert.alert("Success", "Product listed successfully!");
      }
      handleClose();
    } catch (error: any) {
      console.error("Save product error:", error);
      Alert.alert("Error", `Failed to ${product ? 'update' : 'save'} product. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{product ? 'Edit Item' : 'Add New Item'}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll}>
            <Text style={styles.label}>Product Images {product ? '' : '(Max 3)*'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.imagePlaceholder} />
                  {!product && (
                    <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(index)}>
                      <Ionicons name="close-circle" size={24} color="#dc3545" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {!product && images.length < 3 && (
                <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                  <Ionicons name="camera" size={40} color="#28a745" />
                  <Text style={styles.pickImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            {product && <Text style={styles.helperText}>Image editing is not allowed.</Text>}

            <Text style={styles.label}>Product Name*</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="What are you selling?"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your item..."
              multiline
              numberOfLines={4}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Price ($)*</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.flex1, { marginLeft: 15 }]}>
                <Text style={styles.label}>Quantity*</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Category*</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Electronics, Furniture"
            />

            <View style={styles.locationContainer}>
              <Ionicons name="location" size={20} color="#28a745" />
              <Text style={styles.locationText} numberOfLines={2}>
                {product ? product.address : (address || "Locating...")}
              </Text>
            </View>
            <Text style={styles.helperText}>
              {product ? "Location editing is not supported." : "Your current location will be used."}
            </Text>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{product ? 'Update Item' : 'Add Item'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    height: "92%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  formScroll: {
    flex: 1,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
  imageScroll: { marginBottom: 20 },
  imageContainer: { marginRight: 15, position: "relative" },
  imagePlaceholder: { width: 100, height: 100, borderRadius: 10 },
  removeIcon: { position: "absolute", top: -10, right: -10, backgroundColor: "#fff", borderRadius: 12 },
  pickImageButton: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#28a745",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fffb",
  },
  pickImageText: { color: "#28a745", fontSize: 12, marginTop: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 5,
  },
  locationText: { marginLeft: 10, fontSize: 14, color: "#666", flex: 1 },
  helperText: { fontSize: 12, color: "#999", marginBottom: 20 },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#ccc" },
});
