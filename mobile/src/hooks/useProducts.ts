import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface Product {
  _id: string;
  name: string;
  title?: string; // Kept for compatibility if used elsewhere
  description?: string;
  price: number;
  category: string;
  subCategory?: string;
  quantity: number;
  imagesUrls: string[];
  owner: string | { _id: string; name: string; username: string };
  address?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: string;
}

const fetchProducts = async (lat?: number, lon?: number): Promise<Product[]> => {
  const response = await api.get("/product/get-all", {
    params: { lat, lon },
  });
  return response.data;
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product> => {
      const response = await api.get(`/product/get/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useProducts = (lat?: number, lon?: number) => {
  return useQuery({
    queryKey: ["products", lat, lon],
    queryFn: () => fetchProducts(lat, lon),
  });
};
