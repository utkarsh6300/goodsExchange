import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { useLocationContext } from "../contexts/LocationContext";
import * as Location from "expo-location";
// @ts-ignore
import { YOUR_GOOGLE_MAPS_API_KEY } from "@env";

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
  const { location, address, refreshLocation, isLoading, manualSetCoords } = useLocationContext();
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Initialize marker from current location
  useEffect(() => {
    if (visible && location?.coords) {
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setSelectedCoords(coords);
      if (address) {
        setSearchQuery(address);
      }

      // Initial animation to current location
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }, 500);
    }
  }, [visible, location, address]);

  // Handle autocomplete using Google Places API
  const fetchAutocomplete = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const apiKey = YOUR_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
        console.warn("[LocationPickerModal] No Google Maps API Key found. Autocomplete disabled.");
        setIsSearching(false);
        return;
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${apiKey}&types=address`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        setSearchResults(data.predictions.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("[LocationPickerModal] Autocomplete error:", error);
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
    Keyboard.dismiss();
    setIsSearching(true);
    try {
      const apiKey = YOUR_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${apiKey}&fields=geometry`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        const coords = { latitude: lat, longitude: lng };

        setSelectedCoords(coords);
        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);

        setSearchQuery(item.description);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("[LocationPickerModal] Place Details error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    console.log("[LocationPickerModal] Using current location...");
    await refreshLocation();
    onClose();
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);

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
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="Search city or address..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoFocus={true}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && Platform.OS === 'android' && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#ccc" />
                </TouchableOpacity>
              )}
              {isSearching && <ActivityIndicator size="small" color="#28a745" style={styles.searchingLoader} />}
            </View>

            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.place_id}
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
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            )}
          </View>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              {selectedCoords && (
                <Marker
                  coordinate={selectedCoords}
                  draggable
                  onDragEnd={(e) => handleMapPress(e)}
                  pinColor="#28a745"
                />
              )}
            </MapView>

            {/* Overlay if loading */}
            {!selectedCoords && (
              <View style={styles.mapPlaceholder}>
                <ActivityIndicator size="large" color="#28a745" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading map...</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
              disabled={isLoading}
            >
              <Ionicons name="locate" size={22} color="#28a745" />
              <Text style={styles.currentLocationText}>Use My Current Location</Text>
              {isLoading && <ActivityIndicator size="small" color="#28a745" style={{ marginLeft: 10 }} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.applyButton, !selectedCoords && styles.disabledButton]}
              onPress={handleApplyLocation}
              disabled={isLoading || !selectedCoords}
            >
              <Text style={styles.applyButtonText}>Confirm & Set Location</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    height: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  searchWrapper: {
    zIndex: 100,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eef2f6",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  searchingLoader: {
    marginLeft: 10,
  },
  resultsContainer: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: "#eee",
  },
  resultsList: {
    padding: 5,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  resultText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#444",
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 249, 250, 0.8)",
    zIndex: 10,
  },
  footer: {
    marginTop: "auto",
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    justifyContent: 'center',
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
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#c2e5cb",
    shadowOpacity: 0,
    elevation: 0,
  },
});
