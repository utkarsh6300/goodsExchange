import React, { useState, useEffect, useCallback } from "react";
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
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { useLocationContext } from "../contexts/LocationContext";
import * as Location from "expo-location";

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

// Simple local debounce function
function debounce(func: Function, wait: number) {
  let timeout: any;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const LocationPickerModal = ({ visible, onClose }: LocationPickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { location, address, refreshLocation, manualSetLocation, isLoading, manualSetCoords } = useLocationContext();
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map and marker from current location
  useEffect(() => {
    if (visible) {
      if (location?.coords) {
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setMapRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setSelectedCoords(coords);
      }
      if (address) {
        setSearchQuery(address);
      }
    }
  }, [visible, location, address]);

  // Handle autocomplete
  const fetchAutocomplete = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Use expo-location geocode as a free alternative to Google Places if no API key is easily accessible
      // Or if we want real autocomplete, we'd use Google Places API.
      // For now, let's use Location.geocodeAsync which can return multiple results.
      const results = await Location.geocodeAsync(query);
      if (results && results.length > 0) {
        // We need to reverse geocode them to get readable addresses for the list
        const resultsWithAddress = await Promise.all(
          results.slice(0, 5).map(async (res) => {
            const addr = await Location.reverseGeocodeAsync({
              latitude: res.latitude,
              longitude: res.longitude,
            });
            const item = addr[0];
            const addressStr = `${item.name || ""} ${item.street || ""} ${item.city || ""} ${item.region || ""}`.trim();
            return {
              ...res,
              description: addressStr || `${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`,
            };
          })
        );
        setSearchResults(resultsWithAddress);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((query: string) => fetchAutocomplete(query), 500),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedFetch(text);
  };

  const handleSelectResult = async (item: any) => {
    const coords = {
      latitude: item.latitude,
      longitude: item.longitude,
    };
    setSelectedCoords(coords);
    setMapRegion({
      ...coords,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setSearchQuery(item.description);
    setSearchResults([]);
  };

  const handleUseCurrentLocation = async () => {
    await refreshLocation();
    onClose();
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    
    // Reverse geocode to update search bar
    try {
      const response = await Location.reverseGeocodeAsync(coords);
      if (response.length > 0) {
        const item = response[0];
        const addressStr = `${item.name || ""} ${item.city || ""} ${item.region || ""}`.trim();
        setSearchQuery(addressStr || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (err) {
      setSearchQuery(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  };

  const handleApplyLocation = async () => {
    if (selectedCoords) {
      await manualSetCoords(selectedCoords.latitude, selectedCoords.longitude);
      onClose();
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

          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter city or address"
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
              {isSearching && <ActivityIndicator size="small" color="#28a745" style={styles.searchingLoader} />}
            </View>
            
            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <FlatList
                  data={searchResults}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.resultItem}
                      onPress={() => handleSelectResult(item)}
                    >
                      <Ionicons name="location-outline" size={18} color="#666" />
                      <Text style={styles.resultText} numberOfLines={1}>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.resultsList}
                />
              </View>
            )}
          </View>

          <View style={styles.mapContainer}>
            {mapRegion ? (
              <MapView
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={(region) => setMapRegion(region)}
                onPress={handleMapPress}
              >
                {selectedCoords && (
                  <Marker coordinate={selectedCoords} draggable onDragEnd={(e) => handleMapPress(e)} />
                )}
              </MapView>
            ) : (
              <View style={styles.mapPlaceholder}>
                <ActivityIndicator size="large" color="#28a745" />
                <Text style={{ marginTop: 10 }}>Loading Map...</Text>
              </View>
            )}
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
            style={[styles.applyButton, !selectedCoords && styles.disabledButton]}
            onPress={handleApplyLocation}
            disabled={isLoading || !selectedCoords}
          >
            <Text style={styles.applyButtonText}>Confirm Location</Text>
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
    height: "90%",
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
  searchWrapper: {
    zIndex: 10,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  searchingLoader: {
    marginLeft: 5,
  },
  resultsContainer: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
  },
  resultsList: {
    padding: 5,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
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
    marginTop: 10,
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
