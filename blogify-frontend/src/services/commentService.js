import { API_BASE_URL, fetchWithAuth } from './authService';

export const commentService = {
  // Public: Get comments for a post
  getByPostId: async (postId) => {
    const url = `${API_BASE_URL}/api/post/${postId}/comments?includeReplies=inline`;
    console.log('[commentService.getByPostId] Request URL:', url);

    const response = await fetch(url, { credentials: 'include' });
    console.log('[commentService.getByPostId] status:', response.status);

    if (!response.ok) {
      let body = null;
      try {
        body = await response.json();
      } catch (e) {
        console.log('[commentService.getByPostId] failed to parse error body:', e);
      }
      console.log('[commentService.getByPostId] error body:', body);
      throw new Error('Failed to fetch comments');
    }

    const json = await response.json();
    console.log('[commentService.getByPostId] response JSON:', json);
    return json;
  },

  // Get Comment Tree (Nested) - only approved comments (prune=true)
  getTree: async (postId) => {
    const url = `${API_BASE_URL}/api/comments/tree?postId=${postId}&maxDepth=10&maxNodes=1000&prune=true`;
    const response = await fetchWithAuth(url);
    return response;
  },

  // Public: Create a comment (Authenticated)
  create: async (data) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response;
  },

  // Public: Reply to a comment (Authenticated)
  reply: async (parentId, data) => {
    const payload = { ...data, parentId };
    const response = await fetchWithAuth(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response;
  },

  // Admin/Owner: Delete comment
  delete: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/comments/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  // Vote
  vote: async (id, action) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/comments/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    return response;
  },
  
  // Admin: List all comments
  list: async (params = {}, accessToken = null) => {
    const query = new URLSearchParams(params).toString();
    const options = {};
    if (accessToken) {
      options.headers = { Authorization: `Bearer ${accessToken}` };
    }
    const data = await fetchWithAuth(`${API_BASE_URL}/api/comments?${query}`, options);
    console.log('[commentService.list] response data:', data);
    return data;
  },

  // Admin: Update status
  updateStatus: async (id, status) => {
    const data = await fetchWithAuth(`${API_BASE_URL}/api/comments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    console.log('[commentService.updateStatus] response data:', data);
    return data;
  }
};
