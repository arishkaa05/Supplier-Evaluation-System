// Базовый адрес сервера. Может быть переопределён через VITE_API_URL.
export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8081/api";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${message}`);
  }
  return res.json() as Promise<T>;
}
