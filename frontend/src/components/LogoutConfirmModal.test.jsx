import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogoutConfirmModal from './LogoutConfirmModal';

describe('LogoutConfirmModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <LogoutConfirmModal
          isOpen={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.queryByText('Confirmar Saída')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Confirmar Saída')).toBeInTheDocument();
    });

    it('should display confirmation message', () => {
      render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(
        screen.getByText('Você tem certeza que deseja sair da aplicação?')
      ).toBeInTheDocument();
    });

    it('should have two buttons: Cancelar and Sair', () => {
      render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('should have close button', () => {
      render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByTitle('Fechar')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onConfirm when "Sair" button is clicked', () => {
      render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      fireEvent.click(screen.getByText('Sair'));
      expect(mockOnConfirm).toHaveBeenCalledOnce();
    });

    it('should call onCancel when "Cancelar" button is clicked', () => {
      render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });

    it('should call onCancel when close button is clicked', () => {
      render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      fireEvent.click(screen.getByTitle('Fechar'));
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });

    it('should call onCancel when overlay is clicked', () => {
      const { container } = render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const overlay = container.querySelector('.logout-modal-overlay');
      fireEvent.click(overlay);
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });

    it('should not call onCancel when modal content is clicked', () => {
      const { container } = render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      const modalContent = container.querySelector('.logout-modal-content');
      fireEvent.click(modalContent);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('should call onCancel when Escape key is pressed', () => {
      render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });

    it('should not call onCancel when Escape is pressed while modal is closed', () => {
      render(
        <LogoutConfirmModal
          isOpen={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('DOM Management', () => {
    it('should prevent body scroll when modal is open', () => {
      const { rerender } = render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <LogoutConfirmModal
          isOpen={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(document.body.style.overflow).toBe('unset');
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(
        document,
        'removeEventListener'
      );
      const { unmount } = render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('CSS Classes', () => {
    it('should have correct CSS classes for styling', () => {
      const { container } = render(
        <LogoutConfirmModal
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(
        container.querySelector('.logout-modal-overlay')
      ).toBeInTheDocument();
      expect(
        container.querySelector('.logout-modal-content')
      ).toBeInTheDocument();
      expect(
        container.querySelector('.logout-modal-header')
      ).toBeInTheDocument();
      expect(
        container.querySelector('.logout-modal-body')
      ).toBeInTheDocument();
      expect(
        container.querySelector('.logout-modal-footer')
      ).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should have propTypes defined', () => {
      expect(LogoutConfirmModal.propTypes).toBeDefined();
      expect(LogoutConfirmModal.propTypes.isOpen).toBeDefined();
      expect(LogoutConfirmModal.propTypes.onConfirm).toBeDefined();
      expect(LogoutConfirmModal.propTypes.onCancel).toBeDefined();
    });

    it('should be callable with all required props', () => {
      expect(() => {
        render(
          <LogoutConfirmModal
            isOpen={true}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
          />
        );
      }).not.toThrow();
    });

    it('should not render with isOpen false', () => {
      const { container } = render(
        <LogoutConfirmModal
          isOpen={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      expect(container.querySelector('.logout-modal-overlay')).not.toBeInTheDocument();
    });
  });
});
