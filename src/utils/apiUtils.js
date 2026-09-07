import API_URL, { bypassHeaders } from "../apiConfig";

export const fetchWithBypass = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const headers = {
    ...bypassHeaders,
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
