import { api } from './api';

/**
 * Service for Professor operations
 */
export const professorService = {
  /**
   * Get all professors (paginated)
   */
  async getAll() {
    const data = await api.get('/v1/professores');
    return data.content || [];
  },

  /**
   * Get a single professor by ID
   */
  async getById(id) {
    return await api.get(`/v1/professores/${id}`);
  },

  /**
   * Create a new professor
   */
  async create(professor) {
    return await api.post('/v1/professores', professor);
  },

  /**
   * Update an existing professor
   */
  async update(id, professor) {
    return await api.put(`/v1/professores/${id}`, professor);
  },

  /**
   * Delete a professor
   */
  async delete(id) {
    return await api.delete(`/v1/professores/${id}`);
  },
};
