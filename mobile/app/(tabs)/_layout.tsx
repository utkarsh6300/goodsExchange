import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocationContext } from "../../src/contexts/LocationContext";

export default function TabLayout() {
  const { address, refreshLocation } = useLocationContext();

  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: "#28a745",
        headerLeft: () => (
          <TouchableOpacity style={styles.headerLocation} onPress={refreshLocation}>
            <Ionicons name="location" size={18} color="#28a745" />
            <Text style={styles.locationText} numberOfLines={1}>
              {address || "Locating..."}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#666" />
          </TouchableOpacity>
        ),
        headerTitle: "", 
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Ionicons name="map" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Sell",
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLocation: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    maxWidth: 250,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 5,
  },
});
