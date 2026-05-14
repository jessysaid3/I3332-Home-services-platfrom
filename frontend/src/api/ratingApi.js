import { apiRequest } from "./http";

export async function fetchUserBookings() {
  return apiRequest("/booking");
}

export async function getReviewByBookingId(bookingId) {
  return apiRequest(`/reviews/booking/${bookingId}`, { auth: false });
}

export async function createBookingReview({ booking_id, rating, note }) {
  return apiRequest("/reviews", {
    method: "POST",
    body: { booking_id, rating, note },
  });
}
