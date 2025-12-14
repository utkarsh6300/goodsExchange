import api from "./api";

export const saveProduct = (formData) => {
  return api.post("/product/save", formData);
};

export const getAllProducts = (lat, lon, radius) => {
  let url = "/product/get-all";
  if (lat && lon && radius) {
    url += `?lat=${lat}&lon=${lon}&radius=${radius}`;
  }
  return api.get(url);
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
