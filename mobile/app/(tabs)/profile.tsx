import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import api from "../../src/services/api";

export default function ProfileScreen() {
  const { userToken, signOut } = useAuth();
  const router = useRouter();

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["me", userToken],
    queryFn: async () => {
      console.log("Fetching profile with token:", userToken);
      try {
        const response = await api.get("/user/me");
        console.log("Profile data received:", response.data);
        return response.data;
      } catch (err: any) {
        console.error("Profile fetch error:", err.response?.data || err.message);
        throw err;
      }
    },
    enabled: !!userToken,
  });

  if (!userToken) {
    // ... rest unchanged
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={100} color="#ccc" />
          <Text style={styles.title}>Welcome to Goods Exchange</Text>
          <Text style={styles.subtitle}>Log in to manage your products and chats</Text>
        </View>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Log In / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <Ionicons name="person-circle" size={80} color="#28a745" />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userStatus}>@{user?.username || "username"}</Text>
            {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Activity</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="list" size={24} color="#333" />
            <Text style={styles.menuText}>My Products</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="heart-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Favorites</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Account Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#dc3545" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileInfo: {
    marginLeft: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  userStatus: {
    fontSize: 14,
    color: "#28a745",
    marginTop: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  section: {
    width: "100%",
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 15,
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#dc3545",
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
