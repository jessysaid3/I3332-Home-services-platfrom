import { apiRequest } from "./http";

export async function fetchAllOfferings() {
  return apiRequest("/offerings");
}

export async function fetchOfferingsWithFilters(filters) {
  return apiRequest("/offerings", {
    method: "POST",
    body: { filters },
  });
}

export async function fetchOfferingAvailableTime(offeringId) {
  return apiRequest(`/offerings/available-time/${offeringId}`);
}

export async function fetchProviderOffers() {
  return apiRequest("/offerings/me");
}

export async function createProviderOffer(offer) {
  return apiRequest("/offerings/me", {
    method: "POST",
    body: { offer },
  });
}

export async function editProviderOffer(offeringId, offer) {
  return apiRequest(`/offerings/${offeringId}`, {
    method: "PATCH",
    body: { offer },
  });
}

export async function deleteProviderOffer(offeringId) {
  return apiRequest(`/offerings/${offeringId}`, {
    method: "DELETE",
  });
}

export async function fetchServices() {
  return apiRequest("/services");
}
