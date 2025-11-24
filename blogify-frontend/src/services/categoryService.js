import { API_BASE_URL } from './authService';

export const categoryService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  getTree: async () => {
    const response = await fetch(`${API_BASE_URL}/api/categories/tree`);
    if (!response.ok) throw new Error('Failed to fetch category tree');
    return response.json();
  },

  getSelectList: async () => {
    const response = await fetch(`${API_BASE_URL}/api/categories/select-list`);
    if (!response.ok) throw new Error('Failed to fetch categories list');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  delete: async (id, force = false) => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}?force=${force}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return true;
  },

  migrate: async (id, tagId) => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId }),
    });
    if (!response.ok) throw new Error('Failed to migrate category');
    return response.json();
  }
};
