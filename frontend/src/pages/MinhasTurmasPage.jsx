import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { disciplinaService } from '../services/disciplinaService';
import { professorService } from '../services/professorService';
import { alunoService } from '../services/alunoService';
import { BookOpen, Users, GraduationCap, Inbox, AlertCircle } from 'lucide-react';
import './ProfessorPage.css';
import './MinhasTurmasPage.css';

function MinhasTurmasPage() {
  const { user } = useAuth();
  const [disciplinas, setDisciplinas] = useState([]);
  const [currentProfessor, setCurrentProfessor] = useState(null);
  const [turmaStats, setTurmaStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMinhasTurmas();
  }, [user]);

  const loadMinhasTurmas = async () => {
    try {
      setLoading(true);
      
      if (!user?.userId) {
        setError('Usuário não identificado');
        return;
      }

      // Buscar professor pelo userId
      const professores = await professorService.getAll();
      const professor = professores.find(p => p.userId === user.userId);
      
      if (!professor) {
        setError('Professor não encontrado no sistema');
        return;
      }

      setCurrentProfessor(professor);

      // Buscar disciplinas do professor
      const disciplinasData = await disciplinaService.getByProfessor(professor.id);
      setDisciplinas(disciplinasData || []);

      // Buscar estatísticas de alunos por turma
      await loadTurmaStatistics(disciplinasData || []);
      
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar turmas:', err);
      setError('Erro ao carregar suas turmas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadTurmaStatistics = async (disciplinasData) => {
    try {
      const allAlunos = await alunoService.getAll();
      const stats = {};

      disciplinasData.forEach(disciplina => {
        if (disciplina.turma?.id) {
          const turmaId = disciplina.turma.id;
          if (!stats[turmaId]) {
            const alunosNaTurma = allAlunos.filter(aluno => aluno.turmaId === turmaId);
            stats[turmaId] = alunosNaTurma.length;
          }
        }
      });

      setTurmaStats(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const groupDisciplinasByTurma = () => {
    const grouped = {};
    
    disciplinas.forEach(disciplina => {
      const turmaId = disciplina.turma?.id || 'sem-turma';
      if (!grouped[turmaId]) {
        grouped[turmaId] = {
          turma: disciplina.turma,
          disciplinas: []
        };
      }
      grouped[turmaId].disciplinas.push(disciplina);
    });

    return Object.values(grouped);
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Minhas Turmas</h2>
        <p className="loading">Carregando suas turmas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Minhas Turmas</h2>
        </div>
        <div className="error-message">
          <p><AlertCircle size={18} style={{display: 'inline', marginRight: '8px'}} />{error}</p>
        </div>
      </div>
    );
  }

  const turmasAgrupadas = groupDisciplinasByTurma();

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Minhas Turmas e Disciplinas</h2>
        {currentProfessor && (
          <div className="info-badge">
            <p><strong>Professor:</strong> {currentProfessor.nome}</p>
            {currentProfessor.especialidade && (
              <p><strong>Especialidade:</strong> {currentProfessor.especialidade}</p>
            )}
          </div>
        )}
      </div>

      {disciplinas.length === 0 ? (
        <div className="empty-state">
          <p>
            <Inbox size={48} style={{display: 'block', margin: '0 auto 16px'}} />
            Você ainda não possui disciplinas atribuídas.
          </p>
          <p className="empty-state-hint">
            Entre em contato com a coordenação para atribuição de disciplinas.
          </p>
        </div>
      ) : (
        <div className="turmas-container">
          {turmasAgrupadas.map((grupo, index) => (
            <div key={grupo.turma?.id || `sem-turma-${index}`} className="turma-section">
              <div className="turma-header">
                <div className="turma-info">
                  <h3>
                    <GraduationCap size={24} style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}} />
                    {grupo.turma?.nome || 'Turma não definida'}
                  </h3>
                  {grupo.turma?.curso && (
                    <p className="curso-nome">
                      <BookOpen size={16} style={{display: 'inline', marginRight: '4px'}} />
                      {grupo.turma.curso.nome}
                    </p>
                  )}
                  {grupo.turma?.id && turmaStats[grupo.turma.id] !== undefined && (
                    <p className="alunos-count">
                      <Users size={16} style={{display: 'inline', marginRight: '4px'}} />
                      {turmaStats[grupo.turma.id]} aluno{turmaStats[grupo.turma.id] !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                {grupo.turma?.ano && grupo.turma?.semestre && (
                  <div className="periodo-badge">
                    {grupo.turma.ano}.{grupo.turma.semestre}
                  </div>
                )}
              </div>

              <div className="disciplinas-list">
                {grupo.disciplinas.map(disciplina => (
                  <div key={disciplina.id} className="disciplina-card">
                    <div className="disciplina-content">
                      <h4>{disciplina.nome}</h4>
                      {disciplina.descricao && (
                        <p className="disciplina-descricao">{disciplina.descricao}</p>
                      )}
                    </div>
                    <div className="disciplina-actions">
                      <span className="disciplina-id">ID: {disciplina.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-summary">
        <div className="summary-card">
          <strong>{disciplinas.length}</strong>
          <span>Disciplina{disciplinas.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="summary-card">
          <strong>{turmasAgrupadas.length}</strong>
          <span>Turma{turmasAgrupadas.length !== 1 ? 's' : ''}</span>
        </div>
        {Object.keys(turmaStats).length > 0 && (
          <div className="summary-card">
            <strong>{Object.values(turmaStats).reduce((a, b) => a + b, 0)}</strong>
            <span>Alunos Total</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MinhasTurmasPage;
