import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import './UserSelector.css';

/**
 * Component for selecting an existing user or creating a new one
 * Used in Professor, Aluno, and Tecnico creation forms
 */
function UserSelector({ role, onUserSelected, initialUserId = null }) {
  const [mode, setMode] = useState('select'); // 'select' or 'create'
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state for new user creation
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: role,
  });

  useEffect(() => {
    if (mode === 'select') {
      fetchAvailableUsers();
    }
  }, [mode, role]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      const users = await userService.getAvailableByRole(role);
      setAvailableUsers(users);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar usuários disponíveis: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    onUserSelected(userId);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const createdUser = await userService.create(newUser);
      setSelectedUserId(createdUser.id);
      onUserSelected(createdUser.id);
      setMode('select');
      setError(null);
      // Reset form
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: role,
      });
    } catch (err) {
      setError('Erro ao criar usuário: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (roleValue) => {
    const roleNames = {
      TEACHER: 'Professor',
      STUDENT: 'Aluno',
      TECHNICAL_ADMIN: 'Técnico Administrativo',
      ADMIN: 'Administrador',
    };
    return roleNames[roleValue] || roleValue;
  };

  return (
    <div className="user-selector">
      <h3><User size={20} style={{display: 'inline', marginRight: '8px'}} />Usuário do Sistema</h3>

      {error && (
        <div className="error-message">
          <p><AlertCircle size={16} style={{display: 'inline', marginRight: '4px'}} />{error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}

      <div className="mode-selector">
        <button
          type="button"
          className={`btn-mode ${mode === 'select' ? 'active' : ''}`}
          onClick={() => setMode('select')}
        >
          Selecionar Existente
        </button>
        <button
          type="button"
          className={`btn-mode ${mode === 'create' ? 'active' : ''}`}
          onClick={() => setMode('create')}
        >
          Criar Novo Usuário
        </button>
      </div>

      {mode === 'select' ? (
        <div className="user-select-mode">
          {loading ? (
            <p className="loading">Carregando usuários...</p>
          ) : availableUsers.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum usuário disponível para o perfil de {getRoleName(role)}.</p>
              <p>Crie um novo usuário usando o botão acima.</p>
            </div>
          ) : (
            <div className="user-list">
              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
                  onClick={() => handleSelectUser(user.id)}
                >
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  {selectedUserId === user.id && <span className="check-mark">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="user-create-mode">
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label htmlFor="user-name">Nome Completo *</label>
              <input
                type="text"
                id="user-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                placeholder="Nome completo do usuário"
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-email">Email *</label>
              <input
                type="email"
                id="user-email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-password">Senha *</label>
              <input
                type="password"
                id="user-password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                placeholder="Senha de acesso"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Perfil</label>
              <input
                type="text"
                value={getRoleName(role)}
                disabled
                className="disabled-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Usuário'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

UserSelector.propTypes = {
  role: PropTypes.oneOf(['TEACHER', 'STUDENT', 'TECHNICAL_ADMIN', 'ADMIN']).isRequired,
  onUserSelected: PropTypes.func.isRequired,
  initialUserId: PropTypes.number,
};

export default UserSelector;
