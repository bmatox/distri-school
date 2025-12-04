# 🗄️ Guia de Configuração do DBeaver para DistriSchool

Este documento fornece instruções detalhadas para configurar o DBeaver e conectar-se ao banco de dados PostgreSQL do DistriSchool.

## 📋 Pré-requisitos

- **DBeaver Community** ou **DBeaver Enterprise** instalado ([Download](https://dbeaver.io/download/))
- **DistriSchool** rodando (via Kubernetes ou Docker Compose)
- **PostgreSQL** acessível

## 🚀 Cenário 1: Conectar ao PostgreSQL via Kubernetes (Minikube)

### Passo 1: Expor o Serviço PostgreSQL

Quando o DistriSchool está rodando no Kubernetes, o PostgreSQL está em um service interno. Você precisa expô-lo localmente usando `port-forward`:

```powershell
# Abrir PowerShell e executar:
kubectl port-forward service/postgres-service 5432:5432
```

**Importante:** Mantenha este terminal aberto enquanto usa o DBeaver. O comando cria um túnel que mapeia a porta 5432 local para o PostgreSQL no Kubernetes.

### Passo 2: Criar Nova Conexão no DBeaver

1. **Abrir DBeaver**
2. Clicar em **"Database"** → **"New Database Connection"** (ou usar `Ctrl+N`)
3. Selecionar **"PostgreSQL"** e clicar em **"Next"**

### Passo 3: Configurar a Conexão

Preencha os campos com as seguintes informações:

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `distrischool_db` |
| **Username** | `postgres` |
| **Password** | `postgres` |
| **Show all databases** | ☑️ (marcar) |

![Exemplo de configuração](https://i.imgur.com/example.png)

### Passo 4: Testar a Conexão

1. Clicar em **"Test Connection"**
2. Se for a primeira vez, o DBeaver pedirá para baixar os drivers do PostgreSQL
   - Clicar em **"Download"** e aguardar
3. Se tudo estiver correto, aparecerá: **"Connected"** ✅

### Passo 5: Salvar e Conectar

1. Clicar em **"Finish"**
2. A conexão aparecerá no painel esquerdo do DBeaver
3. Expandir a conexão para ver os databases e schemas

## 🐳 Cenário 2: Conectar ao PostgreSQL via Docker Compose (Desenvolvimento Local)

### Passo 1: Verificar se PostgreSQL está Rodando

```bash
docker ps | grep postgres
```

Você deve ver um container PostgreSQL rodando na porta 5432.

### Passo 2: Criar Conexão no DBeaver

Seguir os mesmos passos do **Cenário 1 - Passos 2 a 5**, usando as mesmas credenciais:

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `distrischool_db` |
| **Username** | `postgres` |
| **Password** | `postgres` |

## 📊 Explorando os Schemas do DistriSchool

Após conectar, você verá a seguinte estrutura no DBeaver:

```
distrischool_db/
├── Schemas/
│   ├── public/
│   │   ├── Tables/
│   │   │   ├── users                    # Tabela de usuários (User Service)
│   │   │   ├── professores              # Tabela de professores (Professor Service)
│   │   │   ├── aluno                    # Tabela de alunos (Aluno Service)
│   │   │   ├── flyway_schema_history    # Histórico de migrations
│   │   │   └── ...
```

### Schemas por Microserviço

Embora todos os microserviços usem o mesmo database (`distrischool_db`), cada um gerencia suas próprias tabelas:

| Microserviço | Tabelas Principais | Schema |
|--------------|-------------------|--------|
| **User Service** | `users` | `public` |
| **Professor Service** | `professores`, `tecnicos_administrativos` | `public` |
| **Aluno Service** | `aluno` | `public` |

**Nota:** O padrão "Database per Service" é implementado através de tabelas separadas no mesmo database, mas cada serviço acessa apenas suas próprias tabelas.

## 🔍 Consultas Úteis para Monitoramento

### 1. Visualizar Todos os Usuários

```sql
SELECT id, name, email, role, user_type, external_id, created_at 
FROM users 
ORDER BY created_at DESC;
```

### 2. Visualizar Professores com Seus Usuários

```sql
SELECT 
    p.id AS professor_id,
    p.nome,
    p.email,
    p.especialidade,
    p.data_contratacao,
    p.user_id,
    u.name AS user_name,
    u.role AS user_role
FROM professores p
LEFT JOIN users u ON p.user_id = u.id
ORDER BY p.id DESC;
```

### 3. Visualizar Alunos com Seus Usuários

```sql
SELECT 
    a.id AS aluno_id,
    a.nome,
    a.matricula,
    a.turma,
    a.data_nascimento,
    a.user_id,
    u.name AS user_name,
    u.role AS user_role
FROM aluno a
LEFT JOIN users u ON a.user_id = u.id
ORDER BY a.id DESC;
```

### 4. Verificar Sincronização entre Serviços

```sql
-- Usuários TEACHER sem professor correspondente
SELECT u.id, u.name, u.email 
FROM users u
LEFT JOIN professores p ON u.id = p.user_id
WHERE u.role = 'TEACHER' AND p.id IS NULL;

-- Usuários STUDENT sem aluno correspondente
SELECT u.id, u.name, u.email 
FROM users u
LEFT JOIN aluno a ON u.id = a.user_id
WHERE u.role = 'STUDENT' AND a.id IS NULL;
```

### 5. Verificar Histórico de Migrations

```sql
SELECT installed_rank, version, description, type, script, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;
```

## 🛠️ Operações Comuns no DBeaver

### Visualizar Dados de uma Tabela

1. Expandir **"distrischool_db"** → **"Schemas"** → **"public"** → **"Tables"**
2. Clicar com botão direito na tabela (ex: `users`)
3. Selecionar **"View Data"** → **"All rows"**

### Executar Consultas SQL

1. Clicar em **"SQL Editor"** → **"New SQL Editor"** (ou `Ctrl+]`)
2. Escrever sua query SQL
3. Selecionar a query e pressionar `Ctrl+Enter` para executar

### Exportar Dados

1. Executar uma query ou visualizar uma tabela
2. Clicar com botão direito na grid de resultados
3. Selecionar **"Export Data"**
4. Escolher o formato (CSV, JSON, XML, etc.)

### Ver Estrutura de uma Tabela

1. Clicar com botão direito na tabela
2. Selecionar **"View Table"** ou usar `F4`
3. Ver colunas, constraints, indexes, foreign keys, etc.

## 🔄 Acompanhando Mudanças em Tempo Real

### Método 1: Auto-Refresh

1. Visualizar dados de uma tabela
2. Clicar no ícone de **"Auto Refresh"** (⟳) na toolbar
3. Configurar intervalo (ex: 5 segundos)
4. As mudanças aparecerão automaticamente

### Método 2: Re-executar Query Manualmente

1. Deixar uma query aberta no SQL Editor
2. Pressionar `Ctrl+Enter` para re-executar quando quiser ver mudanças

### Método 3: Usar Triggers e Notificações (Avançado)

DBeaver suporta PostgreSQL LISTEN/NOTIFY para notificações em tempo real, mas isso requer configuração adicional.

## 🎯 Testando a Sincronização entre Microserviços

### Teste 1: Criar Usuário TEACHER e Verificar Criação de Professor

1. **Criar usuário via API**:
```bash
curl -X POST http://distrischool.local/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@test.com",
    "password": "senha123",
    "role": "TEACHER"
  }'
```

2. **Verificar no DBeaver**:
```sql
-- Ver o usuário criado
SELECT * FROM users WHERE email = 'joao.silva@test.com';

-- Ver o professor criado automaticamente (após alguns segundos)
SELECT * FROM professores WHERE email = 'joao.silva@test.com';
```

### Teste 2: Criar Professor e Verificar Criação de Usuário

1. **Criar professor via API**:
```bash
curl -X POST http://distrischool.local/api/v1/professores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "email": "maria.santos@test.com",
    "especialidade": "Matemática",
    "dataContratacao": "2025-01-01"
  }'
```

2. **Verificar no DBeaver**:
```sql
-- Ver o professor criado
SELECT * FROM professores WHERE email = 'maria.santos@test.com';

-- Ver o usuário criado automaticamente (após alguns segundos)
SELECT * FROM users WHERE email = 'maria.santos@test.com';
```

## ❗ Troubleshooting

### Problema: "Connection refused" ou "Connection timed out"

**Solução:**
- Verificar se o `kubectl port-forward` está rodando
- Verificar se o PostgreSQL está rodando: `kubectl get pods | grep postgres`
- Verificar se a porta 5432 não está sendo usada por outro processo

### Problema: "Password authentication failed"

**Solução:**
- Confirmar que está usando as credenciais corretas: `postgres` / `postgres`
- Verificar variáveis de ambiente do PostgreSQL deployment

### Problema: "Database distrischool_db does not exist"

**Solução:**
- O database é criado automaticamente pelo PostgreSQL deployment
- Verificar logs do pod PostgreSQL: `kubectl logs deployment/postgres-deployment`
- Se necessário, conectar ao database `postgres` (default) e criar manualmente:
```sql
CREATE DATABASE distrischool_db;
```

### Problema: Não vejo as tabelas

**Solução:**
- As tabelas são criadas pelas migrations Flyway quando os microserviços iniciam
- Verificar se os microserviços estão rodando: `kubectl get pods`
- Verificar logs dos serviços para ver se Flyway executou:
```bash
kubectl logs deployment/professor-tecadm-deployment | grep -i flyway
kubectl logs deployment/aluno-deployment | grep -i flyway
kubectl logs deployment/user-service-deployment | grep -i flyway
```

## 📚 Recursos Adicionais

- **DBeaver Documentation**: [https://dbeaver.io/docs/](https://dbeaver.io/docs/)
- **PostgreSQL Documentation**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **DistriSchool Architecture**: Ver `ARCHITECTURE.md` na raiz do projeto

## 💡 Dicas Avançadas

### 1. Criar Favoritos de Consultas

Salve suas consultas frequentes:
1. Escrever a query no SQL Editor
2. Clicar com botão direito → **"Add to Bookmarks"**
3. Acessar depois via **"SQL"** → **"Bookmarks"**

### 2. Usar ER Diagrams

Ver relacionamentos entre tabelas:
1. Selecionar múltiplas tabelas (Ctrl+Click)
2. Clicar com botão direito → **"View Diagram"**
3. DBeaver gera um diagrama ER automaticamente

### 3. Comparar Dados

Comparar dados entre duas execuções de uma query:
1. Executar query e salvar resultados
2. Esperar mudanças acontecerem
3. Re-executar query
4. Usar **"Compare Results"** na toolbar

---

**✅ Agora você está pronto para monitorar e debugar o banco de dados do DistriSchool!**
