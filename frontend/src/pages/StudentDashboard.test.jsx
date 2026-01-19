import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StudentDashboard from './StudentDashboard';
import { BrowserRouter } from 'react-router-dom';
import { alunoService } from '../services/alunoService';

// Mock dos serviços
vi.mock('../services/alunoService');

// Mock do contexto de autenticação
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Carlos Almeida',
      userId: 123,
      role: 'STUDENT'
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

describe('StudentDashboard - Badge "Em desenvolvimento"', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    alunoService.getAll = vi.fn().mockResolvedValue([
      {
        id: 1,
        userId: 123,
        nome: 'Carlos Almeida',
        matricula: '2024001',
        curso: { nome: 'Engenharia de Software' }
      }
    ]);
  });

  describe('Renderização do Dashboard', () => {
    it('should render student dashboard with title', async () => {
      renderWithRouter(<StudentDashboard />);
      expect(screen.getByText('Portal do Aluno')).toBeInTheDocument();
    });

    it('should display student name in welcome message', async () => {
      renderWithRouter(<StudentDashboard />);
      expect(screen.getByText(/Carlos Almeida/)).toBeInTheDocument();
    });

    it('should display student matricula after loading', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/2024001/)).toBeInTheDocument();
      });
    });
  });

  describe('Features Implementadas - Sem Badge', () => {
    it('should NOT have dev-badge for "Matrícula" (implemented feature)', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        const card = screen.getByText('Matrícula').closest('.dashboard-card');
        const badge = card.querySelector('.dev-badge');
        expect(badge).toBeNull();
      });
    });

    it('should NOT have dev-badge for "Notas e Avaliações" (implemented feature)', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        const card = screen.getByText('Notas e Avaliações').closest('.dashboard-card');
        const badge = card.querySelector('.dev-badge');
        expect(badge).toBeNull();
      });
    });
  });

  describe('Features em Desenvolvimento - Validação dos Badges', () => {
    it('should display "Em desenvolvimento" badge for "Horário de Aulas"', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Horário de Aulas')).toBeInTheDocument();
        const card = screen.getByText('Horário de Aulas').closest('.dashboard-card');
        const badge = card.querySelector('.dev-badge');
        
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('Em desenvolvimento');
      });
    });

    it('should display "Em desenvolvimento" badge for "Material Didático"', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Material Didático')).toBeInTheDocument();
        const card = screen.getByText('Material Didático').closest('.dashboard-card');
        const badge = card.querySelector('.dev-badge');
        
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('Em desenvolvimento');
      });
    });

    it('should display "Em desenvolvimento" badge for "Frequência"', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Frequência')).toBeInTheDocument();
        const card = screen.getByText('Frequência').closest('.dashboard-card');
        const badge = card.querySelector('.dev-badge');
        
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('Em desenvolvimento');
      });
    });

    it('should display "Em desenvolvimento" badge for "Mensagens"', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Mensagens')).toBeInTheDocument();
        const card = screen.getByText('Mensagens').closest('.dashboard-card');
        const badge = card.querySelector('.dev-badge');
        
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('Em desenvolvimento');
      });
    });
  });

  describe('Validação Completa dos Badges', () => {
    it('should have exactly 4 dev-badges in the student dashboard', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        const devBadges = screen.getAllByText('Em desenvolvimento');
        expect(devBadges).toHaveLength(4);
      });
    });

    it('should apply correct CSS class to all dev badges', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        const devBadges = screen.getAllByText('Em desenvolvimento');
        devBadges.forEach(badge => {
          expect(badge).toHaveClass('dev-badge');
        });
      });
    });
  });

  describe('Estrutura dos Cards', () => {
    it('should render all 6 feature cards', async () => {
      renderWithRouter(<StudentDashboard />);
      
      await waitFor(() => {
        const cards = document.querySelectorAll('.dashboard-card');
        expect(cards).toHaveLength(6);
      });
    });
  });
});
