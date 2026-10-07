const API_BASE_URL = "http://localhost:8081/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response, endpoint, method) => {
  const contentType =
    response.headers.get("content-type") || "";

  if (!response.ok) {
    const errorMessage = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    throw new Error(
      typeof errorMessage === "string"
        ? errorMessage
        : errorMessage.message ||
            `${method} ${endpoint} failed`
    );
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const api = {
  // =========================================================
  // GET
  // =========================================================

  get: async (endpoint) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return handleResponse(
      response,
      endpoint,
      "GET"
    );
  },

  // =========================================================
  // DOWNLOAD FILE
  // =========================================================

  download: async (endpoint) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      const contentType =
        response.headers.get("content-type") || "";

      const errorMessage =
        contentType.includes("application/json")
          ? await response.json()
          : await response.text();

      throw new Error(
        typeof errorMessage === "string"
          ? errorMessage
          : errorMessage.message ||
              "Download failed"
      );
    }

    return response.blob();
  },

  // =========================================================
  // POST
  // =========================================================

  post: async (endpoint, data) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      }
    );

    return handleResponse(
      response,
      endpoint,
      "POST"
    );
  },

  // =========================================================
  // PUT
  // =========================================================

  put: async (endpoint, data) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      }
    );

    return handleResponse(
      response,
      endpoint,
      "PUT"
    );
  },

  // =========================================================
  // DELETE
  // =========================================================

  delete: async (endpoint) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return handleResponse(
      response,
      endpoint,
      "DELETE"
    );
  },
};