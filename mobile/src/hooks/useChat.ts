import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { IMessage } from "react-native-gifted-chat";

const fetchMessages = async (conversationId: string): Promise<IMessage[]> => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`);
  // Transform backend messages to GiftedChat format if needed
  return response.data.map((msg: any) => ({
    _id: msg._id,
    text: msg.text,
    createdAt: new Date(msg.timestamp),
    user: {
      _id: msg.sender._id,
      name: msg.sender.name || msg.sender.username,
    },
  }));
};

const sendMessage = async ({
  conversationId,
  receiverId,
  text,
}: {
  conversationId: string;
  receiverId: string;
  text: string;
}) => {
  const response = await api.post(`/chat/messages`, { conversationId, receiverId, text });
  return response.data;
};

export const useChat = (conversationId: string) => {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
  });

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onMutate: async (variables) => {
      // Cancel refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<IMessage[]>(["messages", conversationId]);

      // Optimistically update to the new value
      const newMessage: IMessage = {
        _id: Math.random().toString(),
        text: variables.text,
        createdAt: new Date(),
        user: { _id: 1, name: "Me" }, // Use actual user info in reality
      };

      if (previousMessages) {
        queryClient.setQueryData<IMessage[]>(["messages", conversationId], [
          newMessage,
          ...previousMessages,
        ]);
      }

      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", conversationId], context.previousMessages);
      }
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMutation.mutate,
  };
};
