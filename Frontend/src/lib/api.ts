export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const getToken = () => localStorage.getItem('wc_token');
const setToken = (t: string) => localStorage.setItem('wc_token', t);
const clearToken = () => localStorage.removeItem('wc_token');

export const auth = { setToken, clearToken, getToken };

export async function api<T>(
  path: string,
  options: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}
): Promise<T> {
  const method = options.method || 'GET';

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  // ✅ Attach token if it exists
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(path, {
    method,
    headers,
    body: options.body ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
    credentials: "include", // ✅ allow cookies (important if backend uses session cookies)
  });

  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        msg = (data as any)?.error || (data as any)?.message || msg;
      } catch {
        msg = text || msg;
      }
    } catch {}
    throw new Error(msg);
  }

  try {
    return (await res.json()) as T;
  } catch {
    // no content (e.g. 204 No Content)
    return {} as T;
  }
}
