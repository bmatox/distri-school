# Plano de Testes - Dashboards Baseados em Função

## Objetivo
Verificar que o sistema redireciona corretamente cada tipo de usuário para seu dashboard específico e que as restrições de acesso estão funcionando.

## Pré-requisitos
1. Sistema backend rodando (user-service, professor-service, aluno-service)
2. Banco de dados PostgreSQL com migrações aplicadas
3. Frontend rodando (npm run dev ou build servido)
4. Usuários de teste criados no banco de dados

## Casos de Teste

### Teste 1: Login do Administrador
**Objetivo:** Verificar que o administrador vê o dashboard completo com todas as funcionalidades.

**Passos:**
1. Acessar `/login`
2. Inserir credenciais:
   - Email: `admin@distrischool.com`
   - Senha: `admin123`
3. Clicar em "Entrar"

**Resultado Esperado:**
- ✅ Redirecionamento para `/`
- ✅ Exibição do "Painel do Administrador"
- ✅ Visualização de 3 cards: Usuários, Professores, Alunos
- ✅ Menu de navegação mostra: Painel, Usuários, Professores, Alunos
- ✅ Header mostra nome do usuário e "Administrador"
- ✅ Paleta de cores azul aplicada
- ✅ Cards com animações de hover
- ✅ Textos em português

**Testes Adicionais:**
- Clicar em cada card e verificar navegação
- Acessar `/usuarios` diretamente - deve funcionar
- Acessar `/professores` diretamente - deve funcionar
- Acessar `/alunos` diretamente - deve funcionar

---

### Teste 2: Login do Aluno
**Objetivo:** Verificar que o aluno vê apenas funcionalidades pertinentes a estudantes.

**Passos:**
1. Fazer logout se já estiver logado
2. Acessar `/login`
3. Inserir credenciais de aluno (criar via admin primeiro):
   - Email: `aluno@teste.com`
   - Senha: `senha123`
4. Clicar em "Entrar"

**Resultado Esperado:**
- ✅ Redirecionamento para `/`
- ✅ Exibição do "Portal do Aluno"
- ✅ Visualização de 6 cards: Disciplinas, Notas, Horário, Material, Frequência, Mensagens
- ✅ Menu mostra: Painel, Disciplinas, Notas, Horário
- ✅ Header mostra nome do aluno e "Aluno"
- ✅ **NÃO** exibe opções de Usuários, Professores
- ✅ Paleta azul aplicada
- ✅ Textos em português

**Testes de Segurança:**
- Tentar acessar `/usuarios` diretamente - deve redirecionar para `/`
- Tentar acessar `/professores` diretamente - deve redirecionar para `/`
- Tentar acessar `/alunos` diretamente - deve redirecionar para `/`

---

### Teste 3: Login do Professor
**Objetivo:** Verificar que o professor vê funcionalidades de ensino.

**Passos:**
1. Fazer logout
2. Acessar `/login`
3. Inserir credenciais de professor (criar via admin):
   - Email: `professor@teste.com`
   - Senha: `senha123`
4. Clicar em "Entrar"

**Resultado Esperado:**
- ✅ Redirecionamento para `/`
- ✅ Exibição do "Portal do Professor"
- ✅ Visualização de 6 cards: Turmas, Lançar Notas, Chamada, Plano de Aula, Avaliações, Material
- ✅ Menu mostra: Painel, Minhas Turmas, Notas, Frequência
- ✅ Header mostra nome e "Professor"
- ✅ **NÃO** exibe opções administrativas
- ✅ Paleta azul aplicada
- ✅ Textos em português

**Testes de Segurança:**
- Tentar acessar `/usuarios` diretamente - deve redirecionar para `/`
- Tentar acessar rotas administrativas - deve ser bloqueado

---

### Teste 4: Login do Técnico Administrativo
**Objetivo:** Verificar que o técnico vê funcionalidades de gestão administrativa.

**Passos:**
1. Fazer logout
2. Acessar `/login`
3. Inserir credenciais de técnico (criar via admin):
   - Email: `tecnico@teste.com`
   - Senha: `senha123`
4. Clicar em "Entrar"

**Resultado Esperado:**
- ✅ Redirecionamento para `/`
- ✅ Exibição do "Portal Técnico Administrativo"
- ✅ Visualização de 6 cards: Relatórios, Recursos, Agendamentos, Documentação, Comunicados, Atendimento
- ✅ Menu mostra: Painel, Relatórios, Recursos, Agendamentos
- ✅ Header mostra nome e "Técnico Administrativo"
- ✅ **NÃO** exibe gestão de usuários
- ✅ Paleta azul aplicada
- ✅ Textos em português

**Testes de Segurança:**
- Tentar acessar `/usuarios` - deve redirecionar para `/`

---

### Teste 5: Responsividade
**Objetivo:** Verificar que a interface se adapta a diferentes tamanhos de tela.

**Dispositivos para Testar:**
- Desktop (>1024px)
- Tablet (768px - 1024px)
- Mobile (480px - 768px)
- Mobile Pequeno (<480px)

**Elementos a Verificar:**
- ✅ Header permanece legível e funcional
- ✅ Menu de navegação se adapta (pode quebrar em múltiplas linhas)
- ✅ Cards do dashboard reorganizam em grid responsivo
- ✅ Texto usa tamanhos apropriados (clamp)
- ✅ Botões e inputs têm tamanho adequado para toque
- ✅ Scroll funciona corretamente
- ✅ Nenhum overflow horizontal

**Ferramentas:**
- Chrome DevTools (F12 > Toggle Device Toolbar)
- Firefox Responsive Design Mode
- Testar em dispositivos reais se possível

---

### Teste 6: Acessibilidade
**Objetivo:** Verificar recursos de acessibilidade.

**Testes:**
1. **Navegação por Teclado:**
   - Tab entre elementos
   - Enter para ativar botões/links
   - Escape para fechar modais

2. **Leitor de Tela:**
   - Testar com NVDA/JAWS (Windows) ou VoiceOver (Mac)
   - Verificar que elementos são anunciados corretamente

3. **Animações Reduzidas:**
   - No sistema operacional, ativar "Reduzir movimento"
   - Verificar que animações são minimizadas

4. **Alto Contraste:**
   - Ativar modo de alto contraste
   - Verificar que bordas ficam mais visíveis

---

### Teste 7: Logout
**Objetivo:** Verificar que o logout limpa a sessão corretamente.

**Passos:**
1. Fazer login com qualquer usuário
2. Clicar no botão "Sair" no header
3. Verificar redirecionamento para `/login`
4. Tentar voltar para `/` usando botão "Voltar" do navegador

**Resultado Esperado:**
- ✅ Redirecionamento imediato para `/login`
- ✅ Token JWT removido do localStorage
- ✅ Dados do usuário removidos do localStorage
- ✅ Tentativa de acessar rotas protegidas redireciona para login
- ✅ Não é possível voltar para página autenticada sem novo login

---

### Teste 8: Token Inválido/Expirado
**Objetivo:** Verificar comportamento com token inválido.

**Passos:**
1. Fazer login normalmente
2. Abrir DevTools > Application > Local Storage
3. Modificar ou remover o token
4. Tentar navegar para outra página

**Resultado Esperado:**
- ✅ Sistema detecta token inválido
- ✅ Redirecionamento automático para `/login`
- ✅ Mensagem de erro apropriada (se aplicável)

---

### Teste 9: Acesso Direto a URLs
**Objetivo:** Verificar proteção de rotas via URL direto.

**Cenários:**

**Usuário NÃO autenticado:**
- Acessar `/` → Redireciona para `/login`
- Acessar `/usuarios` → Redireciona para `/login`
- Acessar `/professores` → Redireciona para `/login`

**Usuário ALUNO autenticado:**
- Acessar `/` → Mostra StudentDashboard ✅
- Acessar `/usuarios` → Redireciona para `/` ✅
- Acessar `/professores` → Redireciona para `/` ✅

**Usuário PROFESSOR autenticado:**
- Acessar `/` → Mostra TeacherDashboard ✅
- Acessar `/usuarios` → Redireciona para `/` ✅

**Usuário ADMIN autenticado:**
- Acessar `/` → Mostra AdminDashboard ✅
- Acessar `/usuarios` → Funciona ✅
- Acessar `/professores` → Funciona ✅

---

### Teste 10: Tradução e Localização
**Objetivo:** Verificar que todos os textos estão em português.

**Elementos a Verificar:**
- ✅ Página de login
- ✅ Mensagens de erro
- ✅ Labels de formulários
- ✅ Títulos de dashboards
- ✅ Descrições de cards
- ✅ Botões de ação
- ✅ Menu de navegação
- ✅ Nomes de roles/funções
- ✅ Informações do header

---

## Checklist de Validação Final

### Funcionalidade
- [ ] Login funciona para todos os tipos de usuários
- [ ] Cada role vê seu dashboard específico
- [ ] Navegação mostra menus apropriados por role
- [ ] Rotas protegidas bloqueiam acesso não autorizado
- [ ] Logout funciona e limpa sessão

### Interface
- [ ] Paleta de cores azul aplicada consistentemente
- [ ] Todos os textos em português
- [ ] Animações suaves e atrativas
- [ ] Cards com hover effects
- [ ] Gradientes e sombras aplicados

### Responsividade
- [ ] Desktop (>1024px) - Layout completo
- [ ] Tablet (768-1024px) - Grid adaptado
- [ ] Mobile (480-768px) - Layout empilhado
- [ ] Mobile pequeno (<480px) - Totalmente funcional

### Acessibilidade
- [ ] Navegação por teclado funcional
- [ ] Suporte a leitores de tela
- [ ] Modo de animações reduzidas
- [ ] Alto contraste funcional
- [ ] Tamanhos de fonte responsivos (clamp)

### Segurança
- [ ] Rotas protegidas com ProtectedRoute
- [ ] Token JWT validado
- [ ] Acesso direto via URL bloqueado para não-autorizados
- [ ] Logout limpa todos os dados sensíveis
- [ ] Redirecionamentos apropriados

### Qualidade de Código
- [ ] Build sem erros
- [ ] Lint com 0 erros (1 warning pré-existente aceitável)
- [ ] Código bem organizado e legível
- [ ] Componentes reutilizáveis
- [ ] CSS modular e manutenível

---

## Relatório de Bugs

Use esta seção para documentar quaisquer bugs encontrados durante os testes:

| ID | Descrição | Severidade | Status | Resolução |
|----|-----------|------------|--------|-----------|
| - | - | - | - | - |

---

## Observações Adicionais

- O sistema usa JWT para autenticação
- Tokens são armazenados em localStorage
- Cada dashboard tem componentes placeholder que podem ser implementados futuramente
- A navegação é dinâmica e se adapta automaticamente ao role do usuário
- A paleta de cores é aplicada via CSS variables para fácil manutenção

---

## Conclusão

Este plano de testes cobre todos os aspectos críticos do sistema de dashboards baseados em função. Execute cada teste sistematicamente e documente os resultados para garantir que a implementação está completa e funcional.
