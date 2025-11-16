import api from "./api";

export const saveProduct = (formData) => {
  return api.post("/product/save", formData);
};

export const getAllProducts = () => {
  return api.get("/product/get-all");
};

export const getMyProducts = () => {
  return api.get("/product/my-products");
};

export const getProductById = (productId) => {
  return api.get(`/product/get/${productId}`);
};

export default {
  saveProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
};
