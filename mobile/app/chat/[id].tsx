import React, { useEffect, useCallback } from "react";
import { GiftedChat, IMessage, Message, MessageProps } from "react-native-gifted-chat";
import socketService from "../../src/services/socketService";
import { useLocalSearchParams } from "expo-router";
import { useChat } from "../../src/hooks/useChat";
import { useQueryClient } from "@tanstack/react-query";
import { useConversation } from "../../src/hooks/useConversations";
import { useMe } from "../../src/hooks/useMe";
import { ActivityIndicator, View, KeyboardAvoidingView, Platform } from "react-native";

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams();
  const idStr = Array.isArray(conversationId) ? conversationId[0] : conversationId;
  
  const { data: currentUser, isLoading: isMeLoading } = useMe();
  const { messages, isLoading: isChatLoading, addOptimisticMessage } = useChat(idStr);
  const { data: conversation, isLoading: isConvLoading } = useConversation(idStr);
  const queryClient = useQueryClient();

  // Find the receiver (the other participant)
  const receiverId = conversation?.participants.find(p => p._id !== currentUser?._id)?._id;

  useEffect(() => {
    const setupSocket = async () => {
      await socketService.connect();
      if (socketService.socket && idStr) {
        socketService.joinRoom(idStr);

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

          // Update the cache:
          // If it's from the current user, we want to replace the "temp-" message
          // If it's from someone else, we just add it.
          queryClient.setQueryData<IMessage[]>(["messages", idStr], (old) => {
            if (!old) return [formattedMsg];
            
            // Check if we already have this message (by _id)
            if (old.some(m => m._id === formattedMsg._id)) return old;

            // If it's our own message, find and replace the optimistic one
            if (message.sender._id === currentUser?._id) {
              const tempIndex = old.findIndex(m => 
                m._id.toString().startsWith("temp-") && m.text === formattedMsg.text
              );
              if (tempIndex !== -1) {
                const newMessages = [...old];
                newMessages[tempIndex] = formattedMsg;
                return newMessages;
              }
            }

            // Otherwise, just add it to the top (newest first)
            return [formattedMsg, ...old];
          });
        });

        socketService.socket.on("messageError", (error: string) => {
          console.error("Chat message error:", error);
        });

        socketService.socket.on("connect_error", (err: any) => {
          console.error("Socket connection error in ChatScreen:", err.message);
        });
      }
    };

    setupSocket();

    return () => {
      if (idStr) {
        socketService.leaveRoom(idStr);
      }
      if (socketService.socket) {
        socketService.socket.off("newMessage");
      }
      socketService.disconnect();
    };
  }, [idStr, currentUser?._id, queryClient]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const text = newMessages[0].text;
      if (idStr && receiverId && currentUser) {
        // 1. Add optimistic message to UI
        addOptimisticMessage(text);

        // 2. Emit via socket for real-time delivery and persistence
        if (socketService.socket) {
          socketService.socket.emit("sendMessage", {
            conversationId: idStr,
            sender: currentUser._id,
            receiver: receiverId,
            text: text,
            timestamp: new Date(),
          });
        }
      }
    },
    [idStr, receiverId, currentUser, addOptimisticMessage]
  );

  if (isConvLoading || isMeLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  const giftedChatUser = currentUser ? {
    _id: currentUser._id,
    name: currentUser.name || currentUser.username,
  } : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={giftedChatUser}
        messageIdGenerator={() => Math.random().toString(36).substring(2, 15)}
        renderLoading={() => <ActivityIndicator size="large" color="#28a745" />}
        renderMessage={(props: MessageProps<IMessage>) => {
          // React 19 fix: explicitly pass key instead of spreading it
          const { key, ...rest } = props as any;
          return <Message key={key} {...rest} />;
        }}
        isLoadingEarlier={isChatLoading}
        placeholder="Type a message..."
        alwaysShowSend
        scrollToBottom
      />
      {Platform.OS === "android" && <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={80} />}
    </View>
  );
}
