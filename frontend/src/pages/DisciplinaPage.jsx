import { useState, useEffect } from 'react';
import { disciplinaService } from '../services/disciplinaService';
import { cursoService } from '../services/cursoService';
import { turmaService } from '../services/turmaService';
import './CursoTurmaPage.css';

function DisciplinaPage() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filteredTurmas, setFilteredTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cursoId: '',
    turmaId: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    // Filter turmas when curso changes
    if (formData.cursoId) {
      const filtered = turmas.filter(t => t.curso?.id === parseInt(formData.cursoId));
      setFilteredTurmas(filtered);
    } else {
      setFilteredTurmas([]);
    }
  }, [formData.cursoId, turmas]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [disciplinasData, cursosData, turmasData] = await Promise.all([
        disciplinaService.getAll(),
        cursoService.getAll(),
        turmaService.getAll(),
      ]);
      setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : []);
      setCursos(Array.isArray(cursosData) ? cursosData : []);
      setTurmas(Array.isArray(turmasData) ? turmasData : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the turma object
      const turma = turmas.find(t => t.id === parseInt(formData.turmaId));
      if (!turma) {
        setError('Turma não encontrada');
        return;
      }

      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        turma: turma,
        professores: [], // Empty array for now
      };

      if (editingDisciplina) {
        await disciplinaService.update(editingDisciplina.id, payload);
      } else {
        await disciplinaService.create(payload);
      }
      setShowForm(false);
      setEditingDisciplina(null);
      resetForm();
      fetchAll();
    } catch (err) {
      setError(`Erro ao ${editingDisciplina ? 'atualizar' : 'criar'} disciplina: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
      return;
    }
    try {
      await disciplinaService.delete(id);
      fetchAll();
    } catch (err) {
      setError(`Erro ao excluir disciplina: ${err.message}`);
    }
  };

  const handleEdit = (disciplina) => {
    setEditingDisciplina(disciplina);
    setFormData({
      nome: disciplina.nome,
      descricao: disciplina.descricao || '',
      cursoId: disciplina.turma?.curso?.id || '',
      turmaId: disciplina.turma?.id || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      cursoId: '',
      turmaId: '',
    });
    setEditingDisciplina(null);
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
        <h2>Disciplinas</h2>
        <p className="loading">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestão de Disciplinas</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '❌ Cancelar' : '➕ Nova Disciplina'}
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
          <h3>{editingDisciplina ? 'Editar Disciplina' : 'Cadastrar Nova Disciplina'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome da Disciplina *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Cálculo I, Programação Web, etc."
              />
            </div>
            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descrição da disciplina (opcional)"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cursoId">Curso *</label>
              <select
                id="cursoId"
                name="cursoId"
                value={formData.cursoId}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="turmaId">Turma *</label>
              <select
                id="turmaId"
                name="turmaId"
                value={formData.turmaId}
                onChange={handleChange}
                required
                disabled={!formData.cursoId}
              >
                <option value="">
                  {formData.cursoId ? 'Selecione uma turma' : 'Selecione um curso primeiro'}
                </option>
                {filteredTurmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome} - {turma.ano}.{turma.semestre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">
                💾 {editingDisciplina ? 'Atualizar' : 'Salvar'} Disciplina
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
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

      {disciplinas.length === 0 ? (
        <div className="empty-state">
          <p>📋 Nenhuma disciplina cadastrada.</p>
        </div>
      ) : (
        <div className="grid-container">
          {disciplinas.map((disciplina) => (
            <div key={disciplina.id} className="entity-card">
              <div className="card-header">
                <h3>{disciplina.nome}</h3>
                <div className="card-actions-inline">
                  <button
                    onClick={() => handleEdit(disciplina)}
                    className="btn-edit"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(disciplina.id)}
                    className="btn-delete"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="card-body">
                {disciplina.descricao && (
                  <p>
                    <strong>📄 Descrição:</strong> {disciplina.descricao}
                  </p>
                )}
                <p>
                  <strong>📚 Curso:</strong> {disciplina.turma?.curso?.nome || 'N/A'}
                </p>
                <p>
                  <strong>🎓 Turma:</strong> {disciplina.turma?.nome || 'N/A'}
                </p>
                {disciplina.turma && (
                  <p>
                    <strong>📅 Período:</strong> {disciplina.turma.ano}.{disciplina.turma.semestre}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button onClick={fetchAll} className="btn-secondary">
          🔄 Atualizar Lista
        </button>
      </div>
    </div>
  );
}

export default DisciplinaPage;
