const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOpts } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOpts,
    headers,
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data.data;
}

export function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}
