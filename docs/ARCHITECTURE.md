# 🏗️ DistriSchool - Arquitetura Completa do Sistema

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [O Que é o DistriSchool](#o-que-é-o-distrischool)
3. [Arquitetura de Microserviços](#arquitetura-de-microserviços)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Componentes da Aplicação](#componentes-da-aplicação)
6. [Infraestrutura](#infraestrutura)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Comunicação Entre Serviços](#comunicação-entre-serviços)
9. [Padrões Arquiteturais](#padrões-arquiteturais)
10. [Escalabilidade e Resiliência](#escalabilidade-e-resiliência)

---

## Visão Geral

O **DistriSchool** é uma plataforma moderna e distribuída de gestão escolar, desenvolvida como um exemplo completo de arquitetura de microserviços. O sistema demonstra práticas avançadas de desenvolvimento, incluindo containerização, orquestração, mensageria assíncrona e padrões de design para sistemas distribuídos.

### Características Principais

- ✅ **Arquitetura de Microserviços**: Serviços independentes e desacoplados
- ✅ **Containerização Completa**: Todos os componentes rodando em containers Docker
- ✅ **Orquestração com Kubernetes**: Deploy automatizado e gerenciamento de containers
- ✅ **API Gateway**: Ponto único de entrada para todos os serviços
- ✅ **Mensageria Assíncrona**: Comunicação entre serviços via RabbitMQ
- ✅ **Frontend Moderno**: Interface React com Single Page Application (SPA)
- ✅ **Persistência Distribuída**: Cada serviço com sua própria camada de dados
- ✅ **Observabilidade**: Health checks e monitoring integrados

---

## O Que é o DistriSchool

### Propósito

O DistriSchool é uma plataforma de gestão escolar que permite:

1. **Gestão de Professores**: Cadastro, atualização e consulta de professores e suas informações acadêmicas
2. **Gestão de Alunos**: Gerenciamento completo de alunos, incluindo dados pessoais e endereços
3. **Gestão de Usuários**: Controle de acesso e autenticação de usuários do sistema
4. **Gestão de Técnicos Administrativos**: Controle de funcionários administrativos

### Público-Alvo

- Instituições de ensino (escolas, faculdades, universidades)
- Administradores escolares
- Secretarias acadêmicas
- Desenvolvedores estudando arquitetura de microserviços

### Objetivos Técnicos

O projeto foi desenvolvido para demonstrar:

- Como construir uma arquitetura de microserviços do zero
- Como implementar comunicação síncrona (REST) e assíncrona (mensageria)
- Como deployar e orquestrar microserviços com Kubernetes
- Como integrar frontend moderno com backend distribuído
- Como garantir isolamento e independência entre serviços

---

## Arquitetura de Microserviços

### Princípios Fundamentais

A arquitetura do DistriSchool segue os seguintes princípios de microserviços:

#### 1. **Separação de Responsabilidades (Single Responsibility)**
Cada microserviço é responsável por uma única funcionalidade de negócio:
- Professor Service → Gestão de professores
- Aluno Service → Gestão de alunos
- User Service → Gestão de usuários

#### 2. **Autonomia e Independência**
- Cada serviço pode ser desenvolvido, deployado e escalado independentemente
- Cada serviço possui seu próprio banco de dados (database per service)
- Falha em um serviço não derruba o sistema inteiro

#### 3. **Comunicação via API**
- REST APIs para comunicação síncrona
- Mensageria (RabbitMQ) para comunicação assíncrona e eventos

#### 4. **Containerização**
- Cada serviço roda em seu próprio container Docker
- Isolamento de recursos e dependências

#### 5. **Descoberta de Serviços**
- Kubernetes Service Discovery para localização de serviços
- API Gateway como ponto de entrada único

### Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USUÁRIO FINAL                              │
│                         (Navegador Web)                              │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ HTTP (http://distrischool.local)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES INGRESS NGINX                          │
│                  (Roteamento e Load Balancing)                       │
└─────────────┬───────────────────────────────┬───────────────────────┘
              │                               │
              │ /api                          │ /
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│     API GATEWAY          │    │       FRONTEND           │
│  (Spring Cloud Gateway)  │    │    (React + Nginx)       │
│      Porta: 8080         │    │      Porta: 80           │
└──────────┬───────────────┘    └──────────────────────────┘
           │
           │ Roteamento Interno
           ├─────────────┬─────────────┬─────────────┐
           ▼             ▼             ▼             ▼
┌────────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Professor      │ │   Aluno    │ │   User     │ │   Técnico  │
│   Service      │ │  Service   │ │  Service   │ │   Admin    │
│  Porta: 8082   │ │ Porta:8081 │ │ Porta:8080 │ │  Service   │
└────┬───────────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
     │                   │              │              │
     │ JPA               │ JPA          │ JPA          │ JPA
     ▼                   ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  Schemas: professor_db, aluno_db, user_db, tecadm_db       │
│                     Porta: 5432                              │
└─────────────────────────────────────────────────────────────┘

     │                   │              │              │
     │ Publish           │ Publish      │ Publish      │ Publish
     └───────────────────┴──────────────┴──────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      RabbitMQ                                │
│           Exchange: distrischool.events.exchange             │
│              Routing Keys: *.created, *.updated, *.deleted   │
│                  Porta: 5672 (AMQP), 15672 (Management)     │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de uma Requisição

1. **Usuário** acessa `http://distrischool.local/api/v1/professores`
2. **Ingress** recebe a requisição e roteia para o API Gateway (path `/api`)
3. **API Gateway** recebe a requisição em `/api/v1/professores`
4. **API Gateway** roteia para o `professor-tecadm-service:8082/api/v1/professores`
5. **Professor Service** processa a requisição:
   - Valida os dados de entrada
   - Consulta/modifica o banco de dados
   - Publica evento no RabbitMQ (se for criação/atualização/deleção)
   - Retorna resposta JSON
6. **API Gateway** retorna a resposta ao cliente
7. **Frontend** renderiza os dados na interface

---

## Tecnologias Utilizadas

### Backend

#### Spring Boot 3.5.6
- **Framework principal**: Base de todos os microserviços
- **Spring Boot Starter Web**: APIs REST
- **Spring Boot Starter Data JPA**: Persistência de dados
- **Spring Boot Actuator**: Health checks e métricas

#### Spring Cloud Gateway 2024.0.2
- **API Gateway**: Roteamento centralizado
- **Filtros**: Manipulação de requisições/respostas
- **Load Balancing**: Distribuição de carga

#### Java 17
- **Linguagem**: Java LTS (Long Term Support)
- **Features modernas**: Records, Pattern Matching, Text Blocks

#### PostgreSQL 15
- **Banco de dados relacional**: Armazenamento persistente
- **ACID**: Transações confiáveis
- **Schemas separados**: Isolamento de dados por serviço

#### RabbitMQ
- **Message Broker**: Comunicação assíncrona
- **AMQP**: Protocolo de mensageria
- **Exchange Topic**: Roteamento baseado em routing keys

#### Flyway
- **Migrations**: Versionamento de schema de banco
- **Controle de versão**: Histórico de mudanças no banco

### Frontend

#### React 19
- **Framework UI**: Biblioteca JavaScript moderna
- **Componentes**: Reutilização e composição
- **Hooks**: State management e side effects

#### React Router DOM 7
- **Roteamento**: Navegação SPA (Single Page Application)
- **Lazy Loading**: Carregamento sob demanda

#### Vite 7
- **Build Tool**: Bundling rápido e moderno
- **Hot Module Replacement**: Desenvolvimento ágil
- **Otimização**: Bundle otimizado para produção

#### Nginx
- **Web Server**: Servir arquivos estáticos em produção
- **Reverse Proxy**: Roteamento de requisições

### DevOps e Infraestrutura

#### Docker
- **Containerização**: Isolamento de aplicações
- **Multi-stage builds**: Imagens otimizadas
- **Docker Compose**: Desenvolvimento local

#### Kubernetes
- **Orquestração**: Gerenciamento de containers
- **Deployments**: Deploy declarativo
- **Services**: Service discovery
- **Ingress**: Roteamento externo

#### Minikube
- **Desenvolvimento local**: Kubernetes local
- **Addons**: Ingress, dashboard, metrics

#### Maven
- **Build Tool**: Compilação e gerenciamento de dependências
- **Multi-módulo**: Organização de projetos

---

## Componentes da Aplicação

### 1. Professor-TecAdm Service

**Responsabilidade**: Gerenciar professores e técnicos administrativos

**Tecnologias**:
- Spring Boot 3.5.6
- Spring Data JPA
- PostgreSQL
- RabbitMQ (AMQP)
- Flyway

**Endpoints Principais**:
- `GET /api/v1/professores` - Listar professores (paginado)
- `GET /api/v1/professores/{id}` - Buscar professor por ID
- `POST /api/v1/professores` - Criar professor
- `PUT /api/v1/professores/{id}` - Atualizar professor
- `DELETE /api/v1/professores/{id}` - Deletar professor
- `GET /actuator/health` - Health check

**Eventos Publicados**:
- `professor.created` - Quando um professor é criado
- `professor.updated` - Quando um professor é atualizado
- `professor.deleted` - Quando um professor é deletado

**Porta Interna**: 8082

**Database**: Schema `professor_db`

**Dockerfile**: Multi-stage build com Maven e OpenJDK 17

### 2. Aluno Service

**Responsabilidade**: Gerenciar alunos e seus endereços

**Tecnologias**:
- Spring Boot
- Spring Data JPA
- PostgreSQL
- RabbitMQ
- Flyway

**Endpoints Principais**:
- `GET /api/alunos` - Listar alunos
- `GET /api/alunos/{id}` - Buscar aluno por ID
- `GET /api/alunos/matricula/{matricula}` - Buscar por matrícula
- `POST /api/alunos` - Criar aluno
- `PUT /api/alunos/{id}` - Atualizar aluno
- `DELETE /api/alunos/{id}` - Deletar aluno

**Eventos Publicados**:
- `aluno.created`
- `aluno.updated`
- `aluno.deleted`

**Porta Interna**: 8081

**Database**: Schema `aluno_db`

**Entidades**: Aluno (com endereço embedded)

### 3. User Service

**Responsabilidade**: Gerenciar usuários do sistema

**Tecnologias**:
- Spring Boot
- Spring Data JPA
- Spring Security (potencial)
- PostgreSQL

**Endpoints Principais**:
- `GET /api/users` - Listar usuários (paginado)
- `GET /api/users/{id}` - Buscar usuário por ID
- `POST /api/users` - Criar usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Deletar usuário

**Eventos Publicados**:
- `user.created`
- `user.updated`
- `user.deleted`

**Porta Interna**: 8080

**Database**: Schema `user_db`

### 4. API Gateway

**Responsabilidade**: Roteamento centralizado, segurança, CORS

**Tecnologias**:
- Spring Cloud Gateway 2024.0.2
- Spring Boot 3.4.5
- Spring Boot Actuator

**Configuração de Rotas**:
```yaml
spring:
  cloud:
    gateway:
      routes:
        # Professor Service
        - id: professor-service
          uri: http://professor-tecadm-service:8082
          predicates:
            - Path=/api/v1/professores/**
            
        # Aluno Service
        - id: aluno-service
          uri: http://aluno-service:8081
          predicates:
            - Path=/api/alunos/**
            
        # User Service
        - id: user-service
          uri: http://user-service:8080
          predicates:
            - Path=/api/users/**
```

**Funcionalidades**:
- Roteamento baseado em path
- CORS configurado para aceitar requisições do frontend
- Health checks em `/actuator/health`
- Logs de requisições

**Porta Interna**: 8080

**Exposição**: Via Ingress em `http://distrischool.local/api`

### 5. Frontend

**Responsabilidade**: Interface de usuário web

**Tecnologias**:
- React 19
- React Router DOM 7
- Vite 7
- Nginx (produção)

**Páginas/Módulos**:
- **Dashboard**: Página inicial com cards de navegação
- **Professores**: CRUD completo de professores
- **Alunos**: CRUD completo de alunos
- **Usuários**: Visualização de usuários

**Características Técnicas**:
- SPA (Single Page Application)
- Roteamento client-side com React Router
- Comunicação com API via fetch/axios
- Configuração dinâmica da URL da API via `/config.js`
- Design responsivo

**Build**:
- Development: `npm run dev` (Vite dev server na porta 5173)
- Production: Build estático servido por Nginx na porta 80

**Nginx Config**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Exposição**: Via Ingress em `http://distrischool.local/`

---

## Infraestrutura

### PostgreSQL

**Versão**: 15

**Responsabilidade**: Armazenamento persistente de dados

**Configuração**:
- **Usuário**: postgres
- **Senha**: postgres
- **Database**: distrischool_db
- **Porta**: 5432

**Schemas**:
- `professor_db` - Dados de professores e técnicos administrativos
- `aluno_db` - Dados de alunos
- `user_db` - Dados de usuários

**Deployment Kubernetes**:
- **PersistentVolumeClaim**: 1Gi de armazenamento
- **Service**: ClusterIP (interno)
- **Readiness Probe**: Verifica se o banco está pronto

**Migrations**: Cada serviço gerencia suas próprias migrations via Flyway

### RabbitMQ

**Versão**: 3-management

**Responsabilidade**: Mensageria assíncrona entre serviços

**Configuração**:
- **Usuário**: guest
- **Senha**: guest
- **Porta AMQP**: 5672
- **Porta Management**: 15672

**Exchange**:
- **Nome**: `distrischool.events.exchange`
- **Tipo**: topic
- **Durável**: true

**Routing Keys**:
- `professor.created`, `professor.updated`, `professor.deleted`
- `aluno.created`, `aluno.updated`, `aluno.deleted`
- `user.created`, `user.updated`, `user.deleted`

**Uso**:
1. Serviço publica evento quando uma entidade é criada/atualizada/deletada
2. Outros serviços podem subscrever para reagir aos eventos
3. Desacoplamento: serviços não precisam conhecer uns aos outros

**Management Console**:
- URL: `minikube service rabbitmq-service --url` (porta 15672)
- Visualizar filas, exchanges, bindings
- Monitorar mensagens

### Kubernetes Ingress

**Controller**: Nginx Ingress Controller

**Responsabilidade**: Roteamento externo e balanceamento de carga

**Configuração**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: distrischool-ingress
  annotations:
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: distrischool.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-gateway-service
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

**Funcionalidades**:
- Roteamento baseado em host e path
- CORS habilitado
- TLS/SSL (configurável)
- Load Balancing automático

**Exposição**:
- Requer `minikube tunnel` para funcionar localmente
- Mapeia 127.0.0.1 para `distrischool.local` via arquivo hosts

---

## Fluxo de Dados

### Fluxo de Criação de Professor

1. **Frontend**: Usuário preenche formulário de criação de professor
   ```javascript
   POST http://distrischool.local/api/v1/professores
   Body: {
     "nome": "João Silva",
     "email": "joao@example.com",
     "cpf": "12345678901",
     "departamento": "Computação",
     "titulacao": "DOUTOR",
     "dataContratacao": "2025-01-01"
   }
   ```

2. **Ingress**: Recebe requisição e roteia para API Gateway (path `/api`)

3. **API Gateway**: Recebe em `/api/v1/professores` e roteia para `professor-tecadm-service:8082`

4. **Professor Service**:
   - Controller recebe a requisição
   - Valida dados (validações do Bean Validation)
   - Service cria a entidade
   - Repository persiste no banco (Flyway já criou as tabelas)
   - Publica evento `professor.created` no RabbitMQ
   - Retorna resposta HTTP 201 Created

5. **RabbitMQ**: Evento é publicado na exchange `distrischool.events.exchange` com routing key `professor.created`

6. **Resposta**: JSON com o professor criado é retornado ao frontend

7. **Frontend**: Atualiza a lista de professores

### Fluxo de Consulta de Alunos

1. **Frontend**: Usuário acessa a página de alunos
   ```javascript
   GET http://distrischool.local/api/alunos
   ```

2. **Ingress** → **API Gateway** → **Aluno Service**

3. **Aluno Service**:
   - Controller recebe requisição
   - Service consulta repository
   - Repository executa query no PostgreSQL
   - Retorna lista de alunos

4. **Resposta**: JSON com array de alunos

5. **Frontend**: Renderiza cards com informações dos alunos

---

## Comunicação Entre Serviços

### Comunicação Síncrona (REST)

**Quando usar**:
- Quando é necessária resposta imediata
- Operações CRUD
- Consultas

**Implementação**:
- HTTP/REST APIs
- JSON como formato de dados
- Spring RestTemplate ou WebClient (se necessário comunicação entre serviços)

**Exemplo**: Frontend consultando lista de professores

### Comunicação Assíncrona (Mensageria)

**Quando usar**:
- Eventos que não precisam de resposta imediata
- Notificações
- Integração entre serviços sem acoplamento direto

**Implementação**:
- RabbitMQ como message broker
- Spring AMQP
- Pattern: Event-Driven Architecture

**Exemplo**: Professor criado → evento publicado → outros serviços podem reagir

**Código de Publicação**:
```java
@Service
public class ProfessorService {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public Professor create(CreateProfessorRequest request) {
        Professor professor = // ... criar professor
        
        // Publicar evento
        rabbitTemplate.convertAndSend(
            "distrischool.events.exchange",
            "professor.created",
            professor
        );
        
        return professor;
    }
}
```

---

## Padrões Arquiteturais

### 1. API Gateway Pattern
- Ponto único de entrada
- Roteamento centralizado
- Simplifica cliente (frontend não precisa conhecer todos os serviços)

### 2. Database per Service
- Cada serviço tem seu próprio schema
- Isolamento de dados
- Independência tecnológica

### 3. Event-Driven Architecture
- Comunicação assíncrona via eventos
- Desacoplamento entre serviços
- Escalabilidade

### 4. Service Discovery
- Kubernetes DNS para localização de serviços
- Services expõem endpoints estáveis

### 5. Circuit Breaker (Potencial)
- Implementável com Spring Cloud Circuit Breaker
- Resiliência a falhas

### 6. Health Check Pattern
- Todos os serviços expõem `/actuator/health`
- Kubernetes usa para readiness/liveness probes

---

## Escalabilidade e Resiliência

### Escalabilidade Horizontal

**Como funciona**:
```bash
# Escalar Professor Service para 3 réplicas
kubectl scale deployment professor-tecadm-deployment --replicas=3
```

**Benefícios**:
- Distribuição de carga
- Maior capacidade de processamento
- Alta disponibilidade

### Resiliência

**Readiness Probes**:
```yaml
readinessProbe:
  httpGet:
    path: /actuator/health
    port: 8082
  initialDelaySeconds: 30
  periodSeconds: 10
```

**Liveness Probes**:
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 8082
  initialDelaySeconds: 60
  periodSeconds: 20
```

**Restart Policies**:
- Kubernetes reinicia pods automaticamente em caso de falha

### Isolamento de Falhas

- Falha em Professor Service não afeta Aluno Service
- Cada serviço pode falhar e ser recuperado independentemente
- RabbitMQ mantém mensagens caso um serviço esteja indisponível

---

## Conclusão

O DistriSchool demonstra uma arquitetura de microserviços completa e funcional, utilizando as melhores práticas da indústria. A separação clara de responsabilidades, comunicação bem definida e infraestrutura moderna fazem deste projeto um excelente exemplo de como construir sistemas distribuídos escaláveis e resilientes.

Para mais detalhes sobre deployment, consulte [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
Para testes dos microserviços, consulte [MICROSERVICES_TESTING.md](./MICROSERVICES_TESTING.md).
Para testes de API, consulte [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md).
