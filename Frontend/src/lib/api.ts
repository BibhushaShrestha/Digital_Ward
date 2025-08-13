export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const getToken = () => localStorage.getItem('wc_token');
const setToken = (t: string) => localStorage.setItem('wc_token', t);
const clearToken = () => localStorage.removeItem('wc_token');

export const auth = { setToken, clearToken, getToken };

export async function api<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}): Promise<T> {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data?.error || data?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  try {
    return (await res.json()) as T;
  } catch {
    // no content
    return {} as T;
  }
}
