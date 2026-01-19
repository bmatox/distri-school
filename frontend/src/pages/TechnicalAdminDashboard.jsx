import { useAuth } from '../context/AuthContext';
import { FileText, BarChart3, Calendar, File, Bell, Phone, TrendingUp, Building2, BookOpen } from 'lucide-react';
import './RoleDashboard.css';

function TechnicalAdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Portal Técnico Administrativo</h1>
        <p>Bem-vindo, {user?.name}!</p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card users">
          <div className="card-icon"><FileText size={48} /></div>
          <h2>Relatórios Gerenciais</h2>
          <p>Gere e visualize relatórios administrativos e estatísticas institucionais</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card professors">
          <div className="card-icon"><BarChart3 size={48} /></div>
          <h2>Gestão de Recursos</h2>
          <p>Administre recursos físicos, salas de aula e equipamentos</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card students">
          <div className="card-icon"><Calendar size={48} /></div>
          <h2>Agendamento de Salas</h2>
          <p>Controle e gerencie o agendamento de salas e laboratórios</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card users">
          <div className="card-icon"><File size={48} /></div>
          <h2>Documentação</h2>
          <p>Gerencie documentos administrativos e processos institucionais</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card professors">
          <div className="card-icon"><Bell size={48} /></div>
          <h2>Comunicados</h2>
          <p>Publique avisos e comunicados para a comunidade acadêmica</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>

        <div className="dashboard-card students">
          <div className="card-icon"><Phone size={48} /></div>
          <h2>Atendimento</h2>
          <p>Gerencie solicitações e atendimentos de alunos e professores</p>
          <div className="card-actions">
            <span className="dev-badge">Em desenvolvimento</span>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3><TrendingUp size={20} style={{display: 'inline', marginRight: '8px'}} />Indicadores de Desempenho</h3>
          <p>Acompanhe KPIs e métricas de performance institucional</p>
        </div>
        <div className="info-card">
          <h3><Building2 size={20} style={{display: 'inline', marginRight: '8px'}} />Infraestrutura</h3>
          <p>Monitore o status da infraestrutura e equipamentos</p>
        </div>
        <div className="info-card">
          <h3><BookOpen size={20} style={{display: 'inline', marginRight: '8px'}} />Biblioteca e Acervo</h3>
          <p>Gerencie o acervo bibliográfico e empréstimos</p>
        </div>
      </div>
    </div>
  );
}

export default TechnicalAdminDashboard;
