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
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>📡 Arquitetura de Microserviços</h3>
          <p>Sistema baseado em microsserviços com API Gateway, mensageria via RabbitMQ e persistência isolada para máxima eficiência.</p>
        </div>
        <div className="info-card">
          <h3>🚀 Kubernetes</h3>
          <p>Infraestrutura resiliente rodando em cluster de produção, garantindo escalabilidade automática e alta disponibilidade.</p>
        </div>
        <div className="info-card">
          <h3>⚡ React + Vite</h3>
          <p>Interface moderna e responsiva (SPA) com carregamento instantâneo e otimização de performance para o usuário.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
