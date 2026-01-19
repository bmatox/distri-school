import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCheck, BarChart3, CheckSquare, BookOpen, FileText, Book } from 'lucide-react';
import './RoleDashboard.css';

function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Portal do Professor</h1>
        <p>Bem-vindo, Prof. {user?.name}!</p>
      </div>

      <div className="dashboard-cards">
        <div 
          className="dashboard-card professors clickable" 
          onClick={() => navigate('/minhas-turmas')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-icon"><UserCheck size={48} /></div>
          <h2>Minhas Turmas</h2>
          <p>Gerencie suas turmas, visualize alunos matriculados e informações das disciplinas</p>
          <div className="card-actions">
            <span>Ver Minhas Turmas</span>
          </div>
        </div>

        <div 
          className="dashboard-card students clickable" 
          onClick={() => navigate('/notas')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-icon"><BarChart3 size={48} /></div>
          <h2>Lançar Notas</h2>
          <p>Registre notas de avaliações, trabalhos e atividades dos alunos</p>
          <div className="card-actions">
            <span>Lançar Notas</span>
          </div>
        </div>

        <div className="dashboard-card users">
          <div className="card-icon"><CheckSquare size={48} /></div>
          <h2>Chamada e Frequência</h2>
          <p>Faça a chamada diária e acompanhe a frequência dos alunos</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card professors">
          <div className="card-icon"><BookOpen size={48} /></div>
          <h2>Plano de Aula</h2>
          <p>Organize e compartilhe planos de aula e cronogramas</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card students">
          <div className="card-icon"><FileText size={48} /></div>
          <h2>Avaliações</h2>
          <p>Crie e gerencie avaliações, provas e trabalhos</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card users">
          <div className="card-icon"><Book size={48} /></div>
          <h2>Material Didático</h2>
          <p>Publique e gerencie materiais de apoio para suas disciplinas</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
