import { api } from './api';

/**
 * Service for interacting with the Grades API
 */
export const gradesService = {
  /**
   * Get all grades
   */
  async getAllGrades() {
    return api.get('/grades');
  },

  /**
   * Get grade by ID
   */
  async getGradeById(id) {
    return api.get(`/grades/${id}`);
  },

  /**
   * Get grades by student ID
   */
  async getGradesByStudent(studentId) {
    return api.get(`/grades/student/${studentId}`);
  },

  /**
   * Get grades by professor ID
   */
  async getGradesByProfessor(professorId) {
    return api.get(`/grades/professor/${professorId}`);
  },

  /**
   * Create a new grade
   */
  async createGrade(gradeData) {
    return api.post('/grades', gradeData);
  },

  /**
   * Update an existing grade
   */
  async updateGrade(id, gradeData) {
    return api.put(`/grades/${id}`, gradeData);
  },

  /**
   * Delete a grade
   */
  async deleteGrade(id) {
    return api.delete(`/grades/${id}`);
  }
};
