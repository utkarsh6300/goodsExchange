import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    params: { lat, lon, radius: lat && lon ? 50 : undefined },
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

export const useMyProducts = () => {
  return useQuery({
    queryKey: ["my-products"],
    queryFn: async (): Promise<Product[]> => {
      const response = await api.get("/product/my-products");
      return response.data;
    },
  });
};

export const useSaveProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/product/save", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/product/update/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
};

export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/product/update-quantity/${id}`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
};
