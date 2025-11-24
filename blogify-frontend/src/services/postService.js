import { API_BASE_URL, fetchWithAuth } from './authService';

export const postService = {
  list: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${API_BASE_URL}/api/posts?${query}`
      : `${API_BASE_URL}/api/posts`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },
  create: async (data, accessToken) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    return response;
  },

  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/slug/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  update: async (id, data, accessToken) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    return response;
  },

  schedule: async (id, scheduledAt, accessToken) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ scheduledAt }),
    });
    return response;
  },
  
  publish: async (id, accessToken) => {
     const response = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  },

  uploadMedia: async (file, accessToken) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    return response.json();
  }
};
