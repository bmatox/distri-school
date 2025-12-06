# 🎓 DistriSchool - Plataforma de Gestão Escolar Distribuída

O **DistriSchool** é uma plataforma completa de gestão escolar baseada em **arquitetura de microserviços**, desenvolvida com Spring Boot, containerizada com Docker e orquestrada com Kubernetes. Este projeto demonstra as melhores práticas de desenvolvimento de sistemas distribuídos, incluindo comunicação síncrona e assíncrona, isolamento de serviços, escalabilidade horizontal e resiliência a falhas.

## 🏗️ Arquitetura

A plataforma demonstra uma **arquitetura de microserviços completa e funcional**, com serviços independentes, comunicação síncrona e assíncrona, e infraestrutura distribuída.

### Componentes Principais

| Componente | Tecnologia | Porta | Descrição |
|------------|-----------|-------|-----------|
| **Professor Service** | Spring Boot | 8082 | Gestão de professores e técnicos administrativos |
| **Aluno Service** | Spring Boot | 8081 | Gestão de alunos com endereços |
| **User Service** | Spring Boot | 8080 | Gestão de usuários e autenticação |
| **Grades Service** | Spring Boot | 8083 | Gestão de notas e avaliações |
| **Communication Service** | Spring Boot | 8084 | Notificações e comunicações |
| **API Gateway** | Spring Cloud Gateway | 8080 | Roteamento centralizado e CORS |
| **Frontend** | React + Nginx | 80 | Interface web moderna (SPA) |
| **PostgreSQL** | PostgreSQL 15 | 5432 | Banco de dados relacional |
| **RabbitMQ** | RabbitMQ 3 | 5672/15672 | Message broker para eventos assíncronos |
| **Ingress** | NGINX Ingress | 80/443 | Roteamento externo e Load Balancing |

### Características da Arquitetura

✅ **Microserviços Independentes**: Cada serviço pode ser desenvolvido, deployado e escalado separadamente  
✅ **Database per Service**: Cada serviço tem seu próprio schema no banco de dados  
✅ **Event-Driven**: Comunicação assíncrona via RabbitMQ para desacoplamento  
✅ **API Gateway Pattern**: Ponto único de entrada para o frontend  
✅ **Service Discovery**: Kubernetes DNS para localização automática de serviços  
✅ **Health Checks**: Monitoramento individual de cada serviço  
✅ **Horizontal Scaling**: Réplicas independentes com load balancing automático  
✅ **Containerização**: Todos os componentes rodando em containers Docker  
✅ **Resiliência**: Circuit Breaker e Retry patterns com Resilience4J  
✅ **Notificações Assíncronas**: Sistema de notificações em tempo real via eventos

### 🔐 Gestão Unificada de Usuários e Sincronização Bidirecional

O DistriSchool implementa um sistema de **sincronização bidirecional automática** entre microsserviços que garante consistência e flexibilidade:

**Sincronização Automática:**
- ✅ Criar **User** com role TEACHER → Automaticamente cria **Professor**
- ✅ Criar **User** com role STUDENT → Automaticamente cria **Aluno**
- ✅ Criar **Professor** → Automaticamente cria **User** com role TEACHER
- ✅ Criar **Aluno** → Automaticamente cria **User** com role STUDENT

**Perfis de Usuário:**
- **ADMIN**: Administradores do sistema
- **TEACHER**: Professores
- **STUDENT**: Alunos
- **TECHNICAL_ADMIN**: Técnicos administrativos

**Como Funciona:**
- Comunicação via eventos RabbitMQ (assíncrona e desacoplada)
- Listeners em cada serviço reagem aos eventos de outros serviços
- Vinculação automática via `userId` e `externalId`
- Prevenção de duplicatas com verificações e constraints únicos

### 🔒 Autenticação e Autorização (JWT)

O DistriSchool implementa um sistema completo de autenticação JWT e controle de acesso baseado em roles (RBAC):

**Características:**
- ✅ Autenticação JWT com tokens assinados (HMAC-SHA256)
- ✅ Senhas criptografadas com BCrypt
- ✅ Rotas protegidas no API Gateway
- ✅ Protected Routes no frontend React
- ✅ Controle de acesso baseado em roles (RBAC)
- ✅ Login/Logout completo
- ✅ Tokens com expiração configurável (padrão 24h)

**Credenciais Padrão:**
- Email: `admin@distrischool.com`
- Senha: `admin123`
- Role: `ADMIN`

**Fluxo de Autenticação:**
1. Usuário acessa aplicação → Redireciona para `/login`
2. Login → Backend valida e retorna JWT token
3. Token armazenado no localStorage
4. Todas requisições incluem token no header `Authorization: Bearer <token>`
5. API Gateway valida token antes de rotear para microserviços
6. Frontend adapta interface baseado na role do usuário

### 📝 Sistema de Notas e Avaliações

O DistriSchool inclui um **sistema completo de gestão de notas** que permite:

**Funcionalidades:**
- ✅ Lançamento de notas por professores
- ✅ Consulta de notas por aluno, professor ou disciplina
- ✅ Múltiplos tipos de avaliação (Prova, Trabalho, Participação, Projeto, Seminário)
- ✅ Comentários e observações por avaliação
- ✅ Histórico completo de avaliações
- ✅ Notificações automáticas para alunos quando notas são lançadas

**Arquitetura:**
- Microsserviço independente (Grades Service) na porta 8083
- Banco de dados isolado (schema `grades_schema`)
- Publicação de eventos via RabbitMQ quando notas são criadas
- Circuit Breaker e Retry patterns para resiliência

### 📬 Sistema de Comunicação e Notificações

O sistema de **notificações assíncronas** mantém alunos e professores informados:

**Funcionalidades:**
- ✅ Notificações automáticas quando notas são lançadas
- ✅ Sistema de leitura/não lido com marcação de lida
- ✅ Filtros para visualizar todas ou apenas notificações não lidas
- ✅ Múltiplos tipos de notificação (Notas, Anúncios, Sistema)
- ✅ Exclusão de notificações antigas
- ✅ Timestamps relativos para melhor UX

**Arquitetura:**
- Microsserviço independente (Communication Service) na porta 8084
- Banco de dados isolado (schema `communication_schema`)
- Listener de eventos RabbitMQ que reage a eventos de outros serviços
- Criação automática de notificações baseada em eventos de negócio
- Circuit Breaker e Retry patterns para resiliência

### 🛡️ Padrões de Resiliência

Todos os microsserviços implementam **padrões de resiliência** usando Resilience4J:

**Circuit Breaker:**
- Previne cascata de falhas entre serviços
- Abre o circuito após 50% de falhas em 10 requisições
- Transição automática para half-open após 5 segundos
- Fallback methods para tratamento gracioso de erros

**Retry:**
- 3 tentativas automáticas em caso de falha
- Backoff exponencial com multiplicador 2x
- Espera inicial de 1 segundo entre tentativas
- Aplicado em operações críticas de criação de dados

**Configuração:**
- Circuit breaker com sliding window de 10 requisições
- Registro de health indicators para monitoramento
- Event consumer buffer para análise de padrões

## 🚀 Tecnologias

### Backend
- **Java 17** - Linguagem de programação
- **Spring Boot 3.5.6** - Framework de aplicação
- **Spring Cloud Gateway 2024.0.2** - API Gateway
- **Spring Data JPA** - Persistência de dados
- **Spring AMQP** - Integração com RabbitMQ
- **Resilience4J 2.1.0** - Circuit Breaker e Retry patterns
- **Flyway** - Migrations de banco de dados
- **Lombok** - Redução de boilerplate
- **SpringDoc OpenAPI** - Documentação Swagger

### Frontend
- **React 19** - Biblioteca UI
- **React Router DOM 7** - Roteamento SPA
- **Vite 7** - Build tool moderna
- **Nginx** - Web server para produção

### Banco de Dados e Mensageria
- **PostgreSQL 15** - Banco de dados relacional
- **RabbitMQ 3** - Message broker AMQP

### DevOps e Infraestrutura
- **Docker** - Containerização
- **Kubernetes** - Orquestração de containers
- **Minikube** - Kubernetes local
- **NGINX Ingress Controller** - Roteamento externo
- **Maven** - Build automation

## 📋 Pré-requisitos

- **Docker** instalado e rodando
- **Minikube** instalado (versão 1.30+)
- **kubectl** instalado
- **Java 17** (para builds locais)
- **Node.js 18+** (para desenvolvimento do frontend)
- **Git**
- Pelo menos **8GB de RAM** disponível

## 🎯 Início Rápido

### 1. Clone o Repositório

```bash
git clone https://github.com/bmatox/distrischool-professor-tecadm-service.git
cd distrischool-professor-tecadm-service
```

### 2. Deploy Automatizado (Recomendado)

**O método mais simples e completo:**

```powershell
# Executar como Administrador (Windows PowerShell)
.\full-deploy.ps1

# Quando solicitado, abrir outro PowerShell como Admin e executar:
minikube tunnel

# Acessar a aplicação
http://distrischool.local
```

O script `full-deploy.ps1` realiza automaticamente:
- ✅ Configuração do Minikube (4 CPUs, 8GB RAM)
- ✅ Habilitação e configuração do Ingress
- ✅ Build de todas as imagens Docker
- ✅ Deploy de infraestrutura (PostgreSQL, RabbitMQ)
- ✅ Deploy de todos os microserviços
- ✅ Deploy do frontend
- ✅ Configuração do arquivo hosts
- ✅ Validação do sistema

**⏱️ Tempo total**: 10-20 minutos (primeira vez)

### 3. Verificar o Deploy

```powershell
# Ver status dos pods
kubectl get pods

# Todos devem estar "Running"

# Acessar aplicação
Start-Process "http://distrischool.local"

# Testar API
curl http://distrischool.local/api/v1/professores
```

### Métodos Alternativos de Deploy

O método recomendado é usar `full-deploy.ps1`, mas existem alternativas:

- **Desenvolvimento local**: Usar `docker-compose.yml` na raiz

## 📁 Estrutura do Projeto

```
distrischool/
├── 📂 professor-service/            # Professor Service (Spring Boot)
├── 📂 distrischool-aluno-main/      # Aluno Service
├── 📂 distrischool-user-service-main/ # User Service
├── 📂 grades-service/               # Grades Service (NEW)
├── 📂 communication-service/        # Communication Service (NEW)
├── 📂 api-gateway/                  # API Gateway (Spring Cloud Gateway)
├── 📂 frontend/                     # Frontend (React + Vite + Nginx)
├── 📂 k8s-manifests/                # Kubernetes manifests
│   ├── postgres/                    # PostgreSQL deployment
│   ├── rabbitmq/                    # RabbitMQ deployment
│   ├── professor-service/           # Professor Service deployment
│   ├── aluno-service/               # Aluno Service deployment
│   ├── user-service/                # User Service deployment
│   ├── grades-service/              # Grades Service deployment (NEW)
│   ├── communication-service/       # Communication Service deployment (NEW)
│   ├── api-gateway/                 # API Gateway deployment
│   ├── frontend/                    # Frontend deployment
│   ├── monitoring/                  # Prometheus & Grafana stack (NEW)
│   └── ingress.yaml                 # Ingress rules
├── 📂 tests/k6/                     # Load testing with k6 (NEW)
│   ├── load-test.js                 # Main load test script
│   └── README.md                    # k6 documentation
├── 🔧 full-deploy.ps1               # Script de deploy automatizado
├── 🔧 clean-setup.ps1               # Script de limpeza
├── 🔧 run-load-test.ps1             # Load testing script (Windows) (NEW)
├── 🔧 run-load-test.sh              # Load testing script (Linux/Mac) (NEW)
├── 📄 LOAD_TESTING_GUIDE.md         # Guia de testes de carga (NEW)
└── 📄 docker-compose.yml            # Docker Compose para dev local
```

## 🔌 Endpoints da API

### URL Base
- **Com Ingress**: `http://distrischool.local/api`
- **Direto (port-forward)**: `http://localhost:PORTA/api`

### Professor Service (Porta 8082)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/v1/professores` | Lista professores (paginado) |
| GET | `/v1/professores/{id}` | Busca professor por ID |
| POST | `/v1/professores` | Cria novo professor (requer userId) |
| PUT | `/v1/professores/{id}` | Atualiza professor |
| DELETE | `/v1/professores/{id}` | Remove professor |

**Nota**: Ao criar um professor, é necessário fornecer um `userId` válido de um usuário com perfil TEACHER.

### Aluno Service (Porta 8081)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/alunos` | Lista alunos |
| GET | `/alunos/{id}` | Busca aluno por ID |
| GET | `/alunos/matricula/{matricula}` | Busca por matrícula |
| POST | `/alunos` | Cria novo aluno (requer userId) |
| PUT | `/alunos/{id}` | Atualiza aluno |
| DELETE | `/alunos/{id}` | Remove aluno |

**Nota**: Ao criar um aluno, é necessário fornecer um `userId` válido de um usuário com perfil STUDENT.

### User Service (Porta 8080)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users` | Lista usuários (paginado) |
| GET | `/users/{id}` | Busca usuário por ID |
| GET | `/users/by-role/{role}` | Lista usuários por perfil (ADMIN, TEACHER, STUDENT, TECHNICAL_ADMIN) |
| GET | `/users/available-for-role/{role}` | Lista usuários disponíveis para vinculação (sem externalId) |
| POST | `/users` | Cria novo usuário com email, senha e perfil |
| PUT | `/users/{id}` | Atualiza usuário |
| DELETE | `/users/{id}` | Remove usuário |

**Nota**: O User Service é o ponto central para criação de credenciais. Professores e alunos devem primeiro criar um usuário, que será então vinculado à entidade específica.

### Grades Service (Porta 8083) - NOVO

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/grades` | Lista todas as notas |
| GET | `/grades/{id}` | Busca nota por ID |
| GET | `/grades/student/{studentId}` | Lista notas de um aluno |
| GET | `/grades/professor/{professorId}` | Lista notas lançadas por um professor |
| POST | `/grades` | Cria nova nota (dispara notificação automática) |
| PUT | `/grades/{id}` | Atualiza nota existente |
| DELETE | `/grades/{id}` | Remove nota |

**Exemplo de Payload**:
```json
{
  "studentId": 1,
  "professorId": 2,
  "subject": "Matemática",
  "grade": 8.5,
  "evaluationType": "PROVA",
  "comments": "Excelente desempenho"
}
```

**Tipos de Avaliação**: PROVA, TRABALHO, PARTICIPACAO, PROJETO, SEMINARIO

### Communication Service (Porta 8084) - NOVO

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/notifications` | Lista todas as notificações |
| GET | `/notifications/{id}` | Busca notificação por ID |
| GET | `/notifications/user/{userId}` | Lista notificações de um usuário |
| GET | `/notifications/user/{userId}/unread` | Lista notificações não lidas de um usuário |
| POST | `/notifications` | Cria nova notificação |
| PUT | `/notifications/{id}/read` | Marca notificação como lida |
| DELETE | `/notifications/{id}` | Remove notificação |

**Exemplo de Payload**:
```json
{
  "userId": 1,
  "title": "Nova Nota Lançada",
  "message": "Você recebeu uma nova nota em Matemática: 8.5",
  "notificationType": "GRADE_POSTED"
}
```

**Tipos de Notificação**: GRADE_POSTED, ANNOUNCEMENT, SYSTEM

**Nota**: As notificações são criadas automaticamente quando eventos ocorrem no sistema (ex: lançamento de notas).

## 🧪 Testes

### Testando Arquitetura de Microserviços

O projeto inclui testes práticos para **provar** a implementação de microserviços:

```powershell
# Testar independência dos serviços
kubectl scale deployment professor-tecadm-deployment --replicas=0  # Parar Professor Service
curl http://distrischool.local/api/alunos  # Aluno Service continua funcionando!

# Testar escalabilidade horizontal
kubectl scale deployment professor-tecadm-deployment --replicas=3  # 3 réplicas

# Testar resiliência
kubectl delete pod <nome-do-pod>  # Kubernetes recria automaticamente
```

### Testando APIs

```powershell
# Criar professor
$body = @{
    nome = "João Silva"
    email = "joao@test.com"
    cpf = "12345678901"
    departamento = "TI"
    titulacao = "MESTRE"
    dataContratacao = "2025-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores" `
    -Method POST -Body $body -ContentType "application/json"

# Listar professores
Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores"
```

### Testes Unitários

```bash
# Professor Service
./mvnw clean test

# Aluno Service
cd distrischool-aluno-main
./mvnw clean test

# User Service
cd distrischool-user-service-main/user-service
./mvnw clean test
```

## 📊 Monitoramento

### Health Checks

Todos os serviços expõem endpoints de health via Spring Boot Actuator:

```powershell
# Via API Gateway
curl http://distrischool.local/api/actuator/health

# Direto (com port-forward)
kubectl port-forward deployment/professor-tecadm-deployment 8082:8082
curl http://localhost:8082/actuator/health
```

**Resposta esperada**:
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "rabbit": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

### RabbitMQ Management Console

Acesse a interface web do RabbitMQ:

```powershell
# Obter URL
minikube service rabbitmq-service --url
# Usar a porta 15672

# Credenciais
# Usuário: guest
# Senha: guest
```

**Funcionalidades**:
- Ver filas e exchanges
- Monitorar mensagens
- Visualizar bindings
- Debug de eventos

### Kubernetes Dashboard

```bash
minikube dashboard
```

Visualize:
- Status de todos os pods
- Logs em tempo real
- Uso de recursos (CPU, memória)
- Eventos do cluster

## 🚀 Testes de Carga (k6)

O DistriSchool inclui uma suíte completa de testes de carga usando **k6** para validar performance, escalabilidade e resiliência do sistema sob stress.

### Execução Rápida

```powershell
# Windows
.\run-load-test.ps1

# Linux/Mac
./run-load-test.sh
```

O teste simula usuários reais com os seguintes cenários:
- **Stage 1 (Ramp-up)**: 0 → 50 usuários virtuais em 30s
- **Stage 2 (Sustentação)**: 50 VUs por 1 minuto
- **Stage 3 (Stress)**: 50 → 200 VUs em 30s
- **Stage 4 (Cool-down)**: 200 → 0 em 30s

### Cenários de Teste

1. **Leitura Pesada**: `GET /api/v1/professores`, `GET /api/cursos`
2. **Escrita/Processamento**: `POST /api/alunos` (dispara RabbitMQ + PostgreSQL)
3. **Autenticação**: JWT token com admin credentials

### Monitoramento Durante o Teste

Abra o Grafana **ANTES** de iniciar o teste:
```bash
# Grafana (admin/admin)
http://localhost:30030

# Prometheus
http://localhost:30090
```

Observe em tempo real:
- 📈 Requisições por segundo (RPS)
- ⏱️ Latência (P95, P99)
- 🔴 Taxa de erro
- 💻 CPU/Memória dos pods
- 📊 Mensagens RabbitMQ

### Thresholds de Qualidade

- ✅ P95 latency < 500ms
- ✅ Error rate < 10%
- ✅ 95% de checks bem-sucedidos

## 📨 Mensageria (RabbitMQ)

O sistema usa eventos assíncronos para comunicação entre serviços:

### Exchange
- **Nome**: `distrischool.events.exchange`
- **Tipo**: topic
- **Durável**: true

### Routing Keys
- `professor.created`, `professor.updated`, `professor.deleted`
- `aluno.created`, `aluno.updated`, `aluno.deleted`
- `user.created`, `user.updated`, `user.deleted`

### Exemplo de Uso

```java
// Publicar evento
rabbitTemplate.convertAndSend(
    "distrischool.events.exchange",
    "professor.created",
    professor
);

// Consumir evento (em outro serviço)
@RabbitListener(queues = "professor.events.queue")
public void handleProfessorCreated(Professor professor) {
    // Reagir ao evento
}
```

## 🔧 Desenvolvimento Local

### Backend (sem Kubernetes)

```bash
# Iniciar apenas infraestrutura
docker-compose up -d postgres rabbitmq

# Executar serviço
./mvnw spring-boot:run

# Ou compilar e executar
./mvnw clean package
java -jar target/*.jar
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🐛 Troubleshooting

### Problemas Comuns

**1. Pods não iniciam (ImagePullBackOff)**
```powershell
# Verificar se Docker está usando daemon do Minikube
minikube docker-env --shell powershell | Invoke-Expression

# Verificar imagens disponíveis
docker images | Select-String "distrischool"

# Se necessário, rebuildar
cd professor-service
docker build -t distrischool-professor-tecadm-service:latest .
```

**2. Serviço não inicia (CrashLoopBackOff)**
```bash
# Ver logs do pod
kubectl logs <pod-name>

# Verificar detalhes
kubectl describe pod <pod-name>

# Comum: Erro de conexão com PostgreSQL ou RabbitMQ
# Verificar se infraestrutura está rodando
kubectl get pods | grep -E "postgres|rabbitmq"
```

**3. Frontend não carrega**
```powershell
# Verificar se minikube tunnel está rodando
# Deve haver um terminal executando: minikube tunnel

# Verificar arquivo hosts
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "distrischool"

# Adicionar se necessário (como Admin)
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "`n127.0.0.1 distrischool.local"

# Limpar cache DNS
ipconfig /flushdns
```

**4. API retorna 404**
```powershell
# Testar diretamente o serviço
kubectl port-forward deployment/professor-tecadm-deployment 8082:8082
curl http://localhost:8082/api/v1/professores

# Se funcionar, problema está no API Gateway ou Ingress
# Ver logs do API Gateway
kubectl logs deployment/api-gateway-deployment
```
## 🧹 Limpando o Ambiente

Para remover completamente o ambiente:

```powershell
# Script automatizado
.\clean-setup.ps1

# Ou manualmente
kubectl delete all --all
kubectl delete ingress --all
minikube stop
minikube delete

# Remover imagens (opcional)
docker system prune -a
```
