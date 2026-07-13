import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface UserProfile {
  _id: string;
  username: string;
  name?: string;
  phone: string;
  isVerified: boolean;
  avatarUrl?: string;
}

const fetchMe = async (): Promise<UserProfile> => {
  const response = await api.get("/user/me");
  return response.data;
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
