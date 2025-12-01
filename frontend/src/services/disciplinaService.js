import { api } from './api';

/**
 * Service for interacting with the Disciplinas API
 */
export const disciplinaService = {
  /**
   * Get all disciplinas
   */
  async getAll() {
    return api.get('/disciplinas');
  },

  /**
   * Get disciplina by ID
   */
  async getById(id) {
    return api.get(`/disciplinas/${id}`);
  },

  /**
   * Get disciplinas by turma
   */
  async getByTurma(turmaId) {
    return api.get(`/disciplinas/turma/${turmaId}`);
  },

  /**
   * Get disciplinas by professor
   */
  async getByProfessor(professorId) {
    return api.get(`/disciplinas/professor/${professorId}`);
  },

  /**
   * Create a new disciplina
   */
  async create(disciplinaData) {
    return api.post('/disciplinas', disciplinaData);
  },

  /**
   * Update a disciplina
   */
  async update(id, disciplinaData) {
    return api.put(`/disciplinas/${id}`, disciplinaData);
  },

  /**
   * Delete a disciplina
   */
  async delete(id) {
    return api.delete(`/disciplinas/${id}`);
  }
};
