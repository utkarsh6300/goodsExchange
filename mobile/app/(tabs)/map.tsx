import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useLocation } from "../../src/hooks/useLocation";
import { useProducts } from "../../src/hooks/useProducts";

export default function MapScreen() {
  const router = useRouter();
  const { location, getLocation, errorMsg, isLoading: isLocLoading } = useLocation();
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    // Only call if we don't have a location yet
    if (!location) {
      getLocation();
    }
  }, []);

  useEffect(() => {
    if (location && !region) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [location]);

  const { data: products, isLoading: isProdLoading } = useProducts(
    region?.latitude,
    region?.longitude
  );

  if (errorMsg && !location) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Location Error</Text>
        <Text style={{ textAlign: "center", margin: 20 }}>{errorMsg}</Text>
      </View>
    );
  }

  if (!region || (isProdLoading && !products)) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 10 }}>
          {isLocLoading ? "Locating..." : "Loading Map & Products..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
      >
        {products && products.length > 0 && products.map((product) => (
          <Marker
            key={product._id}
            coordinate={{
              latitude: product.location.coordinates[1],
              longitude: product.location.coordinates[0],
            }}
            title={product.title}
            onCalloutPress={() =>
              router.push({
                pathname: "/product/[id]",
                params: { id: product._id },
              })
            }
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc3545",
  },
});
