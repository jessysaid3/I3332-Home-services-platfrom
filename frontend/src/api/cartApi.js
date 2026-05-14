import { apiRequest } from "./http";

export async function fetchCartItems() {
  return apiRequest("/cart");
}

export async function addCartItem(cartItem) {
  return apiRequest("/cart", {
    method: "POST",
    body: { cartItem },
  });
}

export async function removeCartItem(cartItemId) {
  return apiRequest(`/cart/${cartItemId}`, { method: "DELETE" });
}

export async function editCartItem(cartItemId, cartItem) {
  return apiRequest(`/cart/${cartItemId}`, {
    method: "PATCH",
    body: { cartItem },
  });
}

export async function checkoutCart() {
  return apiRequest("/cart/checkout");
}
