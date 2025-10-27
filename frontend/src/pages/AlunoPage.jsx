import { useState, useEffect } from 'react';
import { alunoService } from '../services/alunoService';
import './ProfessorPage.css';

function AlunoPage() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    email: '',
    dataNascimento: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
  });

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const data = await alunoService.getAll();
      setAlunos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar alunos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await alunoService.create(formData);
      setShowForm(false);
      setFormData({
        nome: '',
        matricula: '',
        email: '',
        dataNascimento: '',
        endereco: {
          rua: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      });
      fetchAlunos();
    } catch (err) {
      setError(`Erro ao criar aluno: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Alunos</h2>
        <p className="loading">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestão de Alunos</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '❌ Cancelar' : '➕ Novo Aluno'}
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
          <h3>Cadastrar Novo Aluno</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
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
                <label htmlFor="matricula">Matrícula *</label>
                <input
                  type="text"
                  id="matricula"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
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
                <label htmlFor="dataNascimento">Data de Nascimento *</label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <h4>Endereço</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endereco.rua">Rua *</label>
                <input
                  type="text"
                  id="endereco.rua"
                  name="endereco.rua"
                  value={formData.endereco.rua}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endereco.numero">Número *</label>
                <input
                  type="text"
                  id="endereco.numero"
                  name="endereco.numero"
                  value={formData.endereco.numero}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endereco.bairro">Bairro *</label>
                <input
                  type="text"
                  id="endereco.bairro"
                  name="endereco.bairro"
                  value={formData.endereco.bairro}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endereco.cidade">Cidade *</label>
                <input
                  type="text"
                  id="endereco.cidade"
                  name="endereco.cidade"
                  value={formData.endereco.cidade}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endereco.estado">Estado (UF) *</label>
                <input
                  type="text"
                  id="endereco.estado"
                  name="endereco.estado"
                  value={formData.endereco.estado}
                  onChange={handleChange}
                  maxLength="2"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endereco.cep">CEP *</label>
                <input
                  type="text"
                  id="endereco.cep"
                  name="endereco.cep"
                  value={formData.endereco.cep}
                  onChange={handleChange}
                  required
                />
              </div>
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

      {alunos.length === 0 ? (
        <div className="empty-state">
          <p>📋 Nenhum aluno cadastrado.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Cadastrar Primeiro Aluno
          </button>
        </div>
      ) : (
        <div className="grid-container">
          {alunos.map((aluno) => (
            <div key={aluno.id} className="entity-card">
              <div className="card-header">
                <h3>{aluno.nome}</h3>
              </div>
              <div className="card-body">
                <p>
                  <strong>🎫 Matrícula:</strong> {aluno.matricula}
                </p>
                <p>
                  <strong>📧 Email:</strong> {aluno.email}
                </p>
                <p>
                  <strong>🎂 Nascimento:</strong>{' '}
                  {new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}
                </p>
                {aluno.endereco && (
                  <p>
                    <strong>📍 Endereço:</strong>{' '}
                    {aluno.endereco.rua}, {aluno.endereco.numero} -{' '}
                    {aluno.endereco.bairro}, {aluno.endereco.cidade}/{aluno.endereco.estado}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button onClick={fetchAlunos} className="btn-secondary">
          🔄 Atualizar Lista
        </button>
      </div>
    </div>
  );
}

export default AlunoPage;
