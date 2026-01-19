import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TeacherDashboard from './TeacherDashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock do contexto de autenticação
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Prof. João Silva',
      userId: 1,
      role: 'TEACHER'
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

describe('TeacherDashboard - Badge "Em desenvolvimento"', () => {
  describe('Renderização do Dashboard', () => {
    it('should render teacher dashboard with title', () => {
      renderWithRouter(<TeacherDashboard />);
      expect(screen.getByText('Portal do Professor')).toBeInTheDocument();
    });

    it('should display teacher name in welcome message', () => {
      renderWithRouter(<TeacherDashboard />);
      expect(screen.getByText(/Prof. João Silva/)).toBeInTheDocument();
    });
  });

  describe('Features em Desenvolvimento - Validação dos Badges', () => {
    it('should display "Em desenvolvimento" badge for "Minhas Turmas"', () => {
      renderWithRouter(<TeacherDashboard />);
      expect(screen.getByText('Minhas Turmas')).toBeInTheDocument();
      
      const card = screen.getByText('Minhas Turmas').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Lançar Notas"', () => {
      renderWithRouter(<TeacherDashboard />);
      expect(screen.getByText('Lançar Notas')).toBeInTheDocument();
      
      const card = screen.getByText('Lançar Notas').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Chamada e Frequência"', () => {
      renderWithRouter(<TeacherDashboard />);
      expect(screen.getByText('Chamada e Frequência')).toBeInTheDocument();
      
      const card = screen.getByText('Chamada e Frequência').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Plano de Aula"', () => {
      renderWithRouter(<TeacherDashboard />);
      expect(screen.getByText('Plano de Aula')).toBeInTheDocument();
      
      const card = screen.getByText('Plano de Aula').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Avaliações"', () => {
      renderWithRouter(<TeacherDashboard />);
      expect(screen.getByText('Avaliações')).toBeInTheDocument();
      
      const card = screen.getByText('Avaliações').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });

    it('should display "Em desenvolvimento" badge for "Material Didático"', () => {
      renderWithRouter(<TeacherDashboard />);
      expect(screen.getByText('Material Didático')).toBeInTheDocument();
      
      const card = screen.getByText('Material Didático').closest('.dashboard-card');
      const badge = card.querySelector('.dev-badge');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Em desenvolvimento');
    });
  });

  describe('Validação Completa dos Badges', () => {
    it('should have exactly 6 dev-badges in the dashboard', () => {
      renderWithRouter(<TeacherDashboard />);
      const devBadges = screen.getAllByText('Em desenvolvimento');
      expect(devBadges).toHaveLength(6);
    });

    it('should apply correct CSS class to all dev badges', () => {
      renderWithRouter(<TeacherDashboard />);
      const devBadges = screen.getAllByText('Em desenvolvimento');
      
      devBadges.forEach(badge => {
        expect(badge).toHaveClass('dev-badge');
      });
    });
  });

  describe('Estrutura dos Cards', () => {
    it('should render all 6 feature cards', () => {
      renderWithRouter(<TeacherDashboard />);
      const cards = document.querySelectorAll('.dashboard-card');
      expect(cards).toHaveLength(6);
    });

    it('should have card-actions section in all cards', () => {
      renderWithRouter(<TeacherDashboard />);
      const cardActions = document.querySelectorAll('.card-actions');
      expect(cardActions.length).toBeGreaterThanOrEqual(6);
    });
  });
});
