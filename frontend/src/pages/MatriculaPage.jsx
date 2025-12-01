import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { alunoService } from '../services/alunoService';
import { disciplinaService } from '../services/disciplinaService';
import { matriculaService } from '../services/matriculaService';
import './ProfessorPage.css';

function MatriculaPage() {
  const { user } = useAuth();
  const [alunoData, setAlunoData] = useState(null);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get aluno data
      const alunos = await alunoService.getAll();
      const aluno = alunos.find(a => a.userId === user?.userId);
      
      if (!aluno) {
        setError('Dados do aluno não encontrados');
        return;
      }
      
      setAlunoData(aluno);

      // Get disciplinas for the student's turma
      let disciplinas = [];
      if (aluno.turmaId) {
        disciplinas = await disciplinaService.getByTurma(aluno.turmaId);
      }
      
      // Get student's current enrollments
      const currentMatriculas = await matriculaService.getByAluno(aluno.id);
      setMatriculas(Array.isArray(currentMatriculas) ? currentMatriculas : []);
      
      // Filter out already enrolled disciplinas
      const enrolledDisciplinaIds = currentMatriculas.map(m => m.disciplina?.id);
      const available = disciplinas.filter(d => !enrolledDisciplinaIds.includes(d.id));
      setDisciplinasDisponiveis(Array.isArray(available) ? available : []);
      
      setError(null);
    } catch (err) {
      setError(`Erro ao carregar dados: ${err.message}`);
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatricular = async (e) => {
    e.preventDefault();
    
    if (!selectedDisciplina || !alunoData) {
      return;
    }

    try {
      setEnrolling(true);
      await matriculaService.matricular(alunoData.id, parseInt(selectedDisciplina));
      setSelectedDisciplina('');
      await fetchData(); // Refresh data
    } catch (err) {
      setError(`Erro ao realizar matrícula: ${err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleCancelar = async (matriculaId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta matrícula?')) {
      return;
    }

    try {
      await matriculaService.cancelar(matriculaId, alunoData.id);
      await fetchData(); // Refresh data
    } catch (err) {
      setError(`Erro ao cancelar matrícula: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Matrícula em Disciplinas</h2>
        <p className="loading">Carregando...</p>
      </div>
    );
  }

  if (!alunoData) {
    return (
      <div className="page-container">
        <h2>Matrícula em Disciplinas</h2>
        <div className="error-message">
          <p>⚠️ Dados do aluno não encontrados. Entre em contato com a secretaria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Matrícula em Disciplinas</h2>
        <div className="info-badge">
          <p>👤 <strong>Aluno:</strong> {alunoData.nome}</p>
          <p>📋 <strong>Matrícula:</strong> {alunoData.matricula}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}

      {/* Enrollment Form */}
      <div className="form-card">
        <h3>Nova Matrícula</h3>
        <form onSubmit={handleMatricular}>
          <div className="form-group">
            <label htmlFor="disciplina">Escolha a Disciplina *</label>
            <select
              id="disciplina"
              value={selectedDisciplina}
              onChange={(e) => setSelectedDisciplina(e.target.value)}
              required
              disabled={enrolling || disciplinasDisponiveis.length === 0}
            >
              <option value="">
                {disciplinasDisponiveis.length === 0 
                  ? 'Nenhuma disciplina disponível para matrícula'
                  : 'Selecione uma disciplina'}
              </option>
              {disciplinasDisponiveis.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nome}
                  {disciplina.turma?.nome && ` - ${disciplina.turma.nome}`}
                </option>
              ))}
            </select>
            <small>
              {!alunoData.turmaId && '⚠️ Você não está associado a uma turma. Entre em contato com a secretaria.'}
              {alunoData.turmaId && disciplinasDisponiveis.length === 0 && 'Você já está matriculado em todas as disciplinas disponíveis.'}
            </small>
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-success"
              disabled={enrolling || !selectedDisciplina || disciplinasDisponiveis.length === 0}
            >
              {enrolling ? '⏳ Matriculando...' : '✅ Confirmar Matrícula'}
            </button>
          </div>
        </form>
      </div>

      {/* Enrolled Disciplinas */}
      <div className="section-header">
        <h3>Disciplinas Matriculadas ({matriculas.length})</h3>
      </div>

      {matriculas.length === 0 ? (
        <div className="empty-state">
          <p>📋 Você ainda não está matriculado em nenhuma disciplina.</p>
          <p className="empty-state-hint">Selecione uma disciplina acima para realizar sua matrícula.</p>
        </div>
      ) : (
        <div className="grid-container">
          {matriculas.map((matricula) => (
            <div key={matricula.id} className="entity-card">
              <div className="card-header">
                <h3>{matricula.disciplina?.nome || 'N/A'}</h3>
                <div className="card-actions-inline">
                  <button
                    onClick={() => handleCancelar(matricula.id)}
                    className="btn-delete"
                    title="Cancelar matrícula"
                  >
                    ❌
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <strong>📚 Curso:</strong>{' '}
                  {matricula.disciplina?.turma?.curso?.nome || 'N/A'}
                </p>
                <p>
                  <strong>🎓 Turma:</strong>{' '}
                  {matricula.disciplina?.turma?.nome || 'N/A'}
                </p>
                <p>
                  <strong>📅 Data da Matrícula:</strong>{' '}
                  {matricula.dataMatricula 
                    ? new Date(matricula.dataMatricula).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </p>
                <p>
                  <strong>📊 Status:</strong>{' '}
                  <span className={`status-badge ${matricula.status?.toLowerCase()}`}>
                    {matricula.status || 'ATIVO'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button onClick={fetchData} className="btn-secondary">
          🔄 Atualizar Lista
        </button>
      </div>
    </div>
  );
}

export default MatriculaPage;
