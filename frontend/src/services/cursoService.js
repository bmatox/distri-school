import { api } from './api';

/**
 * Service for interacting with the Cursos API
 */
export const cursoService = {
  /**
   * Get all courses
   */
  async getAll() {
    return api.get('/cursos');
  },

  /**
   * Get course by ID
   */
  async getById(id) {
    return api.get(`/cursos/${id}`);
  },

  /**
   * Create a new course
   */
  async create(cursoData) {
    return api.post('/cursos', cursoData);
  },

  /**
   * Update a course
   */
  async update(id, cursoData) {
    return api.put(`/cursos/${id}`, cursoData);
  },

  /**
   * Delete a course
   */
  async delete(id) {
    return api.delete(`/cursos/${id}`);
  }
};
