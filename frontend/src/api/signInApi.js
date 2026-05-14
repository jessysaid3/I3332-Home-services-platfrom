import { apiRequest } from "./http";

export async function loginWithEmail({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

export async function logout() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export async function fetchProfile() {
  return apiRequest("/profile");
}

export async function updateProfile(newInfo) {
  return apiRequest("/profile", {
    method: "PATCH",
    body: { newInfo },
  });
}
