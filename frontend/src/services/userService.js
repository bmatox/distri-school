import { api } from './api';

/**
 * Service for User operations
 */
export const userService = {
  /**
   * Get all users (paginated)
   */
  async getAll() {
    const data = await api.get('/users');
    // Handle both paginated and non-paginated responses
    return data.content || data || [];
  },

  /**
   * Get a single user by ID
   */
  async getById(id) {
    return await api.get(`/users/${id}`);
  },

  /**
   * Create a new user
   */
  async create(user) {
    return await api.post('/users', user);
  },

  /**
   * Update an existing user
   */
  async update(id, user) {
    return await api.put(`/users/${id}`, user);
  },

  /**
   * Delete a user
   */
  async delete(id) {
    return await api.delete(`/users/${id}`);
  },
};
