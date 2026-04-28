const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const createError = async (response) => {
  let message = "Request failed";

  try {
    const data = await response.json();
    message = data.message || message;
  } catch {
    message = response.statusText || message;
  }

  const error = new Error(message);
  error.status = response.status;
  return error;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw await createError(response);
  }

  return response.json();
};

export const api = {
  get: (path, options = {}) => request(path, { method: "GET", ...options }),
  post: (path, body, options = {}) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...options
    }),
  put: (path, body, options = {}) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options
    }),
  patch: (path, body, options = {}) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options
    }),
  delete: (path, options = {}) => request(path, { method: "DELETE", ...options })
};
