import axios from "axios";
import { getStoredToken } from "./http";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://backend.universalsoftwaresolutions.com/api/v1";

function getAuthHeaders() {
  const token =
    // localStorage.getItem("authToken") ||
    // sessionStorage.getItem("authToken") ||
    getStoredToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUserOrders() {
  const response = await axios.get(`${API_BASE_URL}/orders`, {
    headers: getAuthHeaders(),
  });
  return response.data || [];
}

export async function cancelUserOrder(orderId) {
  const response = await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function fetchOrderItems(orderId) {
  const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/items`, {
    headers: getAuthHeaders(),
  });
  return response.data || [];
}

export async function payOrder(paymentInfo) {
  const payload = {
    info: paymentInfo,
  };

  const response = await axios.post(`${API_BASE_URL}/payments`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}
