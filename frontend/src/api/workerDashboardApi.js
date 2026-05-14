import { apiRequest } from "./http";

export async function fetchProviderBookingRequests() {
  return apiRequest("/booking/pending");
}

export async function fetchProviderBookings() {
  return apiRequest("/booking/provider");
}

export async function acceptProviderBooking(bookingId) {
  return apiRequest(`/booking/${bookingId}/accept`);
}

export async function rejectProviderBooking(bookingId) {
  return apiRequest(`/booking/${bookingId}/reject`, { method: "DELETE" });
}

export async function fetchManualBusySlots() {
  return apiRequest("/provider/me/busy-slots/manual");
}

export async function createManualBusySlot(startAt, endAt) {
  return apiRequest("/provider/me/busy-slots", {
    method: "POST",
    body: {
      start_at: startAt,
      end_at: endAt,
    },
  });
}

export async function deleteManualBusySlot(slotId) {
  return apiRequest(`/provider/me/busy-slots/${slotId}`, {
    method: "DELETE",
  });
}
