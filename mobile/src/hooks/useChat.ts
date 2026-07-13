import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { IMessage } from "react-native-gifted-chat";
import { useMe } from "./useMe";

const fetchMessages = async (conversationId: string): Promise<IMessage[]> => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`);
  // Transform backend messages to GiftedChat format
  // Backend returns them in chronological order (oldest first), 
  // GiftedChat expects reverse chronological (newest first) for its default list.
  return response.data.map((msg: any) => ({
    _id: msg._id,
    text: msg.text,
    createdAt: new Date(msg.timestamp),
    user: {
      _id: msg.sender._id,
      name: msg.sender.name || msg.sender.username,
    },
  })).reverse();
};

export const useChat = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
  });

  const addOptimisticMessage = (text: string) => {
    if (!me) return;

    const newMessage: IMessage = {
      _id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      text: text,
      createdAt: new Date(),
      user: {
        _id: me._id,
        name: me.name || me.username,
      },
    };

    queryClient.setQueryData<IMessage[]>(["messages", conversationId], (old) => 
      old ? [newMessage, ...old] : [newMessage]
    );

    return newMessage;
  };

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    addOptimisticMessage,
  };
};
