const API_BASE_URL = "http://localhost:8081/api";

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorMessage = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      throw new Error(
        typeof errorMessage === "string"
          ? errorMessage
          : errorMessage.message || `GET ${endpoint} failed`
      );
    }

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorMessage = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      throw new Error(
        typeof errorMessage === "string"
          ? errorMessage
          : errorMessage.message || `POST ${endpoint} failed`
      );
    }

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  },

  put: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorMessage = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      throw new Error(
        typeof errorMessage === "string"
          ? errorMessage
          : errorMessage.message || `PUT ${endpoint} failed`
      );
    }

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorMessage = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      throw new Error(
        typeof errorMessage === "string"
          ? errorMessage
          : errorMessage.message || `DELETE ${endpoint} failed`
      );
    }

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  },
};