import api from "./api";

export const sendVerificationCode = (phone) => {
  return api.post("/verify/send-verification-code", {
    phone,
  });
};

export const verifyCode = (phone, code) => {
  return api.post("/verify/verify-code", {
    phone,
    code,
  });
};

export default {
  sendVerificationCode,
  verifyCode,
};
