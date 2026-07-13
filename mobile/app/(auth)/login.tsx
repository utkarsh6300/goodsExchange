import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../src/services/api";
import { Logo } from "../../src/components/Logo";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter both phone number and password");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/login", {
        phone,
        password,
      });

      if (response.data.token) {
        await signIn(response.data.token);
        // After login, we usually want to go to the tabs. 
        // If we came from a push(), replace it so user can't "back" into login.
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      const msg = error.response?.data?.errors?.[0]?.msg || "Login failed";
      Alert.alert("Login Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Always replace with tabs to break any loops and return to home
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleClose}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Logo size={80} style={styles.logo} />
          <Text style={styles.title}>Goods Exchange</Text>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => router.push("/signup")}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: "center", 
    backgroundColor: "#fff",
    position: "relative"
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    marginBottom: 10,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 40, textAlign: "center", color: "#28a745" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#94d3a2",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#007bff",
    fontSize: 16,
  },
});
