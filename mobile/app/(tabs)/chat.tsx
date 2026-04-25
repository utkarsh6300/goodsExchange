import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useConversations, Conversation } from "../../src/hooks/useConversations";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ConversationListScreen() {
  const router = useRouter();
  const { data: conversations, isLoading, refetch } = useConversations();
  const { userToken } = useAuth(); // In reality, we'd want the decoded userId

  const renderItem = ({ item }: { item: Conversation }) => {
    // Determine the other participant's name
    // For now, just show the first participant that isn't the first one (simple logic for 2 people)
    const otherParticipant = item.participants[0]?.name || "User";

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/chat/${item._id}`)}
      >
        <Text style={styles.name}>{otherParticipant}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || "No messages yet"}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={conversations}
        renderItem={renderItem}
        estimatedItemSize={70}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
  name: { fontSize: 18, fontWeight: "bold" },
  lastMessage: { fontSize: 14, color: "#666" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#999" },
});
