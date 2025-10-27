import { useState, useEffect } from 'react';
import './ProfessorList.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:54717';

function ProfessorList() {
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfessores();
  }, []);

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/professores`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar professores: ${response.status}`);
      }
      
      const data = await response.json();
      setProfessores(data.content || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar professores:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="professor-list">
        <h2>Lista de Professores</h2>
        <p className="loading">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="professor-list">
        <h2>Lista de Professores</h2>
        <div className="error">
          <p>❌ {error}</p>
          <button onClick={fetchProfessores}>Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="professor-list">
      <h2>Lista de Professores</h2>
      
      {professores.length === 0 ? (
        <p className="empty-message">Nenhum professor cadastrado.</p>
      ) : (
        <div className="professor-grid">
          {professores.map((professor) => (
            <div key={professor.id} className="professor-card">
              <h3>{professor.nome}</h3>
              <p><strong>Email:</strong> {professor.email}</p>
              <p><strong>Especialidade:</strong> {professor.especialidade}</p>
              <p><strong>Data de Contratação:</strong> {new Date(professor.dataContratacao).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={fetchProfessores} className="refresh-button">
        🔄 Atualizar Lista
      </button>
    </div>
  );
}

export default ProfessorList;
