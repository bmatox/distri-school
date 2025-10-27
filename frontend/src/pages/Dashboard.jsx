import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bem-vindo ao DistriSchool</h1>
        <p>Sistema de Gestão Escolar Distribuído</p>
      </div>

      <div className="dashboard-cards">
        <Link to="/professores" className="dashboard-card professors">
          <div className="card-icon">👨‍🏫</div>
          <h2>Professores</h2>
          <p>Gerencie professores e técnicos administrativos</p>
          <div className="card-actions">
            <span>Ver Lista</span>
            <span>Adicionar Novo</span>
          </div>
        </Link>

        <Link to="/alunos" className="dashboard-card students">
          <div className="card-icon">🎓</div>
          <h2>Alunos</h2>
          <p>Cadastre e gerencie alunos da instituição</p>
          <div className="card-actions">
            <span>Ver Lista</span>
            <span>Adicionar Novo</span>
          </div>
        </Link>

        <Link to="/usuarios" className="dashboard-card users">
          <div className="card-icon">👥</div>
          <h2>Usuários</h2>
          <p>Gerencie usuários do sistema</p>
          <div className="card-actions">
            <span>Ver Lista</span>
          </div>
        </Link>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>📡 Arquitetura de Microserviços</h3>
          <p>Sistema distribuído com API Gateway, RabbitMQ e PostgreSQL</p>
        </div>
        <div className="info-card">
          <h3>🚀 Kubernetes</h3>
          <p>Deploy orquestrado com Kubernetes no Minikube</p>
        </div>
        <div className="info-card">
          <h3>⚡ React + Vite</h3>
          <p>Frontend moderno e performático</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
