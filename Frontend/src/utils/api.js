// Utility to delete own user account (patient)
// ✅ Correct port
// ✅ Correct port
export async function deleteOwnAccount(token) {
  const res = await fetch("http://localhost:3008/api/auth/me", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete account");
  }
  return await res.json();
}
// Utility to fetch patient profile from backend
export async function fetchPatientProfile(token) {
  const res = await fetch("http://localhost:5003/api/patients/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return await res.json();
}
// Utility to update patient profile in backend
export async function updatePatientProfile(token, profileData) {
  const res = await fetch("http://localhost:5003/api/patients/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return await res.json();
}
// Utility to create patient profile in backend
export async function createPatientProfile(token, profileData) {
  const res = await fetch("http://localhost:5003/api/patients/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  if (!res.ok) throw new Error("Failed to create profile");
  return await res.json();
}
