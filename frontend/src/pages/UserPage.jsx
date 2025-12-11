import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
// import { alunoService } from '../services/alunoService'; // <-- REMOVIDO (Não é mais necessário)
import { cursoService } from '../services/cursoService';
import { turmaService } from '../services/turmaService';
import { Plus, X, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import './UserPage.css';

function UserPage() {
  const [users, setUsers] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',

    password: '',
    role: 'STUDENT',
    // Professor-specific fields
    especialidade: '',
    dataContratacao: new Date().toISOString().split('T')[0],
    // Aluno-specific fields
    // matricula: '', // <-- REMOVIDO
    cursoId: '',
    turmaId: '',
    contato: '',
    dataNascimento: '',
    endereco: {
      rua: '',
      numero: '',
      cidade: '',
      estado: '',
      cep: '',
    },
    // TecnicoAdmin-specific fields
    departamento: '',
    dataAdmissao: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchUsers();
    fetchCursos();
    fetchAllTurmas();
  }, []);

  // REMOVIDO: Bloco useEffect que carregava a matrícula (loadNextMatricula)
  // não é mais necessário.

  useEffect(() => {
    // Load turmas when curso changes
    if (formData.cursoId) {
      fetchTurmasByCurso(formData.cursoId);
    } else {
      setTurmas([]);
    }
  }, [formData.cursoId]);

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

  const fetchCursos = async () => {
    try {
      const data = await cursoService.getAll();
      setCursos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar cursos:', err);
    }
  };

  const fetchTurmasByCurso = async (cursoId) => {
    try {
      const data = await turmaService.getByCurso(cursoId);
      setTurmas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
    }
  };

  const fetchAllTurmas = async () => {
    try {
      const data = await turmaService.getAll();
      setTurmas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
    }
  };

  // REMOVIDO: Função loadNextMatricula()
  // não é mais necessária.

  const buildTeacherPayload = (basePayload) => ({
    ...basePayload,
    professorProfile: {
      especialidade: formData.especialidade,
      dataContratacao: formData.dataContratacao,
      turmaId: formData.turmaId ? parseInt(formData.turmaId) : null,
    },
  });

  const buildStudentPayload = (basePayload) => {
    // Build endereco object only if all fields are filled (after trimming)
    const hasCompleteAddress = formData.endereco.rua.trim() &&
        formData.endereco.numero.trim() &&
        formData.endereco.cidade.trim() &&
        formData.endereco.estado.trim() &&
        formData.endereco.cep.trim();

    const endereco = hasCompleteAddress ? {
      rua: formData.endereco.rua.trim(),
      numero: formData.endereco.numero.trim(),
      cidade: formData.endereco.cidade.trim(),
      estado: formData.endereco.estado.trim(),
      cep: formData.endereco.cep.trim(),
    } : null;

    return {
      ...basePayload,
      alunoProfile: {
        // matricula: formData.matricula, // <-- REMOVIDO
        cursoId: formData.cursoId ? parseInt(formData.cursoId) : null,
        turmaId: formData.turmaId ? parseInt(formData.turmaId) : null,
        contato: formData.contato.trim(),
        dataNascimento: formData.dataNascimento,
        endereco: endereco,
      },
    };
  };

  const buildTechnicalAdminPayload = (basePayload) => ({
    ...basePayload,
    tecnicoAdminProfile: {
      departamento: formData.departamento,
      dataAdmissao: formData.dataAdmissao,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate student-specific fields
      if (formData.role === 'STUDENT') {

        // REMOVIDO: Bloco de validação da matrícula.

        // Validate cursoId and turmaId (must be selected)
        if (!formData.cursoId || formData.cursoId === '') {
          setError('Selecione um curso.');
          return;
        }

        if (!formData.turmaId || formData.turmaId === '') {
          setError('Selecione uma turma.');
          return;
        }

        // Validate contato (must be at least 12 characters)
        if (formData.contato.length < 12) {
          setError('O contato deve ter pelo menos 12 caracteres. Ex: (11) 98765-4321');
          return;
        }

        // Validate dataNascimento (must be a past date)
        if (!formData.dataNascimento) {
          setError('A data de nascimento é obrigatória.');
          return;
        }

        const birthDate = new Date(formData.dataNascimento);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (birthDate >= today) {
          setError('A data de nascimento deve ser uma data no passado.');
          return;
        }

        // Validate endereco fields (trim to check for whitespace-only values)
        if (!formData.endereco.rua.trim() || !formData.endereco.numero.trim() ||
            !formData.endereco.cidade.trim() || !formData.endereco.estado.trim() ||
            !formData.endereco.cep.trim()) {
          setError('Todos os campos de endereço são obrigatórios e não podem conter apenas espaços.');
          return;
        }
      }

      // Build base payload
      let payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add profile-specific data based on role
      switch (formData.role) {
        case 'TEACHER':
          payload = buildTeacherPayload(payload);
          break;
        case 'STUDENT':
          payload = buildStudentPayload(payload);
          break;
        case 'TECHNICAL_ADMIN':
          payload = buildTechnicalAdminPayload(payload);
          break;
        default:
          // ADMIN role - no additional profile data needed
          break;
      }

      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      await userService.create(payload);

      // ATUALIZADO: Mensagem de sucesso genérica para alunos.
      if (payload.role === 'STUDENT') {
        alert(`Aluno criado com sucesso!\n\nA matrícula será gerada automaticamente pelo sistema.`);
      }

      setShowForm(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      // Try to extract validation details from the error response
      let errorMessage = 'Erro ao criar usuário: ';
      if (err.response && err.response.data) {
        const responseData = err.response.data;
        if (responseData.details && Array.isArray(responseData.details)) {
          errorMessage += '\n' + responseData.details.join('\n');
        } else if (responseData.message) {
          errorMessage += responseData.message;
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      especialidade: '',
      dataContratacao: new Date().toISOString().split('T')[0],
      // matricula: '', // <-- REMOVIDO
      cursoId: '',
      turmaId: '',
      contato: '',
      dataNascimento: '',
      endereco: {
        rua: '',
        numero: '',
        cidade: '',
        estado: '',
        cep: '',
      },
      departamento: '',
      dataAdmissao: new Date().toISOString().split('T')[0],
    });
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

  const getRoleName = (role) => {
    const roleNames = {
      ADMIN: 'Administrador',
      TEACHER: 'Professor',
      STUDENT: 'Aluno',
      TECHNICAL_ADMIN: 'Técnico Administrativo',
    };
    return roleNames[role] || role;
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
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Novo Usuário</>}
          </button>
        </div>

        {error && (
            <div className="error-message">
              <p><AlertCircle size={18} style={{display: 'inline', marginRight: '4px'}} />{error}</p>
              <button onClick={() => setError(null)}>Fechar</button>
            </div>
        )}

        {showForm && (
            <div className="form-card">
              <h3>Cadastrar Novo Usuário</h3>
              <form onSubmit={handleSubmit}>
                {/* Base User Information */}
                <div className="form-section">
                  <h4>Informações Básicas</h4>
                  <div className="form-group">
                    <label htmlFor="name">Nome Completo *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Nome completo do usuário"
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
                        placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Senha *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Senha de acesso"
                        minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Perfil *</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                      <option value="STUDENT">Aluno</option>
                      <option value="TEACHER">Professor</option>
                      <option value="TECHNICAL_ADMIN">Técnico Administrativo</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>

                {/* Professor-specific fields */}
                {formData.role === 'TEACHER' && (
                    <div className="form-section">
                      <h4>Informações do Professor</h4>
                      <div className="form-group">
                        <label htmlFor="especialidade">Especialidade *</label>
                        <select
                            id="especialidade"
                            name="especialidade"
                            value={formData.especialidade}
                            onChange={handleChange}
                            required
                        >
                          <option value="">Selecione uma especialidade</option>
                          <option value="Engenharia de Software">Engenharia de Software</option>
                          <option value="Ciência da Computação">Ciência da Computação</option>
                          <option value="Sistemas de Informação">Sistemas de Informação</option>
                          <option value="Matemática">Matemática</option>
                          <option value="Física">Física</option>
                          <option value="Química">Química</option>
                          <option value="Biologia">Biologia</option>
                          <option value="Administração">Administração</option>
                          <option value="Contabilidade">Contabilidade</option>
                          <option value="Economia">Economia</option>
                          <option value="Direito">Direito</option>
                          <option value="Pedagogia">Pedagogia</option>
                          <option value="Psicologia">Psicologia</option>
                          <option value="Engenharia Civil">Engenharia Civil</option>
                          <option value="Engenharia Elétrica">Engenharia Elétrica</option>
                          <option value="Engenharia Mecânica">Engenharia Mecânica</option>
                          <option value="Medicina">Medicina</option>
                          <option value="Enfermagem">Enfermagem</option>
                          <option value="Farmácia">Farmácia</option>
                          <option value="Arquitetura e Urbanismo">Arquitetura e Urbanismo</option>
                        </select>
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
                    </div>
                )}

                {/* Aluno-specific fields */}
                {formData.role === 'STUDENT' && (
                    <>
                      <div className="form-section">
                        <h4>Informações do Aluno</h4>

                        {/* REMOVIDO: Campo "Matrícula" do formulário */}

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="dataNascimento">Data de Nascimento *</label>
                            <input
                                type="date"
                                id="dataNascimento"
                                name="dataNascimento"
                                value={formData.dataNascimento}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <small>Deve ser uma data no passado</small>
                          </div>
                          <div className="form-group">
                            <label htmlFor="contato">Contato * (mínimo 12 caracteres)</label>
                            <input
                                type="text"
                                id="contato"
                                name="contato"
                                value={formData.contato}
                                onChange={handleChange}
                                required
                                minLength={12}
                                maxLength={50}
                                placeholder="Ex: (11) 98765-4321"
                            />
                            <small>Informe um telefone completo com DDD</small>
                          </div>
                        </div>
                        <div className="form-row">
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
                              {cursos.map(curso => (
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
                              <option value="">Selecione uma turma</option>
                              {turmas.map(turma => (
                                  <option key={turma.id} value={turma.id}>
                                    {turma.nome}
                                  </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="form-section">
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
                                placeholder="Ex: SP"
                            />
                          </div>
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
                              placeholder="Ex: 12345-678"
                          />
                        </div>
                      </div>
                    </>
                )}

                {/* TecnicoAdmin-specific fields */}
                {formData.role === 'TECHNICAL_ADMIN' && (
                    <div className="form-section">
                      <h4>Informações do Técnico Administrativo</h4>
                      <div className="form-group">
                        <label htmlFor="departamento">Departamento *</label>
                        <select
                            id="departamento"
                            name="departamento"
                            value={formData.departamento}
                            onChange={handleChange}
                            required
                        >
                          <option value="">Selecione um departamento</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="Secretaria Acadêmica">Secretaria Acadêmica</option>
                          <option value="Recursos Humanos">Recursos Humanos</option>
                          <option value="TI">TI</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="dataAdmissao">Data de Admissão *</label>
                        <input
                            type="date"
                            id="dataAdmissao"
                            name="dataAdmissao"
                            value={formData.dataAdmissao}
                            onChange={handleChange}
                            required
                        />
                      </div>
                    </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn-success">
                    Salvar Usuário
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

        {users.length === 0 ? (
            <div className="empty-state">
              <p><Inbox size={48} style={{display: 'block', margin: '0 auto 16px'}} />Nenhum usuário cadastrado.</p>
            </div>
        ) : (
            <div className="grid-container">
              {users.map((user) => (
                  <div key={user.id} className="entity-card">
                    <div className="card-header">
                      <h3>{user.name}</h3>
                    </div>
                    <div className="card-body">
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Perfil:</strong> {getRoleName(user.role)}
                      </p>
                      {user.userType && (
                          <p>
                            <strong>Tipo:</strong> {user.userType}
                          </p>
                      )}
                      {user.createdAt && (
                          <p>
                            <strong>Criado em:</strong>{' '}
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
            <RefreshCw size={16} style={{ marginRight: '6px' }} />
            Atualizar Lista
          </button>
        </div>
      </div>
  );
}

export default UserPage;