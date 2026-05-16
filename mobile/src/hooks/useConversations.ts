import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface Conversation {
  _id: string;
  participants: Array<{ _id: string; username: string; name: string }>;
  product: { _id: string; name: string; imagesUrls: string[]; price: number } | null;
  lastMessage: string;
  lastMessageTimestamp: string;
}

const fetchConversations = async (): Promise<Conversation[]> => {
  const response = await api.get("/chat/conversations");
  return response.data;
};

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });
};

export const useConversation = (id: string) => {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async (): Promise<Conversation> => {
      const response = await api.get(`/chat/conversations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
