import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import './ProfessorPage.css';

function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Usuários</h2>
        <p className="loading">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestão de Usuários</h2>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <p>📋 Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <div className="grid-container">
          {users.map((user) => (
            <div key={user.id} className="entity-card">
              <div className="card-header">
                <h3>{user.username || user.name || 'Usuário'}</h3>
              </div>
              <div className="card-body">
                {user.email && (
                  <p>
                    <strong>📧 Email:</strong> {user.email}
                  </p>
                )}
                {user.role && (
                  <p>
                    <strong>👤 Função:</strong> {user.role}
                  </p>
                )}
                {user.createdAt && (
                  <p>
                    <strong>📅 Criado em:</strong>{' '}
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button onClick={fetchUsers} className="btn-secondary">
          🔄 Atualizar Lista
        </button>
      </div>
    </div>
  );
}

export default UserPage;
