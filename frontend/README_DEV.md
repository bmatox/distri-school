# DistriSchool Frontend - Guia de Desenvolvimento

## 🎯 Visão Geral

O frontend do DistriSchool é uma aplicação React moderna que implementa dashboards específicos para cada tipo de usuário no sistema de gestão escolar.

## 🏗️ Arquitetura

### Estrutura de Pastas

```
frontend/src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx      # Cabeçalho com info do usuário
│   ├── Navigation.jsx  # Menu dinâmico por role
│   ├── Footer.jsx      # Rodapé
│   └── ProtectedRoute.jsx  # HOC para proteção de rotas
│
├── pages/              # Páginas/Dashboards
│   ├── Login.jsx       # Página de autenticação
│   ├── AdminDashboard.jsx          # Dashboard do Administrador
│   ├── StudentDashboard.jsx        # Dashboard do Aluno
│   ├── TeacherDashboard.jsx        # Dashboard do Professor
│   ├── TechnicalAdminDashboard.jsx # Dashboard do Técnico
│   ├── UserPage.jsx    # Gestão de usuários (Admin only)
│   ├── ProfessorPage.jsx  # Lista de professores (Admin only)
│   └── AlunoPage.jsx   # Lista de alunos (Admin only)
│
├── context/            # Context API
│   └── AuthContext.jsx # Gerencia autenticação e usuário
│
├── services/           # Serviços de API
│   ├── api.js         # Cliente HTTP configurado
│   ├── userService.js # Serviço de usuários
│   ├── professorService.js  # Serviço de professores
│   └── alunoService.js      # Serviço de alunos
│
├── App.jsx            # Componente raiz com rotas
└── main.jsx           # Entry point
```

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

```javascript
// 1. Usuário faz login
const { login } = useAuth();
login(token, userData); // Armazena no localStorage

// 2. AuthContext disponibiliza dados do usuário
const { user, isAuthenticated, hasRole } = useAuth();

// 3. Rotas protegidas verificam autenticação
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// 4. Rotas específicas verificam role
<ProtectedRoute requiredRole="ADMIN">
  <UserPage />
</ProtectedRoute>
```

### Roles Disponíveis

```javascript
const ROLES = {
  ADMIN: 'ADMIN',                    // Administrador
  TEACHER: 'TEACHER',                // Professor
  STUDENT: 'STUDENT',                // Aluno
  TECHNICAL_ADMIN: 'TECHNICAL_ADMIN' // Técnico Administrativo
};
```

## 🎨 Sistema de Design

### Paleta de Cores

```css
/* Cores Principais */
--color-lightest: #DEDEFF;  /* Backgrounds claros */
--color-light: #B2B2FF;     /* Hover states */
--color-medium: #8585FF;    /* Borders, accents */
--color-bright: #5555FF;    /* Highlights */
--color-primary: #0000FF;   /* Botões primários */
--color-dark: #0000A0;      /* Header/Footer */
--color-darkest: #00004E;   /* Textos principais */
```

### Componentes de UI

Todos os componentes seguem o mesmo padrão de design:

```jsx
// Card padrão
<div className="dashboard-card">
  <div className="card-icon">🎓</div>
  <h2>Título</h2>
  <p>Descrição</p>
  <div className="card-actions">
    <span>Ação</span>
  </div>
</div>
```

## 📱 Responsividade

### Breakpoints

```css
/* Desktop */
@media (min-width: 1024px) { ... }

/* Tablet */
@media (max-width: 1024px) { ... }

/* Mobile */
@media (max-width: 768px) { ... }

/* Mobile Pequeno */
@media (max-width: 480px) { ... }
```

### Técnicas Utilizadas

1. **CSS Grid Responsivo:**
   ```css
   grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
   ```

2. **Tamanhos de Fonte Fluidos:**
   ```css
   font-size: clamp(0.875rem, 2vw, 1rem);
   ```

3. **Flexbox Dinâmico:**
   ```css
   display: flex;
   flex-wrap: wrap;
   gap: var(--spacing-md);
   ```

## 🛠️ Desenvolvimento

### Comandos Disponíveis

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

### Adicionando um Novo Dashboard

1. **Criar o componente:**
   ```jsx
   // src/pages/NewRoleDashboard.jsx
   import { useAuth } from '../context/AuthContext';
   import './RoleDashboard.css';

   function NewRoleDashboard() {
     const { user } = useAuth();

     return (
       <div className="dashboard">
         <div className="dashboard-header">
           <h1>Portal do Novo Role</h1>
           <p>Bem-vindo, {user?.name}!</p>
         </div>
         {/* Cards aqui */}
       </div>
     );
   }

   export default NewRoleDashboard;
   ```

2. **Adicionar ao DashboardRouter:**
   ```jsx
   // src/App.jsx
   function DashboardRouter() {
     const { user } = useAuth();
     
     switch (user.role) {
       case 'NEW_ROLE':
         return <NewRoleDashboard />;
       // ... outros casos
     }
   }
   ```

3. **Atualizar navegação:**
   ```jsx
   // src/components/Navigation.jsx
   const getNavigationItems = () => {
     switch (user.role) {
       case 'NEW_ROLE':
         return [
           { path: '/', label: '🏠 Painel', exact: true },
           // ... outros itens
         ];
     }
   };
   ```

### Adicionando uma Nova Rota Protegida

```jsx
// src/App.jsx
<Route 
  path="/nova-rota" 
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <NovaPage />
    </ProtectedRoute>
  } 
/>
```

## 🧪 Testes

### Testes Manuais Recomendados

1. **Autenticação:**
   - [ ] Login com diferentes roles
   - [ ] Logout e limpeza de sessão
   - [ ] Token inválido/expirado

2. **Navegação:**
   - [ ] Cada role vê seu dashboard
   - [ ] Menu correto por role
   - [ ] Proteção de rotas funcionando

3. **Responsividade:**
   - [ ] Desktop
   - [ ] Tablet
   - [ ] Mobile
   - [ ] Mobile pequeno

4. **Acessibilidade:**
   - [ ] Navegação por teclado
   - [ ] Leitor de tela
   - [ ] Animações reduzidas

### Estrutura de Teste Sugerida

```javascript
// __tests__/DashboardRouter.test.jsx
import { render } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import DashboardRouter from '../components/DashboardRouter';

describe('DashboardRouter', () => {
  it('renders AdminDashboard for ADMIN role', () => {
    // Mock user with ADMIN role
    // Render DashboardRouter
    // Assert AdminDashboard is rendered
  });

  it('renders StudentDashboard for STUDENT role', () => {
    // ...
  });
});
```

## 📚 Boas Práticas

### Estilo de Código

1. **Componentes Funcionais:**
   ```javascript
   // ✅ Bom
   function MyComponent() { ... }

   // ❌ Evitar
   const MyComponent = () => { ... }
   ```

2. **Hooks no topo:**
   ```javascript
   function MyComponent() {
     const { user } = useAuth();  // ✅ Topo da função
     const [state, setState] = useState();
     
     // ... resto do código
   }
   ```

3. **PropTypes:**
   ```javascript
   import PropTypes from 'prop-types';

   MyComponent.propTypes = {
     title: PropTypes.string.isRequired,
     onClick: PropTypes.func,
   };
   ```

### CSS

1. **Use variáveis CSS:**
   ```css
   /* ✅ Bom */
   color: var(--color-primary);

   /* ❌ Evitar */
   color: #0000FF;
   ```

2. **Mobile First:**
   ```css
   /* ✅ Bom - Estilo base para mobile */
   .card { padding: 1rem; }

   /* Desktop override */
   @media (min-width: 768px) {
     .card { padding: 2rem; }
   }
   ```

3. **Classes semânticas:**
   ```css
   /* ✅ Bom */
   .dashboard-card { ... }
   .card-actions { ... }

   /* ❌ Evitar */
   .blue-box { ... }
   .mt-20 { ... }
   ```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_MOCK_API=false
```

### API Configuration

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro: "Cannot read property 'role' of null"**
   - Causa: user não está definido
   - Solução: Adicionar verificação `if (!user) return null;`

2. **Redirecionamento infinito**
   - Causa: Loop em ProtectedRoute
   - Solução: Verificar lógica de isAuthenticated()

3. **Estilos não aplicados**
   - Causa: CSS não importado
   - Solução: Verificar import no componente

4. **Build falha**
   - Causa: Erros de linting ou TypeScript
   - Solução: `npm run lint` para ver erros

## 📖 Recursos

### Documentação

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite Guide](https://vitejs.dev/guide/)

### Documentação do Projeto

- `docs/ROLE_BASED_DASHBOARDS.md` - Arquitetura técnica
- `docs/TEST_PLAN.md` - Plano de testes
- `docs/IMPLEMENTATION_SUMMARY.md` - Resumo da implementação

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commits descritivos
3. Execute `npm run lint` antes de commitar
4. Execute `npm run build` para verificar
5. Abra um Pull Request

## 📝 Licença

Este projeto é parte do DistriSchool - Sistema de Gestão Escolar Distribuído.

---

**Desenvolvido com ❤️ usando React + Vite**
