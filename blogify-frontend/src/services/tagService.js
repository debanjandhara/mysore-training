import { API_BASE_URL } from './authService';

export const tagService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tags`);
    if (!response.ok) throw new Error('Failed to fetch tags');
    return response.json();
  },

  getSelectList: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tags/select-list`);
    if (!response.ok) throw new Error('Failed to fetch tags list');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create tag');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update tag');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/tags/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete tag');
    return true;
  },

  migrate: async (id, categoryId) => {
    const response = await fetch(`${API_BASE_URL}/api/tags/${id}/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId }),
    });
    if (!response.ok) throw new Error('Failed to migrate tag');
    return response.json();
  }
};
