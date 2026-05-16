import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocationContext } from "../../src/contexts/LocationContext";
import { LocationPickerModal } from "../../src/components/LocationPickerModal";
import { AddProductModal } from "../../src/components/AddProductModal";
import { useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const { address } = useLocationContext();
  const { userToken } = useAuth();
  const router = useRouter();
  const [locModalVisible, setLocModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const handleSellPress = (e: any) => {
    if (!userToken) {
      e.preventDefault();
      router.push("/login");
    } else {
      e.preventDefault();
      setAddModalVisible(true);
    }
  };

  return (
    <>
      <Tabs 
        screenOptions={{ 
          tabBarActiveTintColor: "#28a745",
          headerLeft: () => (
            <TouchableOpacity style={styles.headerLocation} onPress={() => setLocModalVisible(true)}>
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
          name="my-products"
          options={{
            title: "My Products",
            tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
          }}
        />
      </Tabs>
      
      <LocationPickerModal 
        visible={locModalVisible} 
        onClose={() => setLocModalVisible(false)} 
      />

      <AddProductModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />
    </>
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
