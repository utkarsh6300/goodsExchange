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
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { useLocationContext } from "../contexts/LocationContext";
import * as Location from "expo-location";
import Constants from "expo-constants";

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationPickerModal = ({ visible, onClose }: LocationPickerModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { location, address, refreshLocation, isLoading, manualSetCoords } = useLocationContext();
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);
  const searchTimeout = useRef<any>(null);

  const YOUR_GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.YOUR_GOOGLE_MAPS_API_KEY;

  // Initialize marker from current location
  useEffect(() => {
    if (visible && location?.coords) {
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setSelectedCoords(coords);
      if (address && searchQuery === "") {
        setSearchQuery(address);
      }

      if (isMapReady) {
        animateTo(coords.latitude, coords.longitude);
      }
    }
  }, [visible, location, address, isMapReady]);

  const animateTo = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

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
        console.warn("[LocationPickerModal] No valid Google Maps API Key found.");
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

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (text.length >= 3) {
      searchTimeout.current = setTimeout(() => {
        fetchAutocomplete(text);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = async (item: any) => {
    Keyboard.dismiss();
    setSearchResults([]);
    setSearchQuery(item.description);
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
        animateTo(lat, lng);
      }
    } catch (error) {
      console.error("[LocationPickerModal] Place Details error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    Keyboard.dismiss();
    setIsSearching(true);
    await refreshLocation();
    setIsSearching(false);
    // Modal will close via useEffect if needed, but here we want to let user see it
  };

  const handleMapPress = async (e: any) => {
    Keyboard.dismiss();
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    updateAddressFromCoords(coords);
  };

  const updateAddressFromCoords = async (coords: { latitude: number; longitude: number }) => {
    try {
      const response = await Location.reverseGeocodeAsync(coords);
      if (response.length > 0) {
        const item = response[0];
        const addressStr = [item.name, item.city, item.region]
          .filter(Boolean)
          .join(" ");
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Select Location</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Search city or address..."
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  clearButtonMode="while-editing"
                  placeholderTextColor="#999"
                />
                {isSearching && <ActivityIndicator size="small" color="#28a745" style={styles.loader} />}
              </View>

              {searchResults.length > 0 && (
                <View style={styles.resultsWrapper}>
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
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                  />
                </View>
              )}
            </View>

            <View style={styles.mapWrapper}>
              <MapView
                ref={mapRef}
                style={styles.map}
                onPress={handleMapPress}
                onMapReady={() => setIsMapReady(true)}
                showsUserLocation={true}
                showsMyLocationButton={false}
                initialRegion={location?.coords ? {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                } : undefined}
              >
                {selectedCoords && (
                  <Marker
                    coordinate={selectedCoords}
                    draggable
                    onDragEnd={(e) => {
                      const newCoords = e.nativeEvent.coordinate;
                      setSelectedCoords(newCoords);
                      updateAddressFromCoords(newCoords);
                    }}
                    pinColor="#28a745"
                  />
                )}
              </MapView>

              {!isMapReady && (
                <View style={styles.mapLoading}>
                  <ActivityIndicator size="large" color="#28a745" />
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.currentLocationBtn}
                onPress={handleUseCurrentLocation}
                disabled={isLoading}
              >
                <Ionicons name="locate" size={22} color="#28a745" />
                <Text style={styles.currentLocationText}>Use My Current Location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.applyBtn, !selectedCoords && styles.disabledBtn]}
                onPress={handleApplyLocation}
                disabled={!selectedCoords || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.applyBtnText}>Confirm Location</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    height: "90%",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    zIndex: 1000,
    marginBottom: 15,
    position: "relative",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e4e8",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loader: {
    marginLeft: 10,
  },
  resultsWrapper: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#444",
    flex: 1,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    gap: 12,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  currentLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#28a745",
    fontWeight: "600",
  },
  applyBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledBtn: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
});

