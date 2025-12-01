import { api } from './api';

/**
 * Service for interacting with the Turmas API
 */
export const turmaService = {
  /**
   * Get all turmas
   */
  async getAll() {
    return api.get('/turmas');
  },

  /**
   * Get turma by ID
   */
  async getById(id) {
    return api.get(`/turmas/${id}`);
  },

  /**
   * Get turmas by course
   */
  async getByCurso(cursoId) {
    return api.get(`/turmas/curso/${cursoId}`);
  },

  /**
   * Create a new turma
   */
  async create(turmaData) {
    return api.post('/turmas', turmaData);
  },

  /**
   * Update a turma
   */
  async update(id, turmaData) {
    return api.put(`/turmas/${id}`, turmaData);
  },

  /**
   * Delete a turma
   */
  async delete(id) {
    return api.delete(`/turmas/${id}`);
  }
};
