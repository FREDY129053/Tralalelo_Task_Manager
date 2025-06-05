export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit,
  errorMsg?: string
): Promise<T> {
  if (options) {
    options.credentials = "include";
    options.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`${errorMsg}: ${res.statusText}`);
  }

  if (options?.method !== "DELETE" && options?.method !== "PATCH") {
    return res.json();
  }

  return undefined as T;
}
