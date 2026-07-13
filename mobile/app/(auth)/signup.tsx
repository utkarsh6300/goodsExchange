import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../src/services/api";
import { Logo } from "../../src/components/Logo";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!username || !name || !phone || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/signup", {
        username,
        name,
        phone,
        password,
      });

      if (response.data.token) {
        await signIn(response.data.token);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      const msg = error.response?.data?.errors?.[0]?.msg || "Signup failed";
      Alert.alert("Signup Error", msg);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Logo size={80} style={styles.logo} />
            <Text style={styles.title}>Join Goods Exchange</Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number (10 digits)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Password (min 6 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => router.push("/login")}>
            <Text style={styles.linkText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: 60,
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
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#28a745" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
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
