import { apiRequest } from "./http";

export async function fetchCartItems() {
  return apiRequest("/cart");
}

export async function checkoutCart() {
  return apiRequest("/cart/checkout", {
    method: "GET",
  });
}

export async function fetchOrders() {
  return apiRequest("/orders");
}

export async function fetchOrderItems(orderId) {
  return apiRequest(`/orders/${orderId}/items`);
}

export async function cancelOrder(orderId) {
  return apiRequest(`/orders/${orderId}`, {
    method: "DELETE",
  });
}
