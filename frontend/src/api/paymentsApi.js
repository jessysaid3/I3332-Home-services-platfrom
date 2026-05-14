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

export async function fetchUserPayments() {
  const response = await axios.get(`${API_BASE_URL}/payments`, {
    headers: getAuthHeaders(),
  });
  return response.data || [];
}

export async function makePayment(bodyObject){
  try {
    const response = await axios.post(`${API_BASE_URL}/payments`, 
      bodyObject,
      {
      headers: getAuthHeaders(),
    })
    return response.data;
  } catch (error) {
    console.error('Payment API Error:', error.response?.data || error.message);
    throw error;
  }
}
