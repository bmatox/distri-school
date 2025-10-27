import { useState, useEffect } from 'react';
import { professorService } from '../services/professorService';
import './ProfessorPage.css';

function ProfessorPage() {
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    especialidade: '',
    dataContratacao: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchProfessores();
  }, []);

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      const data = await professorService.getAll();
      setProfessores(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar professores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await professorService.create(formData);
      setShowForm(false);
      setFormData({
        nome: '',
        email: '',
        especialidade: '',
        dataContratacao: new Date().toISOString().split('T')[0],
      });
      fetchProfessores();
    } catch (err) {
      setError(`Erro ao criar professor: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este professor?')) {
      return;
    }
    try {
      await professorService.delete(id);
      fetchProfessores();
    } catch (err) {
      setError(`Erro ao excluir professor: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Professores</h2>
        <p className="loading">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestão de Professores</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '❌ Cancelar' : '➕ Novo Professor'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Cadastrar Novo Professor</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome Completo *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="especialidade">Especialidade *</label>
              <input
                type="text"
                id="especialidade"
                name="especialidade"
                value={formData.especialidade}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dataContratacao">Data de Contratação *</label>
              <input
                type="date"
                id="dataContratacao"
                name="dataContratacao"
                value={formData.dataContratacao}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">
                💾 Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {professores.length === 0 ? (
        <div className="empty-state">
          <p>📋 Nenhum professor cadastrado.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Cadastrar Primeiro Professor
          </button>
        </div>
      ) : (
        <div className="grid-container">
          {professores.map((professor) => (
            <div key={professor.id} className="entity-card">
              <div className="card-header">
                <h3>{professor.nome}</h3>
                <button
                  onClick={() => handleDelete(professor.id)}
                  className="btn-delete"
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
              <div className="card-body">
                <p>
                  <strong>📧 Email:</strong> {professor.email}
                </p>
                <p>
                  <strong>📚 Especialidade:</strong> {professor.especialidade}
                </p>
                <p>
                  <strong>📅 Contratação:</strong>{' '}
                  {new Date(professor.dataContratacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button onClick={fetchProfessores} className="btn-secondary">
          🔄 Atualizar Lista
        </button>
      </div>
    </div>
  );
}

export default ProfessorPage;
