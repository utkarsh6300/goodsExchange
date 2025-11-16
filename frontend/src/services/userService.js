import api from "./api";

export const getPhoneNumber = (userId) => {
  return api.get(`/user/get-number/${userId}`);
};

export default {
  getPhoneNumber,
};
