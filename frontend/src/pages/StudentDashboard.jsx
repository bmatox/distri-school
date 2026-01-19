import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { alunoService } from '../services/alunoService';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, BookOpen, FileText, Calendar, Book, BarChart3, MessageSquare } from 'lucide-react';
import './RoleDashboard.css';

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alunoData, setAlunoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlunoData = async () => {
      try {
        if (user?.userId) {
          // Fetch aluno data by userId
          const alunos = await alunoService.getAll();
          const aluno = alunos.find(a => a.userId === user.userId);
          setAlunoData(aluno);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do aluno:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlunoData();
  }, [user]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Portal do Aluno</h1>
        <p>Bem-vindo, {user?.name}!</p>
        {!loading && alunoData && (
          <p className="matricula-info">
            <strong>Matrícula:</strong> {alunoData.matricula}
          </p>
        )}
      </div>

      <div className="dashboard-cards">
        <div 
          className="dashboard-card students clickable" 
          onClick={() => navigate('/matriculas')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-icon"><ClipboardList size={48} /></div>
          <h2>Matrícula</h2>
          <p>Realize sua matrícula em disciplinas disponíveis para sua turma e curso</p>
          <div className="card-actions">
            <span>Acessar Matrícula</span>
          </div>
        </div>

        <div 
          className="dashboard-card professors clickable" 
          onClick={() => navigate('/notas')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-icon"><FileText size={48} /></div>
          <h2>Notas e Avaliações</h2>
          <p>Acompanhe suas notas, trabalhos e avaliações realizadas</p>
          <div className="card-actions">
            <span>Ver Minhas Notas</span>
          </div>
        </div>

        <div className="dashboard-card users">
          <div className="card-icon"><Calendar size={48} /></div>
          <h2>Horário de Aulas</h2>
          <p>Consulte seu horário semanal de aulas e eventos acadêmicos</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card professors">
          <div className="card-icon"><Book size={48} /></div>
          <h2>Material Didático</h2>
          <p>Acesse apostilas, slides e materiais das suas disciplinas</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card students">
          <div className="card-icon"><BarChart3 size={48} /></div>
          <h2>Frequência</h2>
          <p>Acompanhe sua frequência nas disciplinas</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card users">
          <div className="card-icon"><MessageSquare size={48} /></div>
          <h2>Mensagens</h2>
          <p>Comunicação com professores e coordenação</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
