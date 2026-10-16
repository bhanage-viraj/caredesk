const API_BASE = "/api/appointments";

async function request(path = "", options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.priority) query.set("priority", params.priority);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request(suffix);
  },
  stats: () => request("/stats"),
  create: (payload) =>
    request("", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    request(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id) =>
    request(`/${id}`, {
      method: "DELETE",
    }),
};
