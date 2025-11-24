export const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:4000";
const API_AUTH_BASE = `${API_BASE_URL}/api/auth`;

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || "An error occurred while processing the request.";
    throw {
      success: false,
      message,
      code: data.code,
      status: response.status
    };
  }

  return data;
};

// Helper to perform requests with auto-refresh
export const fetchWithAuth = async (url, options = {}) => {
  const headers = { ...options.headers };
  
  // Make request
  let response = await fetch(url, { ...options, headers, credentials: "include" });

  // If 401, try refresh
  if (response.status === 401) {
    try {
      // Call refresh endpoint (sends cookie)
      const refreshRes = await fetch(`${API_AUTH_BASE}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        
        // Retry original request with new token
        headers.Authorization = `Bearer ${accessToken}`;
        response = await fetch(url, { ...options, headers, credentials: "include" });
        
        // Return response and NEW TOKEN so caller can update state if needed
        // (Ideally, we'd update a global state store here, but service is stateless.
        // We can attach the new token to the response object/data for the Context to pick up?
        // Or simpler: Context should handle the retry? No, service is better for encapsulation.
        // We can throw a specific error that Context catches to update token?
        // Actually, since we don't have access to Context's `setToken` here...
        // We can rely on the fact that the *next* request by Context will use the token? 
        // Wait, `fetchWithAuth` injects the token? 
        // Current implementation: `getCurrentUser` takes `accessToken` arg.
        // If we retry, we use the new token. 
        // But the `AuthContext` state `token` will be stale!
        // This is tricky without a singleton store or interceptor library.
        // Basic solution: Just retry for this request to succeed. 
        // Subsequent requests might fail again and trigger refresh again (inefficient).
        // Better: Return { data, newAccessToken }?
        // Let's keep it simple: Retry the request. The user will get their data.
        // Context polling or next action will eventually need to refresh or we rely on this mechanism for every call.
      }
    } catch (err) {
      // Refresh failed, let original 401 propagate
    }
  }

  return handleResponse(response);
};

export const authService = {
  login: async (credentials) => {
    const response = await fetch(`${API_AUTH_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Important: include credentials to accept the Set-Cookie header
      credentials: "include",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const result = await handleResponse(response);

    // Backend now sets HttpOnly cookie for refreshToken
    // We only get accessToken in the body
    const user = result.user || null;

    return {
      success: true,
      user,
      token: result.token, // Access token
      message: "Login successful!",
    };
  },

  register: async (userData) => {
    const response = await fetch(`${API_AUTH_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        username: userData.username,
        password: userData.password,
      }),
    });

    const result = await handleResponse(response);

    const user = result.user || null;

    return {
      success: true,
      user,
      token: result.token, // Access Token
      message: "Registration successful! You can now log in.",
    };
  },

  logout: async (accessToken) => {
    // Use fetchWithAuth to ensure we can logout even if access token is expired (if we wanted)
    // But for logout, if token is expired, we just want to clear cookie.
    // So standard fetch is fine, but let's use the base logout.
    const response = await fetch(`${API_AUTH_BASE}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
      },
      credentials: "include",
    });

    const result = await handleResponse(response);

    return {
      success: true,
      message: result.message || "Logged out successfully.",
      code: result.code,
    };
  },

  refreshToken: async () => {
    // No body needed, cookie is sent automatically via credentials: "include"
    const response = await fetch(`${API_AUTH_BASE}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await handleResponse(response);

    return {
      success: true,
      accessToken: data.accessToken,
    };
  },

  getCurrentUser: async (accessToken) => {
    // Use fetchWithAuth to handle auto-refresh on 401
    return fetchWithAuth(`${API_BASE_URL}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(data => ({
      success: true,
      user: data,
    }));
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_AUTH_BASE}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await handleResponse(response);
    return {
      success: true,
      message: result.message,
    };
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_AUTH_BASE}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const result = await handleResponse(response);
    return {
      success: true,
      message: result.message,
    };
  },

  updateProfile: async (accessToken, userData) => {
    return fetchWithAuth(`${API_BASE_URL}/api/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    }).then(data => ({
      success: true,
      user: data,
    }));
  },

  uploadImage: async (accessToken, file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Use raw fetch or handle headers carefully. 
    // Content-Type must NOT be set manually for FormData.
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      credentials: "include",
    });

    // Basic error handling without auto-refresh for now (or duplicate logic)
    const data = await handleResponse(response);
    return data;
  },
};
