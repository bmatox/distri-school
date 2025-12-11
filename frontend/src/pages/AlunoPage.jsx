import { useState, useEffect } from 'react';
import { alunoService } from '../services/alunoService';
import { turmaService } from '../services/turmaService';
import { cursoService } from '../services/cursoService';
import { Lightbulb, AlertCircle, Inbox, Edit2, Trash2, RefreshCw } from 'lucide-react';
import './ProfessorPage.css';

function AlunoPage() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAluno, setEditingAluno] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    contato: '',
    cursoId: '',
    turmaId: '',
    endereco: {
      rua: '',
      numero: '',
      cep: '',
      cidade: '',
      estado: '',
    },
  });

  useEffect(() => {
    fetchAlunos();
    fetchTurmas();
    fetchCursos();
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

  const fetchTurmas = async () => {
    try {
      const data = await turmaService.getAll();
      setTurmas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
    }
  };

  const fetchCursos = async () => {
    try {
      const data = await cursoService.getAll();
      setCursos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar cursos:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) {
      return;
    }
    try {
      await alunoService.delete(id);
      fetchAlunos();
    } catch (err) {
      setError(`Erro ao excluir aluno: ${err.message}`);
    }
  };

  const handleEdit = (aluno) => {
    setEditingAluno(aluno);
    // Convert date from dd-MM-yyyy to yyyy-MM-dd for HTML date input
    let formattedDate = '';
    if (aluno.dataNascimento) {
      // Check if date is in dd-MM-yyyy format
      if (aluno.dataNascimento.includes('-') && aluno.dataNascimento.split('-')[0].length === 2) {
        const [day, month, year] = aluno.dataNascimento.split('-');
        formattedDate = `${year}-${month}-${day}`;
      } else {
        // Already in yyyy-MM-dd format or ISO format
        formattedDate = aluno.dataNascimento.split('T')[0]; // Handle ISO datetime
      }
    }
    setFormData({
      nome: aluno.nome,
      dataNascimento: formattedDate,
      contato: aluno.contato,
      cursoId: aluno.cursoId || '',
      turmaId: aluno.turmaId || '',
      endereco: {
        rua: aluno.endereco?.rua || '',
        numero: aluno.endereco?.numero || '',
        cep: aluno.endereco?.cep || '',
        cidade: aluno.endereco?.cidade || '',
        estado: aluno.endereco?.estado || '',
      },
    });
    setShowEditForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert date from yyyy-MM-dd to dd-MM-yyyy for backend
      let formattedDate = formData.dataNascimento;
      if (formattedDate && formattedDate.includes('-')) {
        const [year, month, day] = formattedDate.split('-');
        if (year.length === 4) {
          // Convert from yyyy-MM-dd to dd-MM-yyyy
          formattedDate = `${day}-${month}-${year}`;
        }
      }
      
      await alunoService.update(editingAluno.id, {
        ...formData,
        dataNascimento: formattedDate,
        matricula: editingAluno.matricula, // Keep the original matricula
        userId: editingAluno.userId, // Keep the original userId
      });
      setShowEditForm(false);
      setEditingAluno(null);
      resetForm();
      fetchAlunos();
    } catch (err) {
      setError(`Erro ao atualizar aluno: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      dataNascimento: '',
      contato: '',
      cursoId: '',
      turmaId: '',
      endereco: {
        rua: '',
        numero: '',
        cep: '',
        cidade: '',
        estado: '',
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [name]: value,
      },
    }));
  };

  const getTurmaNome = (turmaId) => {
    if (!turmaId) return 'Nenhuma';
    const turma = turmas.find((t) => t.id === turmaId);
    return turma ? `${turma.nome} - ${turma.curso?.nome || 'N/A'}` : 'N/A';
  };

  const getCursoNome = (cursoId) => {
    if (!cursoId) return 'Nenhum';
    const curso = cursos.find((c) => c.id === cursoId);
    return curso ? curso.nome : 'N/A';
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return 'N/A';
    // Handle dd-MM-yyyy format from backend
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
      const [day, month, year] = dateStr.split('-');
      return new Date(`${year}-${month}-${day}`).toLocaleDateString('pt-BR');
    }
    // Handle other formats (ISO, yyyy-MM-dd)
    return new Date(dateStr).toLocaleDateString('pt-BR');
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
        <div className="info-badge">
          <p><Lightbulb size={18} style={{display: 'inline', marginRight: '8px'}} />Para cadastrar novos alunos, acesse a aba <strong>Usuários</strong> e selecione o perfil "Aluno"</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p><AlertCircle size={18} style={{display: 'inline', marginRight: '4px'}} />{error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}

      {showEditForm && editingAluno && (
        <div className="form-card">
          <h3>Editar Aluno</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="matricula">Matrícula (somente leitura)</label>
              <input
                type="text"
                id="matricula"
                value={editingAluno.matricula}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
              <small>A matrícula foi gerada automaticamente e não pode ser alterada</small>
            </div>
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
            <div className="form-group">
              <label htmlFor="contato">Contato *</label>
              <input
                type="text"
                id="contato"
                name="contato"
                value={formData.contato}
                onChange={handleChange}
                required
                minLength="12"
                maxLength="50"
                placeholder="(99) 99999-9999"
              />
              <small>Telefone ou email de contato (12-50 caracteres)</small>
            </div>
            <div className="form-group">
              <label htmlFor="cursoId">Curso (opcional)</label>
              <select
                id="cursoId"
                name="cursoId"
                value={formData.cursoId}
                onChange={handleChange}
              >
                <option value="">Nenhum curso selecionado</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
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
            </div>
            <fieldset style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <legend>Endereço</legend>
              <div className="form-group">
                <label htmlFor="rua">Rua</label>
                <input
                  type="text"
                  id="rua"
                  name="rua"
                  value={formData.endereco.rua}
                  onChange={handleEnderecoChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="numero">Número</label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.endereco.numero}
                  onChange={handleEnderecoChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cep">CEP</label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.endereco.cep}
                  onChange={handleEnderecoChange}
                  placeholder="00000-000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cidade">Cidade</label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.endereco.cidade}
                  onChange={handleEnderecoChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.endereco.estado}
                  onChange={handleEnderecoChange}
                  maxLength="2"
                  placeholder="SP"
                />
              </div>
            </fieldset>
            <div className="form-actions">
              <button type="submit" className="btn-success">
                Salvar Alterações
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAluno(null);
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

      {alunos.length === 0 ? (
        <div className="empty-state">
          <p><Inbox size={48} style={{display: 'block', margin: '0 auto 16px'}} />Nenhum aluno cadastrado.</p>
          <p className="empty-state-hint">Cadastre alunos na aba Usuários selecionando o perfil "Aluno"</p>
        </div>
      ) : (
        <div className="grid-container">
          {alunos.map((aluno) => (
            <div key={aluno.id} className="entity-card">
              <div className="card-header">
                <h3>{aluno.nome}</h3>
                <div className="card-actions-inline">
                  <button
                    onClick={() => handleEdit(aluno)}
                    className="btn-edit"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(aluno.id)}
                    className="btn-delete"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p>
                  <strong>Matrícula:</strong> {aluno.matricula}
                </p>
                <p>
                  <strong>Curso:</strong> {getCursoNome(aluno.cursoId)}
                </p>
                <p>
                  <strong>Turma:</strong> {getTurmaNome(aluno.turmaId)}
                </p>
                <p>
                  <strong>Contato:</strong> {aluno.contato}
                </p>
                <p>
                  <strong>Nascimento:</strong>{' '}
                  {formatDateForDisplay(aluno.dataNascimento)}
                </p>
                {aluno.endereco && (aluno.endereco.rua || aluno.endereco.cidade) && (
                  <p>
                    <strong>Endereço:</strong>{' '}
                    {aluno.endereco.rua && aluno.endereco.numero
                      ? `${aluno.endereco.rua}, ${aluno.endereco.numero}`
                      : aluno.endereco.rua || ''}
                    {aluno.endereco.cidade && aluno.endereco.estado
                      ? ` - ${aluno.endereco.cidade}/${aluno.endereco.estado}`
                      : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button onClick={fetchAlunos} className="btn-secondary">
          <RefreshCw size={16} style={{ marginRight: '6px' }} />
          Atualizar Lista
        </button>
      </div>
    </div>
  );
}

export default AlunoPage;
