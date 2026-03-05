// ============================================================
// API Client — Centralized config for backend API calls
// ============================================================

export const API_BASE = "https://kaigig-backend.onrender.com";

/**
 * Fetch wrapper with base URL and default headers.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}
