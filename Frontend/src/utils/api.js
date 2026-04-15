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
