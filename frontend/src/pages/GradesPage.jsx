import { useState, useEffect } from 'react';
import { gradesService } from '../services/gradesService';
import { alunoService } from '../services/alunoService';
import { professorService } from '../services/professorService';
import { disciplinaService } from '../services/disciplinaService';
import { useAuth } from '../context/AuthContext';
import { FileText, Trash2 } from 'lucide-react';
import './GradesPage.css';

function GradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    professorId: '',
    studentUserId: '',
    professorUserId: '',
    disciplinaId: '',
    subject: '',
    grade: '',
    evaluationType: 'AV1',
    comments: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Load students by disciplina when disciplina changes
    if (formData.disciplinaId) {
      loadStudentsByDisciplina(formData.disciplinaId);
    } else {
      setStudents([]);
    }
  }, [formData.disciplinaId]);

  const loadStudentsByDisciplina = async (disciplinaId) => {
    try {
      // Get the disciplina to find its turma
      const disciplina = await disciplinaService.getById(disciplinaId);
      if (disciplina && disciplina.turma && disciplina.turma.id) {
        // Get all students and filter by turmaId
        const allStudentsData = await alunoService.getAll();
        const filteredStudents = allStudentsData.filter(student => 
          student.turmaId === disciplina.turma.id
        );
        setStudents(filteredStudents);
      }
    } catch (err) {
      console.error('Error loading students by disciplina:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // For students, only load their own grades
      if (user && user.role === 'STUDENT') {
        // Find the student record by userId
        const studentsData = await alunoService.getAll();
        const currentStudent = studentsData.find(s => s.userId === user.userId);
        
        if (currentStudent) {
          const studentGrades = await gradesService.getGradesByStudent(currentStudent.id);
          setGrades(studentGrades || []);
        }
        
        // Load professors for display
        const professorsData = await professorService.getAll();
        setProfessors(professorsData || []);
      } else {
        // For teachers and admins, load all data
        const [gradesData, studentsData, professorsData, disciplinasData] = await Promise.all([
          gradesService.getAllGrades(),
          alunoService.getAll(),
          professorService.getAll(),
          disciplinaService.getAll()
        ]);
        setGrades(gradesData || []);
        setAllStudents(studentsData || []);
        setProfessors(professorsData || []);
        
        // If user is a teacher, find the current professor and auto-set in form
        if (user && user.role === 'TEACHER') {
          const professor = professorsData.find(p => p.userId === user.userId);
          if (professor) {
            setCurrentProfessor(professor);
            setFormData(prev => ({
              ...prev,
              professorId: professor.id,
              professorUserId: professor.userId
            }));
          }
          setDisciplinas(disciplinasData || []);
        } else {
          setDisciplinas(disciplinasData || []);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for student and professor selection to also capture userId
    if (name === 'studentId') {
      const student = students.find(s => s.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        studentId: value,
        studentUserId: student ? student.userId : ''
      }));
    } else if (name === 'professorId') {
      const professor = professors.find(p => p.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        professorId: value,
        professorUserId: professor ? professor.userId : ''
      }));
    } else if (name === 'disciplinaId') {
      // Auto-fill subject name from selected disciplina
      const disciplina = disciplinas.find(d => d.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        disciplinaId: value,
        subject: disciplina ? disciplina.nome : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await gradesService.createGrade({
        ...formData,
        studentId: parseInt(formData.studentId),
        professorId: parseInt(formData.professorId),
        studentUserId: formData.studentUserId ? parseInt(formData.studentUserId) : null,
        professorUserId: formData.professorUserId ? parseInt(formData.professorUserId) : null,
        disciplinaId: formData.disciplinaId ? parseInt(formData.disciplinaId) : null,
        grade: parseFloat(formData.grade)
      });
      setShowForm(false);
      // Reset form but keep professor data for teachers
      if (user.role === 'TEACHER' && currentProfessor) {
        setFormData({
          studentId: '',
          professorId: currentProfessor.id,
          studentUserId: '',
          professorUserId: currentProfessor.userId,
          disciplinaId: '',
          subject: '',
          grade: '',
          evaluationType: 'AV1',
          comments: ''
        });
      } else {
        setFormData({
          studentId: '',
          professorId: '',
          studentUserId: '',
          professorUserId: '',
          disciplinaId: '',
          subject: '',
          grade: '',
          evaluationType: 'AV1',
          comments: ''
        });
      }
      loadData();
      alert('Nota lançada com sucesso!');
    } catch (err) {
      console.error('Error creating grade:', err);
      alert('Erro ao lançar nota. Por favor, tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        await gradesService.deleteGrade(id);
        loadData();
        alert('Nota excluída com sucesso!');
      } catch (err) {
        console.error('Error deleting grade:', err);
        alert('Erro ao excluir nota. Por favor, tente novamente.');
      }
    }
  };

  const getStudentName = (studentId) => {
    const student = allStudents.find(s => s.id === studentId);
    return student ? student.nome : `ID: ${studentId}`;
  };

  const getProfessorName = (professorId) => {
    const professor = professors.find(p => p.id === professorId);
    return professor ? professor.nome : `ID: ${professorId}`;
  };

  if (loading) {
    return (
      <div className="grades-page">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="grades-page">
      <div className="grades-header">
        <h1><FileText size={28} style={{display: 'inline', marginRight: '12px', verticalAlign: 'middle'}} />{user?.role === 'STUDENT' ? 'Minhas Notas' : 'Gestão de Notas'}</h1>
        {user?.role !== 'STUDENT' && (
          <button 
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Lançar Nova Nota'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role !== 'STUDENT' && (
        <div className="grade-form-container">
          <h2>Lançar Nova Nota</h2>
          <form onSubmit={handleSubmit} className="grade-form">
            {/* Only show professor dropdown for non-teachers */}
            {user?.role !== 'TEACHER' && (
              <div className="form-group">
                <label htmlFor="professorId">Professor *</label>
                <select
                  id="professorId"
                  name="professorId"
                  value={formData.professorId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um professor</option>
                  {professors.map(professor => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Show professor name for teachers */}
            {user?.role === 'TEACHER' && currentProfessor && (
              <div className="form-group">
                <label>Professor</label>
                <input
                  type="text"
                  value={currentProfessor.nome}
                  disabled
                  className="readonly-field"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="disciplinaId">Disciplina *</label>
              <select
                id="disciplinaId"
                name="disciplinaId"
                value={formData.disciplinaId}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas.map(disciplina => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="studentId">Aluno *</label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                disabled={!formData.disciplinaId}
              >
                <option value="">
                  {formData.disciplinaId ? 'Selecione um aluno' : 'Selecione uma disciplina primeiro'}
                </option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="grade">Nota (0-10) *</label>
              <input
                type="number"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                required
                placeholder="Ex: 8.5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="evaluationType">Tipo de Avaliação *</label>
              <select
                id="evaluationType"
                name="evaluationType"
                value={formData.evaluationType}
                onChange={handleInputChange}
                required
              >
                <option value="AV1">AV1</option>
                <option value="AV2">AV2</option>
                <option value="AV3">AV3</option>
                <option value="PROVA">Prova</option>
                <option value="TRABALHO">Trabalho</option>
                <option value="PARTICIPACAO">Participação</option>
                <option value="PROJETO">Projeto</option>
                <option value="SEMINARIO">Seminário</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="comments">Observações</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows="3"
                placeholder="Observações sobre a avaliação (opcional)"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Lançar Nota
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grades-list">
        <h2>{user?.role === 'STUDENT' ? 'Suas Notas' : 'Notas Registradas'}</h2>
        {grades.length === 0 ? (
          <p className="no-data">{user?.role === 'STUDENT' ? 'Você ainda não possui notas registradas.' : 'Nenhuma nota registrada ainda.'}</p>
        ) : (
          <div className="grades-table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  {user?.role !== 'STUDENT' && <th>Aluno</th>}
                  <th>Professor</th>
                  <th>Disciplina</th>
                  <th>Nota</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  {user?.role === 'STUDENT' && <th>Observações</th>}
                  {user?.role !== 'STUDENT' && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {grades.map(grade => (
                  <tr key={grade.id}>
                    {user?.role !== 'STUDENT' && <td>{getStudentName(grade.studentId)}</td>}
                    <td>{getProfessorName(grade.professorId)}</td>
                    <td>{grade.subject}</td>
                    <td className="grade-value">{grade.grade != null ? grade.grade.toFixed(2) : 'N/A'}</td>
                    <td>{grade.evaluationType}</td>
                    <td>{new Date(grade.createdAt).toLocaleDateString('pt-BR')}</td>
                    {user?.role === 'STUDENT' && <td>{grade.comments || '-'}</td>}
                    {user?.role !== 'STUDENT' && (
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(grade.id)}
                          title="Excluir nota"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GradesPage;
