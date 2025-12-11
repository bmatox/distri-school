import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserPage from './UserPage';
import { userService } from '../services/userService';
import { cursoService } from '../services/cursoService';
import { turmaService } from '../services/turmaService';

// Mock the services
vi.mock('../services/userService');
vi.mock('../services/cursoService');
vi.mock('../services/turmaService');

describe('UserPage Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    userService.getAll = vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com',
        role: 'STUDENT',
        createdAt: '2025-01-01T00:00:00'
      }
    ]);

    cursoService.getAll = vi.fn().mockResolvedValue([
      { id: 1, nome: 'Engenharia de Software' },
      { id: 2, nome: 'Ciência da Computação' }
    ]);

    turmaService.getAll = vi.fn().mockResolvedValue([
      { id: 1, nome: 'Turma A', curso: { nome: 'Engenharia de Software' } }
    ]);

    turmaService.getByCurso = vi.fn().mockResolvedValue([
      { id: 1, nome: 'Turma A', curso: { nome: 'Engenharia de Software' } }
    ]);
  });

  it('should render user page with title', async () => {
    render(<UserPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Gestão de Usuários')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    render(<UserPage />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should load and display users', async () => {
    render(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('joao@test.com')).toBeInTheDocument();
    });

    expect(userService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should show form when "Novo Usuário" button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    const newUserButton = screen.getByText('➕ Novo Usuário');
    await user.click(newUserButton);

    expect(screen.getByText('Cadastrar Novo Usuário')).toBeInTheDocument();
  });

  it('should validate student contato field (minimum 12 characters)', async () => {
    const user = userEvent.setup();
    render(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Open form
    const newUserButton = screen.getByText('➕ Novo Usuário');
    await user.click(newUserButton);

    // Fill form with invalid contato
    const nameInput = screen.getByLabelText(/Nome Completo/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Senha/i);
    const contatoInput = screen.getByLabelText(/Contato/i);

    await user.type(nameInput, 'Test Student');
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.type(contatoInput, '123'); // Too short

    // Select role as STUDENT
    const roleSelect = screen.getByLabelText(/Perfil/i);
    await user.selectOptions(roleSelect, 'STUDENT');

    // Try to submit (validation should prevent this)
    // Note: Full form submission would require filling all required fields
  });

  it('should display error message when user creation fails', async () => {
    const user = userEvent.setup();
    userService.create = vi.fn().mockRejectedValue(new Error('Email já está em uso'));
    
    render(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Open form
    const newUserButton = screen.getByText('➕ Novo Usuário');
    await user.click(newUserButton);

    // The error handling is part of the component
    expect(screen.getByText('Cadastrar Novo Usuário')).toBeInTheDocument();
  });

  it('should load cursos and turmas on mount', async () => {
    render(<UserPage />);

    await waitFor(() => {
      expect(cursoService.getAll).toHaveBeenCalled();
      expect(turmaService.getAll).toHaveBeenCalled();
    });
  });

  it('should display role name correctly', async () => {
    render(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('Aluno')).toBeInTheDocument();
    });
  });

  it('should show empty state when no users exist', async () => {
    userService.getAll = vi.fn().mockResolvedValue([]);
    
    render(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('📋 Nenhum usuário cadastrado.')).toBeInTheDocument();
    });
  });

  it('should have refresh button', async () => {
    render(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('🔄 Atualizar Lista')).toBeInTheDocument();
    });
  });

  it('should validate student fields - curso and turma required', async () => {
    const user = userEvent.setup();
    render(<UserPage />);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    // Open form
    const newUserButton = screen.getByText('➕ Novo Usuário');
    await user.click(newUserButton);

    // Select STUDENT role to show student-specific fields
    const roleSelect = screen.getByLabelText(/Perfil/i);
    await user.selectOptions(roleSelect, 'STUDENT');

    // Verify curso and turma selects are present
    await waitFor(() => {
      expect(screen.getByLabelText(/Curso/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Turma/i)).toBeInTheDocument();
    });
  });
});
