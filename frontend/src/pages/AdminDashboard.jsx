import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RoleDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Painel do Administrador</h1>
        <p>Bem-vindo, {user?.name}! Gerencie o sistema escolar</p>
      </div>

      <div className="dashboard-cards">
        <Link to="/usuarios" className="dashboard-card users">
          <div className="card-icon">👥</div>
          <h2>Usuários</h2>
          <p>Cadastre novos usuários e gerencie perfis (Alunos, Professores, Técnicos Administrativos)</p>
          <div className="card-actions">
            <span>Ver Lista</span>
            <span>Novo Cadastro</span>
          </div>
        </Link>

        <Link to="/professores" className="dashboard-card professors">
          <div className="card-icon">👨‍🏫</div>
          <h2>Professores</h2>
          <p>Visualize e gerencie professores cadastrados no sistema</p>
          <div className="card-actions">
            <span>Ver Lista</span>
          </div>
        </Link>

        <Link to="/alunos" className="dashboard-card students">
          <div className="card-icon">🎓</div>
          <h2>Alunos</h2>
          <p>Visualize e gerencie alunos matriculados na instituição</p>
          <div className="card-actions">
            <span>Ver Lista</span>
          </div>
        </Link>

        <Link to="/cursos-turmas" className="dashboard-card courses">
          <div className="card-icon">📚</div>
          <h2>Cursos e Turmas</h2>
          <p>Gerencie cursos, crie e organize turmas por período</p>
          <div className="card-actions">
            <span>Ver Lista</span>
            <span>Novo Cadastro</span>
          </div>
        </Link>

        <Link to="/disciplinas" className="dashboard-card disciplines">
          <div className="card-icon">📖</div>
          <h2>Disciplinas</h2>
          <p>Cadastre e gerencie disciplinas ofertadas por curso e turma</p>
          <div className="card-actions">
            <span>Ver Lista</span>
            <span>Nova Disciplina</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
