import { useState, useEffect } from 'react';
import { cursoService } from '../services/cursoService';
import { turmaService } from '../services/turmaService';
import './CursoTurmaPage.css';

function CursoTurmaPage() {
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cursos'); // 'cursos' or 'turmas'
  const [showCursoForm, setShowCursoForm] = useState(false);
  const [showTurmaForm, setShowTurmaForm] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [editingTurma, setEditingTurma] = useState(null);
  
  const [cursoFormData, setCursoFormData] = useState({
    nome: '',
    descricao: '',
    duracaoSemestres: 8,
  });

  // Predefined list of Brazilian university courses
  const cursosDisponiveis = [
    'Administração',
    'Análise e Desenvolvimento de Sistemas',
    'Arquitetura e Urbanismo',
    'Biomedicina',
    'Cinema e Audiovisual',
    'Ciência da Computação',
    'Ciências Contábeis',
    'Ciências Econômicas',
    'Comércio Exterior',
    'Design de Interiores',
    'Design de Moda',
    'Direito',
    'Educação Física',
    'Enfermagem',
    'Engenharia Civil',
    'Engenharia de Controle e Automação',
    'Engenharia de Produção',
    'Engenharia Elétrica',
    'Engenharia Mecânica',
    'Engenharia Urbana e Ambiental',
    'Estética e Cosmética',
    'Farmácia',
    'Finanças',
    'Fisioterapia',
    'Gastronomia',
    'Gestão de Recursos Humanos',
    'Jornalismo',
    'Logística',
    'Marketing',
    'Medicina',
    'Medicina Veterinária',
    'Moda',
    'Negócios',
    'Nutrição',
    'Odontologia',
    'Psicologia',
    'Publicidade e Propaganda',
    'Sistemas de Informação',
    'Turismo',
  ];

  const [turmaFormData, setTurmaFormData] = useState({
    nome: '',
    cursoId: '',
    ano: new Date().getFullYear(),
    semestre: 1,
  });

  useEffect(() => {
    fetchCursos();
    fetchTurmas();
  }, []);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const data = await cursoService.getAll();
      setCursos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar cursos:', err);
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

  const handleCursoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCurso) {
        await cursoService.update(editingCurso.id, cursoFormData);
      } else {
        await cursoService.create(cursoFormData);
      }
      setShowCursoForm(false);
      setEditingCurso(null);
      resetCursoForm();
      fetchCursos();
    } catch (err) {
      setError(`Erro ao ${editingCurso ? 'atualizar' : 'criar'} curso: ${err.message}`);
    }
  };

  const handleDeleteCurso = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) {
      return;
    }
    try {
      await cursoService.delete(id);
      fetchCursos();
    } catch (err) {
      setError(`Erro ao excluir curso: ${err.message}`);
    }
  };

  const handleEditCurso = (curso) => {
    setEditingCurso(curso);
    setCursoFormData({
      nome: curso.nome,
      descricao: curso.descricao,
      duracaoSemestres: curso.duracaoSemestres,
    });
    setShowCursoForm(true);
  };

  const handleTurmaSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the curso object
      const curso = cursos.find(c => c.id === parseInt(turmaFormData.cursoId));
      if (!curso) {
        setError('Curso não encontrado');
        return;
      }

      const payload = {
        nome: turmaFormData.nome,
        curso: curso,
        ano: parseInt(turmaFormData.ano),
        semestre: parseInt(turmaFormData.semestre),
      };

      if (editingTurma) {
        await turmaService.update(editingTurma.id, payload);
      } else {
        await turmaService.create(payload);
      }
      setShowTurmaForm(false);
      setEditingTurma(null);
      resetTurmaForm();
      fetchTurmas();
    } catch (err) {
      setError(`Erro ao ${editingTurma ? 'atualizar' : 'criar'} turma: ${err.message}`);
    }
  };

  const handleDeleteTurma = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta turma?')) {
      return;
    }
    try {
      await turmaService.delete(id);
      fetchTurmas();
    } catch (err) {
      setError(`Erro ao excluir turma: ${err.message}`);
    }
  };

  const handleEditTurma = (turma) => {
    setEditingTurma(turma);
    setTurmaFormData({
      nome: turma.nome,
      cursoId: turma.curso?.id || '',
      ano: turma.ano,
      semestre: turma.semestre,
    });
    setShowTurmaForm(true);
  };

  const resetCursoForm = () => {
    setCursoFormData({
      nome: '',
      descricao: '',
      duracaoSemestres: 8,
    });
    setEditingCurso(null);
  };

  const resetTurmaForm = () => {
    setTurmaFormData({
      nome: '',
      cursoId: '',
      ano: new Date().getFullYear(),
      semestre: 1,
    });
    setEditingTurma(null);
  };

  const handleCursoChange = (e) => {
    const { name, value } = e.target;
    
    // If nome is changed, auto-generate description
    if (name === 'nome' && value) {
      setCursoFormData((prev) => ({
        ...prev,
        nome: value,
        descricao: `Curso de graduação em ${value}`,
      }));
    } else {
      setCursoFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTurmaChange = (e) => {
    const { name, value } = e.target;
    setTurmaFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTurnoChange = (turno) => {
    setTurmaFormData((prev) => ({
      ...prev,
      nome: generateTurmaNomeWithTurno(turno, prev.ano, prev.semestre),
    }));
  };

  const generateTurmaNomeWithTurno = (turno, ano, semestre) => {
    return `${turno}-${ano}.${semestre}`;
  };

  useEffect(() => {
    // When ano or semestre changes, update the turma name with current turno
    if (turmaFormData.nome) {
      const turno = turmaFormData.nome.split('-')[0];
      if (turno && (turmaFormData.ano || turmaFormData.semestre)) {
        const newNome = generateTurmaNomeWithTurno(turno, turmaFormData.ano, turmaFormData.semestre);
        if (newNome !== turmaFormData.nome) {
          setTurmaFormData((prev) => ({
            ...prev,
            nome: newNome,
          }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmaFormData.ano, turmaFormData.semestre]);

  if (loading) {
    return (
      <div className="page-container">
        <h2>Cursos e Turmas</h2>
        <p className="loading">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestão de Cursos e Turmas</h2>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'cursos' ? 'active' : ''}`}
          onClick={() => setActiveTab('cursos')}
        >
          📚 Cursos
        </button>
        <button
          className={`tab-button ${activeTab === 'turmas' ? 'active' : ''}`}
          onClick={() => setActiveTab('turmas')}
        >
          🎓 Turmas
        </button>
      </div>

      {/* Cursos Tab */}
      {activeTab === 'cursos' && (
        <div className="tab-content">
          <div className="tab-header">
            <h3>Cursos Cadastrados</h3>
            <button onClick={() => setShowCursoForm(!showCursoForm)} className="btn-primary">
              {showCursoForm ? '❌ Cancelar' : '➕ Novo Curso'}
            </button>
          </div>

          {showCursoForm && (
            <div className="form-card">
              <h3>{editingCurso ? 'Editar Curso' : 'Cadastrar Novo Curso'}</h3>
              <form onSubmit={handleCursoSubmit}>
                <div className="form-group">
                  <label htmlFor="nome">Nome do Curso *</label>
                  <select
                    id="nome"
                    name="nome"
                    value={cursoFormData.nome}
                    onChange={handleCursoChange}
                    required
                  >
                    <option value="">Selecione um curso</option>
                    {cursosDisponiveis.map((curso) => (
                      <option key={curso} value={curso}>
                        {curso}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={cursoFormData.descricao}
                    onChange={handleCursoChange}
                    placeholder="Descrição do curso (gerada automaticamente)"
                    rows="3"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="duracaoSemestres">Duração (semestres) *</label>
                  <input
                    type="number"
                    id="duracaoSemestres"
                    name="duracaoSemestres"
                    value={cursoFormData.duracaoSemestres}
                    onChange={handleCursoChange}
                    required
                    min="1"
                    max="20"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-success">
                    💾 {editingCurso ? 'Atualizar' : 'Salvar'} Curso
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCursoForm(false);
                      resetCursoForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {cursos.length === 0 ? (
            <div className="empty-state">
              <p>📋 Nenhum curso cadastrado.</p>
            </div>
          ) : (
            <div className="grid-container">
              {cursos.map((curso) => (
                <div key={curso.id} className="entity-card">
                  <div className="card-header">
                    <h3>{curso.nome}</h3>
                    <div className="card-actions-inline">
                      <button
                        onClick={() => handleEditCurso(curso)}
                        className="btn-edit"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCurso(curso.id)}
                        className="btn-delete"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {curso.descricao && (
                      <p>
                        <strong>📄 Descrição:</strong> {curso.descricao}
                      </p>
                    )}
                    <p>
                      <strong>⏱️ Duração:</strong> {curso.duracaoSemestres} semestres
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Turmas Tab */}
      {activeTab === 'turmas' && (
        <div className="tab-content">
          <div className="tab-header">
            <h3>Turmas Cadastradas</h3>
            <button onClick={() => setShowTurmaForm(!showTurmaForm)} className="btn-primary">
              {showTurmaForm ? '❌ Cancelar' : '➕ Nova Turma'}
            </button>
          </div>

          {showTurmaForm && (
            <div className="form-card">
              <h3>{editingTurma ? 'Editar Turma' : 'Cadastrar Nova Turma'}</h3>
              <form onSubmit={handleTurmaSubmit}>
                <div className="form-group">
                  <label htmlFor="cursoId">Curso *</label>
                  <select
                    id="cursoId"
                    name="cursoId"
                    value={turmaFormData.cursoId}
                    onChange={handleTurmaChange}
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
                <div className="form-row">
                  <div className="form-group">
                    <label>Turno *</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="turno"
                          value="M"
                          checked={turmaFormData.nome.startsWith('M')}
                          onChange={(e) => handleTurnoChange(e.target.value)}
                          required
                        />
                        Matutino (M)
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="turno"
                          value="N"
                          checked={turmaFormData.nome.startsWith('N')}
                          onChange={(e) => handleTurnoChange(e.target.value)}
                        />
                        Noturno (N)
                      </label>
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ano">Ano *</label>
                    <input
                      type="number"
                      id="ano"
                      name="ano"
                      value={turmaFormData.ano}
                      onChange={handleTurmaChange}
                      required
                      min="2020"
                      max="2030"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="semestre">Semestre *</label>
                    <select
                      id="semestre"
                      name="semestre"
                      value={turmaFormData.semestre}
                      onChange={handleTurmaChange}
                      required
                    >
                      <option value="1">1º Semestre</option>
                      <option value="2">2º Semestre</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="nome">Nome da Turma (Preview)</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={turmaFormData.nome || 'M-2025.1'}
                    readOnly
                    disabled
                  />
                  <small>Formato: Turno-Ano.Semestre (Ex: M-2025.1, N-2025.2)</small>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-success">
                    💾 {editingTurma ? 'Atualizar' : 'Salvar'} Turma
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTurmaForm(false);
                      resetTurmaForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {turmas.length === 0 ? (
            <div className="empty-state">
              <p>📋 Nenhuma turma cadastrada.</p>
            </div>
          ) : (
            <div className="grid-container">
              {turmas.map((turma) => (
                <div key={turma.id} className="entity-card">
                  <div className="card-header">
                    <h3>{turma.nome}</h3>
                    <div className="card-actions-inline">
                      <button
                        onClick={() => handleEditTurma(turma)}
                        className="btn-edit"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTurma(turma.id)}
                        className="btn-delete"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>📚 Curso:</strong> {turma.curso?.nome || 'N/A'}
                    </p>
                    <p>
                      <strong>📅 Ano:</strong> {turma.ano}
                    </p>
                    <p>
                      <strong>📆 Semestre:</strong> {turma.semestre}º
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="page-actions">
        <button onClick={() => { fetchCursos(); fetchTurmas(); }} className="btn-secondary">
          🔄 Atualizar Lista
        </button>
      </div>
    </div>
  );
}

export default CursoTurmaPage;
