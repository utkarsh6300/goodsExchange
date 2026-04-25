import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocationContext } from "../contexts/LocationContext";

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationPickerModal = ({ visible, onClose }: LocationPickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { refreshLocation, manualSetLocation, isLoading } = useLocationContext();

  const handleUseCurrentLocation = async () => {
    await refreshLocation();
    onClose();
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    const success = await manualSetLocation(searchQuery);
    if (success) {
      onClose();
    } else {
      alert("Could not find that location. Please try again.");
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
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter city or address"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleManualSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
            disabled={isLoading}
          >
            <Ionicons name="locate" size={20} color="#28a745" />
            <Text style={styles.currentLocationText}>Use Current Location</Text>
            {isLoading && <ActivityIndicator size="small" color="#28a745" style={{ marginLeft: 10 }} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, !searchQuery.trim() && styles.disabledButton]}
            onPress={handleManualSearch}
            disabled={isLoading || !searchQuery.trim()}
          >
            <Text style={styles.applyButtonText}>Apply Manual Location</Text>
          </TouchableOpacity>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 20,
  },
  currentLocationText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#28a745",
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
