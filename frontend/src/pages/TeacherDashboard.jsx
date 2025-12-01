import { useAuth } from '../context/AuthContext';
import './RoleDashboard.css';

function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Portal do Professor</h1>
        <p>Bem-vindo, Prof. {user?.name}!</p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card professors">
          <div className="card-icon">👨‍🏫</div>
          <h2>Minhas Turmas</h2>
          <p>Gerencie suas turmas, visualize alunos matriculados e informações das disciplinas</p>
          <div className="card-actions">
            <span>Ver Turmas</span>
          </div>
        </div>

        <div className="dashboard-card students">
          <div className="card-icon">📊</div>
          <h2>Lançar Notas</h2>
          <p>Registre notas de avaliações, trabalhos e atividades dos alunos</p>
          <div className="card-actions">
            <span>Lançar Notas</span>
          </div>
        </div>

        <div className="dashboard-card users">
          <div className="card-icon">✅</div>
          <h2>Chamada e Frequência</h2>
          <p>Faça a chamada diária e acompanhe a frequência dos alunos</p>
          <div className="card-actions">
            <span>Fazer Chamada</span>
          </div>
        </div>

        <div className="dashboard-card professors">
          <div className="card-icon">📚</div>
          <h2>Plano de Aula</h2>
          <p>Organize e compartilhe planos de aula e cronogramas</p>
          <div className="card-actions">
            <span>Ver Planos</span>
          </div>
        </div>

        <div className="dashboard-card students">
          <div className="card-icon">📝</div>
          <h2>Avaliações</h2>
          <p>Crie e gerencie avaliações, provas e trabalhos</p>
          <div className="card-actions">
            <span>Ver Avaliações</span>
          </div>
        </div>

        <div className="dashboard-card users">
          <div className="card-icon">📖</div>
          <h2>Material Didático</h2>
          <p>Publique e gerencie materiais de apoio para suas disciplinas</p>
          <div className="card-actions">
            <span>Gerenciar Material</span>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>📈 Relatórios de Desempenho</h3>
          <p>Acompanhe estatísticas e análises de desempenho das turmas</p>
        </div>
        <div className="info-card">
          <h3>📅 Calendário de Aulas</h3>
          <p>Consulte seu horário de aulas e eventos acadêmicos</p>
        </div>
        <div className="info-card">
          <h3>💬 Comunicação</h3>
          <p>Entre em contato com alunos, pais e coordenação pedagógica</p>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
