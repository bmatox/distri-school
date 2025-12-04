# 🔄 Sincronização Bidirecional entre Microsserviços

Este documento explica como a sincronização bidirecional entre os microsserviços User, Professor e Aluno funciona no DistriSchool.

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Comunicação](#arquitetura-de-comunicação)
3. [Fluxos de Sincronização](#fluxos-de-sincronização)
4. [Detalhes de Implementação](#detalhes-de-implementação)
5. [Testando a Sincronização](#testando-a-sincronização)
6. [Troubleshooting](#troubleshooting)

## Visão Geral

O DistriSchool implementa **sincronização bidirecional automática** entre os microsserviços usando RabbitMQ como message broker. Isso significa que:

- ✅ Criar um **User** com role TEACHER → Automaticamente cria um **Professor**
- ✅ Criar um **User** com role STUDENT → Automaticamente cria um **Aluno**
- ✅ Criar um **Professor** → Automaticamente cria um **User** com role TEACHER
- ✅ Criar um **Aluno** → Automaticamente cria um **User** com role STUDENT

## Arquitetura de Comunicação

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                         RabbitMQ                                 │
│           Exchange: distrischool.events.exchange                 │
│                      (Topic Exchange)                            │
└────────┬────────────────────┬──────────────────┬─────────────────┘
         │                    │                  │
         │ user.*             │ professor.*      │ aluno.*
         │                    │                  │
    ┌────▼─────┐         ┌────▼─────┐      ┌────▼─────┐
    │ Professor│         │   User   │      │   User   │
    │ Service  │         │ Service  │      │ Service  │
    │ (Queue)  │         │ (Queue)  │      │ (Queue)  │
    └────┬─────┘         └────┬─────┘      └────┬─────┘
         │                    │                  │
         │ Creates            │ Creates          │ Creates
         ▼                    ▼                  ▼
    [Professor]           [User]             [User]
     Record                Record             Record
```

### Queues e Bindings

| Service | Queue | Routing Key | Purpose |
|---------|-------|-------------|---------|
| Professor | `professor-service.user-events` | `user.*` | Recebe eventos de User |
| Aluno | `aluno-service.user-events` | `user.*` | Recebe eventos de User |
| User | `user-service.professor-events` | `professor.*` | Recebe eventos de Professor |
| User | `user-service.aluno-events` | `aluno.*` | Recebe eventos de Aluno |

## Fluxos de Sincronização

### Fluxo 1: Criar User → Cria Professor/Aluno

#### Cenário 1A: User com role TEACHER

```
1. POST /api/users
   Body: {
     "name": "João Silva",
     "email": "joao@example.com",
     "password": "senha123",
     "role": "TEACHER"
   }

2. User Service:
   - Salva usuário no banco
   - Publica evento: user.created (routing key)

3. RabbitMQ:
   - Encaminha para queue: professor-service.user-events

4. Professor Service (UserEventListener):
   - Recebe evento
   - Verifica: role == "TEACHER" && type == "CREATED"
   - Verifica se já existe professor com userId
   - Cria registro de Professor:
     * nome = João Silva
     * email = joao@example.com
     * userId = [ID do user criado]
     * especialidade = "A definir" (default)
     * dataContratacao = data atual

Resultado: ✅ User criado + Professor criado automaticamente
```

#### Cenário 1B: User com role STUDENT

```
1. POST /api/users
   Body: {
     "name": "Maria Santos",
     "email": "maria@example.com",
     "password": "senha123",
     "role": "STUDENT"
   }

2. User Service:
   - Salva usuário no banco
   - Publica evento: user.created

3. RabbitMQ:
   - Encaminha para queue: aluno-service.user-events

4. Aluno Service (UserEventListener):
   - Recebe evento
   - Verifica: role == "STUDENT" && type == "CREATED"
   - Verifica se já existe aluno com userId
   - Cria registro de Aluno:
     * nome = Maria Santos
     * userId = [ID do user criado]
     * dataNascimento = 18 anos atrás (default)
     * turma = "A definir" (default)
     * contato = maria@example.com

Resultado: ✅ User criado + Aluno criado automaticamente
```

### Fluxo 2: Criar Professor → Cria User

```
1. POST /api/v1/professores
   Body: {
     "nome": "Carlos Oliveira",
     "email": "carlos@example.com",
     "especialidade": "Matemática",
     "dataContratacao": "2025-01-01"
   }

2. Professor Service:
   - Salva professor no banco (sem userId)
   - Publica evento: professor.created (routing key)

3. RabbitMQ:
   - Encaminha para queue: user-service.professor-events

4. User Service (ProfessorEventListener):
   - Recebe evento
   - Verifica: type == "CREATED" && userId == null
   - Verifica se já existe user com email
   - Cria registro de User:
     * name = Carlos Oliveira
     * email = carlos@example.com
     * role = TEACHER
     * passwordHash = BCrypt("ChangeMe123!") (senha default)
     * externalId = [ID do professor criado]
     * userType = "PROFESSOR"

Resultado: ✅ Professor criado + User criado automaticamente
```

### Fluxo 3: Criar Aluno → Cria User

```
1. POST /api/alunos
   Body: {
     "nome": "Pedro Costa",
     "dataNascimento": "2005-03-15",
     "turma": "3A",
     "contato": "pedro@example.com"
   }

2. Aluno Service:
   - Gera matrícula automaticamente
   - Salva aluno no banco (sem userId)
   - Publica evento: aluno.created (routing key)
     (Envia objeto Aluno completo)

3. RabbitMQ:
   - Encaminha para queue: user-service.aluno-events

4. User Service (AlunoEventListener):
   - Recebe evento (objeto Aluno completo em JSON)
   - Extrai: id, nome, userId, contato
   - Verifica: userId == null
   - Gera email:
     * Se contato contém "@" → usa contato
     * Senão → gera "aluno{id}@distrischool.local"
   - Cria registro de User:
     * name = Pedro Costa
     * email = [gerado ou do contato]
     * role = STUDENT
     * passwordHash = BCrypt("ChangeMe123!")
     * externalId = [ID do aluno criado]
     * userType = "ALUNO"

Resultado: ✅ Aluno criado + User criado automaticamente
```

## Detalhes de Implementação

### User Service

#### RabbitMQ Configuration

```java
// Queues para receber eventos de Professor e Aluno
@Bean
public Queue professorEventsQueue() {
    return QueueBuilder.durable("user-service.professor-events").build();
}

@Bean
public Queue alunoEventsQueue() {
    return QueueBuilder.durable("user-service.aluno-events").build();
}

// Bindings
@Bean
public Binding professorEventsBinding(Queue professorEventsQueue, TopicExchange distrischoolExchange) {
    return BindingBuilder.bind(professorEventsQueue).to(distrischoolExchange).with("professor.*");
}
```

#### Event Listeners

**ProfessorEventListener.java**
- Escuta: `user-service.professor-events`
- Filtra: `type == "CREATED" && userId == null`
- Ação: Cria User com role TEACHER

**AlunoEventListener.java**
- Escuta: `user-service.aluno-events`
- Filtra: `userId == null`
- Ação: Cria User com role STUDENT

### Professor Service

#### RabbitMQ Configuration

```java
// Queue para receber eventos de User
@Bean
public Queue userEventsQueue() {
    return QueueBuilder.durable("professor-service.user-events").build();
}

// Binding
@Bean
public Binding userEventsBinding(Queue userEventsQueue, TopicExchange distrischoolExchange) {
    return BindingBuilder.bind(userEventsQueue).to(distrischoolExchange).with("user.*");
}
```

#### Event Listener

**UserEventListener.java**
- Escuta: `professor-service.user-events`
- Filtra: `role == "TEACHER" && type == "CREATED"`
- Ação: Cria Professor vinculado ao userId

### Aluno Service

#### RabbitMQ Configuration

```java
// Queue para receber eventos de User
@Bean
public Queue userEventsQueue() {
    return QueueBuilder.durable("aluno-service.user-events").build();
}

// Binding
@Bean
public Binding userEventsBinding(Queue userEventsQueue, TopicExchange distrischoolExchange) {
    return BindingBuilder.bind(userEventsQueue).to((TopicExchange) distrischoolExchange).with("user.*");
}
```

#### Event Listener

**UserEventListener.java**
- Escuta: `aluno-service.user-events`
- Filtra: `role == "STUDENT" && type == "CREATED"`
- Ação: Cria Aluno vinculado ao userId

## Testando a Sincronização

### Pré-requisitos

1. Todos os serviços rodando (Professor, Aluno, User, RabbitMQ)
2. DBeaver conectado ao PostgreSQL (ver [DBEAVER_SETUP_GUIDE.md](./DBEAVER_SETUP_GUIDE.md))

### Teste 1: User TEACHER → Professor

#### 1. Criar User com role TEACHER

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

#### 2. Verificar no DBeaver

```sql
-- Ver o User criado
SELECT * FROM users WHERE email = 'joao.silva@test.com';

-- Aguardar 2-3 segundos e verificar Professor criado
SELECT * FROM professores WHERE email = 'joao.silva@test.com';

-- Verificar vinculação
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.role,
    p.id AS professor_id,
    p.nome AS professor_nome,
    p.user_id
FROM users u
JOIN professores p ON u.id = p.user_id
WHERE u.email = 'joao.silva@test.com';
```

**Resultado Esperado:**
- ✅ User criado com role TEACHER
- ✅ Professor criado automaticamente
- ✅ Professor.userId == User.id

### Teste 2: Professor → User TEACHER

#### 1. Criar Professor

```bash
curl -X POST http://distrischool.local/api/v1/professores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "email": "maria.santos@test.com",
    "especialidade": "Física",
    "dataContratacao": "2025-01-01"
  }'
```

#### 2. Verificar no DBeaver

```sql
-- Ver o Professor criado
SELECT * FROM professores WHERE email = 'maria.santos@test.com';

-- Aguardar 2-3 segundos e verificar User criado
SELECT * FROM users WHERE email = 'maria.santos@test.com';

-- Verificar vinculação reversa
SELECT 
    p.id AS professor_id,
    p.nome AS professor_nome,
    u.id AS user_id,
    u.name AS user_name,
    u.role,
    u.external_id
FROM professores p
JOIN users u ON p.id = u.external_id
WHERE p.email = 'maria.santos@test.com';
```

**Resultado Esperado:**
- ✅ Professor criado
- ✅ User criado automaticamente com role TEACHER
- ✅ User.externalId == Professor.id
- ⚠️ **Senha padrão:** `ChangeMe123!` (deve ser alterada pelo usuário)

### Teste 3: User STUDENT → Aluno

```bash
curl -X POST http://distrischool.local/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Costa",
    "email": "pedro.costa@test.com",
    "password": "senha123",
    "role": "STUDENT"
  }'
```

```sql
SELECT * FROM users WHERE email = 'pedro.costa@test.com';
SELECT * FROM aluno WHERE nome = 'Pedro Costa';

-- Verificar vinculação
SELECT 
    u.id AS user_id,
    u.name,
    a.id AS aluno_id,
    a.nome,
    a.matricula,
    a.user_id
FROM users u
JOIN aluno a ON u.id = a.user_id
WHERE u.email = 'pedro.costa@test.com';
```

### Teste 4: Aluno → User STUDENT

```bash
curl -X POST http://distrischool.local/api/alunos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Ana Oliveira",
    "dataNascimento": "10-05-2005",
    "turma": "2B",
    "contato": "ana.oliveira@test.com"
  }'
```

```sql
SELECT * FROM aluno WHERE nome = 'Ana Oliveira';
SELECT * FROM users WHERE email = 'ana.oliveira@test.com';

-- Verificar vinculação reversa
SELECT 
    a.id AS aluno_id,
    a.nome,
    a.matricula,
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    u.external_id
FROM aluno a
JOIN users u ON a.id = u.external_id
WHERE a.nome = 'Ana Oliveira';
```

## Prevenção de Duplicatas

O sistema possui múltiplos mecanismos de prevenção de duplicatas:

### 1. Verificação de Existência

Antes de criar, cada listener verifica se o registro já existe:

```java
// Professor Service
if (professorRepository.findByUserId(event.getId()).isPresent()) {
    log.info("Professor with userId={} already exists, skipping creation", event.getId());
    return;
}

// User Service
if (userRepository.existsByEmail(event.getEmail())) {
    log.info("User with email={} already exists, skipping creation", event.getEmail());
    return;
}
```

### 2. Constraint de Email Único

```sql
-- Tabela users
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);

-- Tabela professores
ALTER TABLE professores ADD CONSTRAINT uk_professores_email UNIQUE (email);
```

### 3. Transações

Todos os listeners usam `@Transactional`, garantindo atomicidade:

```java
@RabbitListener(queues = "#{userEventsQueue.name}")
@Transactional
public void handleUserEvent(UserEventDTO event) {
    // Se houver erro, rollback é automático
}
```

## Monitoramento via RabbitMQ Management

### Acessar Console

```bash
# Obter URL do RabbitMQ Management
minikube service rabbitmq-service --url

# Usar porta 15672
# Credenciais: guest / guest
```

### Verificar Queues

No Management Console:

1. Ir em **Queues**
2. Verificar filas:
   - `professor-service.user-events`
   - `aluno-service.user-events`
   - `user-service.professor-events`
   - `user-service.aluno-events`

3. Clicar em cada fila para ver:
   - **Messages**: Número de mensagens pendentes
   - **Message rates**: Taxa de publicação/consumo
   - **Get messages**: Inspecionar mensagens

### Verificar Exchanges e Bindings

1. Ir em **Exchanges**
2. Clicar em `distrischool.events.exchange`
3. Verificar **Bindings**:
   - `user.*` → `professor-service.user-events`
   - `user.*` → `aluno-service.user-events`
   - `professor.*` → `user-service.professor-events`
   - `aluno.*` → `user-service.aluno-events`

## Troubleshooting

### Problema: Professor/Aluno não é criado automaticamente

**Diagnóstico:**

1. Verificar logs do serviço:
```bash
kubectl logs deployment/professor-tecadm-deployment | grep -i "received user event"
kubectl logs deployment/aluno-deployment | grep -i "received user event"
```

2. Verificar RabbitMQ Management:
   - Mensagens estão sendo publicadas?
   - Mensagens estão sendo consumidas?
   - Há mensagens com erro (unacked)?

**Soluções:**

- Se mensagens não chegam: Verificar bindings no RabbitMQ
- Se mensagens chegam mas não processam: Ver logs de erro do serviço
- Se há mensagens unacked: Reiniciar o serviço consumidor

### Problema: User não é criado automaticamente

**Diagnóstico:**

```bash
kubectl logs deployment/user-service-deployment | grep -i "received.*event"
```

**Verificar:**
- Professor/Aluno está publicando evento?
- Event contém dados corretos?
- Email já existe?

### Problema: Duplicatas sendo criadas

**Verificar:**

1. Constraint de email está ativa?
```sql
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'UNIQUE' 
AND table_name IN ('users', 'professores', 'aluno');
```

2. Múltiplos listeners processando mesma mensagem?
```bash
# Verificar número de réplicas
kubectl get deployment
```

**Solução:**
- Garantir que queues sejam duráveis (já configurado)
- Usar `@Transactional` em todos os listeners (já implementado)

### Problema: Senha padrão "ChangeMe123!" é insegura

**Isso é proposital para facilitar testes.**

Para produção, considere:

1. Enviar email com link de ativação
2. Forçar troca de senha no primeiro login
3. Usar senha aleatória e enviar por email

## Logs Úteis

### Professor Service

```bash
kubectl logs deployment/professor-tecadm-deployment -f | grep -E "(Received user event|Created professor)"
```

### Aluno Service

```bash
kubectl logs deployment/aluno-deployment -f | grep -E "(Received user event|Created aluno)"
```

### User Service

```bash
kubectl logs deployment/user-service-deployment -f | grep -E "(Received.*event|Created user)"
```

## Próximos Passos

### Melhorias Sugeridas

1. **Dead Letter Queue (DLQ)**
   - Capturar mensagens que falharam após N tentativas
   - Facilitar debug de eventos problemáticos

2. **Idempotência Explícita**
   - Adicionar campo `eventId` único
   - Armazenar eventos já processados
   - Ignorar reprocessamento

3. **Retry com Backoff**
   - Tentar novamente em caso de falha temporária
   - Usar exponential backoff

4. **Compensação de Transações**
   - Se criação falha, publicar evento de rollback
   - Desfazer criação no serviço origem

5. **Audit Log**
   - Registrar todos os eventos processados
   - Facilitar auditoria e debug

---

**✅ A sincronização bidirecional está implementada e funcionando!**

Para mais detalhes sobre a arquitetura, consulte [ARCHITECTURE.md](./ARCHITECTURE.md).
