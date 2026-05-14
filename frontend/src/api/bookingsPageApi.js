import { apiRequest } from "./http";

export async function fetchUserBookings() {
  return apiRequest("/booking");
}

export async function cancelUserBooking(bookingId) {
  return apiRequest(`/booking/${bookingId}`, { method: "DELETE" });
}
