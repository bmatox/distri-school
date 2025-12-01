import { useState, useEffect } from 'react';
import { professorService } from '../services/professorService';
import { turmaService } from '../services/turmaService';
import './ProfessorPage.css';

function ProfessorPage() {
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    especialidade: '',
    dataContratacao: '',
    turmaId: '',
  });

  useEffect(() => {
    fetchProfessores();
    fetchTurmas();
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

  const fetchTurmas = async () => {
    try {
      const data = await turmaService.getAll();
      setTurmas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
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

  const handleEdit = (professor) => {
    setEditingProfessor(professor);
    setFormData({
      nome: professor.nome,
      email: professor.email,
      especialidade: professor.especialidade,
      dataContratacao: professor.dataContratacao,
      turmaId: professor.turmaId || '',
    });
    setShowEditForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await professorService.update(editingProfessor.id, formData);
      setShowEditForm(false);
      setEditingProfessor(null);
      resetForm();
      fetchProfessores();
    } catch (err) {
      setError(`Erro ao atualizar professor: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      especialidade: '',
      dataContratacao: '',
      turmaId: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getTurmaNome = (turmaId) => {
    if (!turmaId) return 'Nenhuma';
    const turma = turmas.find(t => t.id === turmaId);
    return turma ? `${turma.nome} - ${turma.curso?.nome || 'N/A'}` : 'N/A';
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
        <div className="info-badge">
          <p>💡 Para cadastrar novos professores, acesse a aba <strong>Usuários</strong> e selecione o perfil "Professor"</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}

      {showEditForm && editingProfessor && (
        <div className="form-card">
          <h3>Editar Professor</h3>
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
            <div className="form-group">
              <label htmlFor="turmaId">Turma (opcional)</label>
              <select
                id="turmaId"
                name="turmaId"
                value={formData.turmaId}
                onChange={handleChange}
              >
                <option value="">Nenhuma turma selecionada</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome} - {turma.curso?.nome || 'N/A'}
                  </option>
                ))}
              </select>
              <small>Se selecionado, a especialidade deve ser compatível com o curso da turma</small>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">
                💾 Salvar Alterações
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingProfessor(null);
                  resetForm();
                }}
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
          <p className="empty-state-hint">Cadastre professores na aba Usuários selecionando o perfil "Professor"</p>
        </div>
      ) : (
        <div className="grid-container">
          {professores.map((professor) => (
            <div key={professor.id} className="entity-card">
              <div className="card-header">
                <h3>{professor.nome}</h3>
                <div className="card-actions-inline">
                  <button
                    onClick={() => handleEdit(professor)}
                    className="btn-edit"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(professor.id)}
                    className="btn-delete"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <strong>📧 Email:</strong> {professor.email}
                </p>
                <p>
                  <strong>📚 Especialidade:</strong> {professor.especialidade}
                </p>
                <p>
                  <strong>🎓 Turma:</strong> {getTurmaNome(professor.turmaId)}
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
