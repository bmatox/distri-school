import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MinhasTurmasPage from './MinhasTurmasPage';
import { professorService } from '../services/professorService';
import { disciplinaService } from '../services/disciplinaService';
import { alunoService } from '../services/alunoService';

// Mock dos serviços
vi.mock('../services/professorService');
vi.mock('../services/disciplinaService');
vi.mock('../services/alunoService');

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

describe('MinhasTurmasPage', () => {
  const mockProfessor = {
    id: 1,
    userId: 1,
    nome: 'Prof. João Silva',
    email: 'joao@test.com',
    especialidade: 'Engenharia de Software'
  };

  const mockDisciplinas = [
    {
      id: 1,
      nome: 'Programação Orientada a Objetos',
      descricao: 'Conceitos de POO',
      turma: {
        id: 1,
        nome: 'ADS 2024.1',
        ano: '2024',
        semestre: '1',
        curso: {
          id: 1,
          nome: 'Análise e Desenvolvimento de Sistemas'
        }
      }
    },
    {
      id: 2,
      nome: 'Banco de Dados',
      descricao: 'Modelagem e SQL',
      turma: {
        id: 1,
        nome: 'ADS 2024.1',
        ano: '2024',
        semestre: '1',
        curso: {
          id: 1,
          nome: 'Análise e Desenvolvimento de Sistemas'
        }
      }
    },
    {
      id: 3,
      nome: 'Estrutura de Dados',
      descricao: 'Listas, pilhas e filas',
      turma: {
        id: 2,
        nome: 'ADS 2024.2',
        ano: '2024',
        semestre: '2',
        curso: {
          id: 1,
          nome: 'Análise e Desenvolvimento de Sistemas'
        }
      }
    }
  ];

  const mockAlunos = [
    { id: 1, turmaId: 1, nome: 'Aluno 1' },
    { id: 2, turmaId: 1, nome: 'Aluno 2' },
    { id: 3, turmaId: 1, nome: 'Aluno 3' },
    { id: 4, turmaId: 2, nome: 'Aluno 4' },
    { id: 5, turmaId: 2, nome: 'Aluno 5' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    professorService.getAll = vi.fn().mockResolvedValue([mockProfessor]);
    disciplinaService.getByProfessor = vi.fn().mockResolvedValue(mockDisciplinas);
    alunoService.getAll = vi.fn().mockResolvedValue(mockAlunos);
  });

  describe('Renderização da Página', () => {
    it('should render page title', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Minhas Turmas e Disciplinas')).toBeInTheDocument();
      });
    });

    it('should display professor information', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Prof. João Silva/)).toBeInTheDocument();
        expect(screen.getByText(/Engenharia de Software/)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      renderWithRouter(<MinhasTurmasPage />);
      expect(screen.getByText('Carregando suas turmas...')).toBeInTheDocument();
    });
  });

  describe('Exibição de Disciplinas e Turmas', () => {
    it('should display all disciplinas', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Programação Orientada a Objetos')).toBeInTheDocument();
        expect(screen.getByText('Banco de Dados')).toBeInTheDocument();
        expect(screen.getByText('Estrutura de Dados')).toBeInTheDocument();
      });
    });

    it('should display disciplina descriptions', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Conceitos de POO')).toBeInTheDocument();
        expect(screen.getByText('Modelagem e SQL')).toBeInTheDocument();
      });
    });

    it('should display turma names', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText('ADS 2024.1')).toBeInTheDocument();
        expect(screen.getByText('ADS 2024.2')).toBeInTheDocument();
      });
    });

    it('should display course names', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        const cursoElements = screen.getAllByText('Análise e Desenvolvimento de Sistemas');
        expect(cursoElements.length).toBeGreaterThan(0);
      });
    });

    it('should group disciplinas by turma', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        // Deve ter 2 seções de turma (ADS 2024.1 e ADS 2024.2)
        const turmaSections = document.querySelectorAll('.turma-section');
        expect(turmaSections).toHaveLength(2);
      });
    });
  });

  describe('Estatísticas de Alunos', () => {
    it('should display student count for each turma', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/3 alunos/)).toBeInTheDocument(); // Turma 1
        expect(screen.getByText(/2 alunos/)).toBeInTheDocument(); // Turma 2
      });
    });

    it('should display total students in summary', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        const summaryCards = document.querySelectorAll('.summary-card');
        const totalAlunosCard = Array.from(summaryCards).find(card => 
          card.textContent.includes('Alunos Total')
        );
        expect(totalAlunosCard).toBeTruthy();
        expect(totalAlunosCard.textContent).toContain('5');
      });
    });
  });

  describe('Resumo/Summary', () => {
    it('should display total number of disciplinas', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        const summaryCards = document.querySelectorAll('.summary-card');
        const disciplinasCard = Array.from(summaryCards).find(card => 
          card.textContent.includes('Disciplinas')
        );
        expect(disciplinasCard).toBeTruthy();
        expect(disciplinasCard.textContent).toContain('3');
      });
    });

    it('should display total number of turmas', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        const summaryCards = document.querySelectorAll('.summary-card');
        const turmasCard = Array.from(summaryCards).find(card => 
          card.textContent.includes('Turmas')
        );
        expect(turmasCard).toBeTruthy();
        expect(turmasCard.textContent).toContain('2');
      });
    });
  });

  describe('Estado Vazio', () => {
    it('should display empty state when professor has no disciplinas', async () => {
      disciplinaService.getByProfessor = vi.fn().mockResolvedValue([]);
      
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Você ainda não possui disciplinas atribuídas/)).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de Erros', () => {
    it('should display error when professor is not found', async () => {
      professorService.getAll = vi.fn().mockResolvedValue([]);
      
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Professor não encontrado no sistema/)).toBeInTheDocument();
      });
    });

    it('should display error when service fails', async () => {
      professorService.getAll = vi.fn().mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar suas turmas/)).toBeInTheDocument();
      });
    });
  });

  describe('Chamadas de API', () => {
    it('should call professorService.getAll', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(professorService.getAll).toHaveBeenCalled();
      });
    });

    it('should call disciplinaService.getByProfessor with professor id', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(disciplinaService.getByProfessor).toHaveBeenCalledWith(1);
      });
    });

    it('should call alunoService.getAll for statistics', async () => {
      renderWithRouter(<MinhasTurmasPage />);
      
      await waitFor(() => {
        expect(alunoService.getAll).toHaveBeenCalled();
      });
    });
  });
});
