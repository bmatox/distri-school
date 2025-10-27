import { api } from './api';

/**
 * Service for Aluno operations
 */
export const alunoService = {
  /**
   * Get all alunos
   */
  async getAll() {
    return await api.get('/alunos');
  },

  /**
   * Get a single aluno by ID
   */
  async getById(id) {
    return await api.get(`/alunos/${id}`);
  },

  /**
   * Get aluno by matricula
   */
  async getByMatricula(matricula) {
    return await api.get(`/alunos/matricula/${matricula}`);
  },

  /**
   * Create a new aluno
   */
  async create(aluno) {
    return await api.post('/alunos', aluno);
  },

  /**
   * Update an existing aluno
   */
  async update(id, aluno) {
    return await api.put(`/alunos/${id}`, aluno);
  },

  /**
   * Delete an aluno
   */
  async delete(id) {
    return await api.delete(`/alunos/${id}`);
  },
};
