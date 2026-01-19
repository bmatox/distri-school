import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TechnicalAdminDashboard from './TechnicalAdminDashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock do contexto de autenticação
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Maria Santos',
      userId: 1,
      role: 'TECHNICAL_ADMIN'
    }
  })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TechnicalAdminDashboard - Badge "Em desenvolvimento"', () => {
  describe('Renderização do Dashboard', () => {
    it('should render technical admin dashboard with title', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText('Portal Técnico Administrativo')).toBeInTheDocument();
    });

    it('should display user name in welcome message', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
    });
  });

  describe('Features em Desenvolvimento - Validação dos Badges', () => {
    it('should display "Em desenvolvimento" badge for "Relatórios Gerenciais"', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText('Relatórios Gerenciais')).toBeInTheDocument();
      
      const card = screen.getByText('Relatórios Gerenciais').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Gestão de Recursos"', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText('Gestão de Recursos')).toBeInTheDocument();
      
      const card = screen.getByText('Gestão de Recursos').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Agendamento de Salas"', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText('Agendamento de Salas')).toBeInTheDocument();
      
      const card = screen.getByText('Agendamento de Salas').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Documentação"', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText('Documentação')).toBeInTheDocument();
      
      const card = screen.getByText('Documentação').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Comunicados"', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText('Comunicados')).toBeInTheDocument();
      
      const card = screen.getByText('Comunicados').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Atendimento"', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText('Atendimento')).toBeInTheDocument();
      
      const card = screen.getByText('Atendimento').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });
  });

  describe('Validação Completa dos Badges', () => {
    it('should have exactly 6 dev-badges in the dashboard', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      const devBadges = screen.getAllByText('Em desenvolvimento');
      expect(devBadges).toHaveLength(6);
    });

    it('should apply correct CSS class to all dev badges', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      const devBadges = screen.getAllByText('Em desenvolvimento');
      
      devBadges.forEach(badge => {
        expect(badge).toHaveClass('dev-badge');
      });
    });
  });

  describe('Estrutura dos Cards', () => {
    it('should render all 6 feature cards', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      const cards = document.querySelectorAll('.dashboard-card');
      expect(cards).toHaveLength(6);
    });

    it('should have card-actions section in all cards', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      const cardActions = document.querySelectorAll('.card-actions');
      expect(cardActions.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Info Cards Section', () => {
    it('should render info cards section', () => {
      renderWithRouter(<TechnicalAdminDashboard />);
      expect(screen.getByText('Indicadores de Desempenho')).toBeInTheDocument();
      expect(screen.getByText('Infraestrutura')).toBeInTheDocument();
      expect(screen.getByText('Biblioteca e Acervo')).toBeInTheDocument();
    });
  });
});
