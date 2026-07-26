const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

function getToken() {
  return localStorage.getItem('ft_token');
}

async function request(path, { method = 'GET', body, params, isBlob = false } = {}) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.append(key, value);
      }
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    if (!path.includes('/auth/')) {
      window.location.href = '/login';
    }
  }

  if (res.status === 204) return null;

  if (isBlob) {
    if (!res.ok) {
      let errBody = null;
      try {
        errBody = await res.json();
      } catch (_) {}
      throw new ApiError(res.status, errBody);
    }
    return res.blob();
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data;
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  getBlob: (path, params) => request(path, { method: 'GET', params, isBlob: true }),
};

export { ApiError, getToken };
