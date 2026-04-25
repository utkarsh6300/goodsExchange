import React, { useEffect, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import socketService from "../../src/services/socketService";
import { useLocalSearchParams } from "expo-router";
import { useChat } from "../../src/hooks/useChat";
import { useQueryClient } from "@tanstack/react-query";
import { useConversation } from "../../src/hooks/useConversations";
import { ActivityIndicator, View } from "react-native";

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams();
  const idStr = Array.isArray(conversationId) ? conversationId[0] : conversationId;
  const { messages, sendMessage, isLoading: isChatLoading } = useChat(idStr);
  const { data: conversation, isLoading: isConvLoading } = useConversation(idStr);
  const queryClient = useQueryClient();

  // Mocking the current logged-in user
  const currentUser = { _id: "1", name: "Me" };

  // Find the receiver (the other participant)
  const receiverId = conversation?.participants.find(p => p._id !== currentUser._id)?._id;

  useEffect(() => {
    socketService.connect();

    if (socketService.socket && idStr) {
      socketService.socket.emit("joinRoom", idStr);

      socketService.socket.on("newMessage", (message: any) => {
        // Transform backend message to GiftedChat format
        const formattedMsg: IMessage = {
          _id: message._id,
          text: message.text,
          createdAt: new Date(message.timestamp),
          user: {
            _id: message.sender._id,
            name: message.sender.name || message.sender.username,
          },
        };

        // Manually update the cache when a new message arrives via socket
        queryClient.setQueryData<IMessage[]>(["messages", idStr], (old) => 
          old ? [formattedMsg, ...old] : [formattedMsg]
        );
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [idStr]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (idStr && receiverId) {
        sendMessage({
          conversationId: idStr,
          receiverId: receiverId,
          text: newMessages[0].text,
        });

        // Also emit via socket for real-time delivery to other side
        if (socketService.socket) {
          socketService.socket.emit("sendMessage", {
            conversationId: idStr,
            sender: currentUser._id,
            receiver: receiverId,
            text: newMessages[0].text,
            timestamp: new Date(),
          });
        }
      }
    },
    [idStr, receiverId, sendMessage]
  );

  if (isConvLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(msgs) => onSend(msgs)}
      user={currentUser}
      renderLoading={() => <ActivityIndicator size="large" color="#28a745" />}
      isLoadingEarlier={isChatLoading}
    />
  );
}
