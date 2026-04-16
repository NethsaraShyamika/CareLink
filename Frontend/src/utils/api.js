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
  const res = await fetch("http://localhost:5002/api/patients/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return await res.json();
}
