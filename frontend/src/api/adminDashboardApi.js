import { apiRequest } from "./http";

export async function fetchAdminUsers() {
  return apiRequest("/admin/users?limit=200");
}

export async function fetchAdminServices() {
  return apiRequest("/admin/services?limit=200");
}

export async function updateUserStatus(userId, status) {
  return apiRequest(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function createService(name) {
  return apiRequest("/admin/services", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateService(serviceId, name) {
  return apiRequest(`/admin/services/${serviceId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteService(serviceId) {
  return apiRequest(`/admin/services/${serviceId}`, {
    method: "DELETE",
  });
}
