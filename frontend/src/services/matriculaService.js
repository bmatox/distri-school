import { api } from './api';

/**
 * Service for interacting with the Matriculas API
 */
export const matriculaService = {
  /**
   * Enroll a student in a disciplina
   */
  async matricular(alunoId, disciplinaId) {
    return api.post('/matriculas', { alunoId, disciplinaId });
  },

  /**
   * Get all enrollments for a student
   */
  async getByAluno(alunoId) {
    return api.get(`/matriculas/aluno/${alunoId}`);
  },

  /**
   * Cancel an enrollment
   */
  async cancelar(matriculaId, alunoId) {
    return api.delete(`/matriculas/${matriculaId}/aluno/${alunoId}`);
  }
};
