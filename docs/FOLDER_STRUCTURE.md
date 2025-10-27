# 📁 DistriSchool - Estrutura de Pastas e Arquivos

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura Completa](#estrutura-completa)
3. [Diretórios Principais](#diretórios-principais)
4. [Estrutura dos Microserviços](#estrutura-dos-microserviços)
5. [Kubernetes Manifests](#kubernetes-manifests)
6. [Frontend](#frontend)
7. [Scripts e Automação](#scripts-e-automação)
8. [Documentação](#documentação)
9. [Arquivos de Configuração](#arquivos-de-configuração)

---

## Visão Geral

O projeto DistriSchool segue uma estrutura organizada que facilita o desenvolvimento, manutenção e deploy dos microserviços. A estrutura é dividida em:

- **Serviços Backend**: Cada um em seu próprio diretório
- **API Gateway**: Roteamento centralizado
- **Frontend**: Aplicação React
- **Kubernetes Manifests**: Configurações de deploy
- **Scripts**: Automação de deploy e limpeza
- **Documentação**: Guias e referências

---

## Estrutura Completa

```
distrischool-professor-tecadm-service/
│
├── 📄 README.md                          # Documentação principal
├── 📄 ARCHITECTURE.md                    # Documentação da arquitetura
├── 📄 DEPLOYMENT_GUIDE.md                # Guia de deploy
├── 📄 MICROSERVICES_TESTING.md           # Guia de testes de microserviços
├── 📄 API_TESTING_GUIDE.md               # Guia de testes de API
├── 📄 FOLDER_STRUCTURE.md                # Este arquivo
├── 📄 POWERSHELL_SCRIPTS_GUIDE.md        # Guia dos scripts PowerShell
│
├── 📄 pom.xml                            # Maven config do Professor Service
├── 📄 Dockerfile                         # Dockerfile do Professor Service
├── 📄 docker-compose.yml                 # Docker Compose para dev local
├── 📄 .gitignore                         # Arquivos ignorados pelo Git
│
├── 🔧 full-deploy.ps1                    # Script de deploy completo
├── 🔧 clean-setup.ps1                    # Script de limpeza
│
├── 📂 src/                               # Código do Professor Service
│   ├── 📂 main/
│   │   ├── 📂 java/
│   │   │   └── 📂 br/com/distrischool/professortecadm/
│   │   │       ├── 📄 Application.java   # Classe principal
│   │   │       ├── 📂 controller/        # Controllers REST
│   │   │       ├── 📂 service/           # Lógica de negócio
│   │   │       ├── 📂 repository/        # Camada de dados
│   │   │       ├── 📂 model/             # Entidades JPA
│   │   │       ├── 📂 dto/               # Data Transfer Objects
│   │   │       ├── 📂 config/            # Configurações
│   │   │       └── 📂 exception/         # Exceções customizadas
│   │   │
│   │   └── 📂 resources/
│   │       ├── 📄 application.properties # Configurações Spring
│   │       └── 📂 db/migration/          # Scripts Flyway
│   │           ├── V001__create_tables.sql
│   │           └── V002__add_constraints.sql
│   │
│   └── 📂 test/                          # Testes unitários
│       └── 📂 java/
│           └── 📂 br/com/distrischool/professortecadm/
│
├── 📂 distrischool-aluno-main/           # Aluno Service (subprojeto)
│   ├── 📄 pom.xml
│   ├── 📄 Dockerfile
│   └── 📂 src/
│       ├── 📂 main/
│       │   ├── 📂 java/...
│       │   └── 📂 resources/
│       │       ├── 📄 application.properties
│       │       └── 📂 db/migration/
│       │
│       └── 📂 test/
│
├── 📂 distrischool-user-service-main/    # User Service (subprojeto)
│   ├── 📂 user-service/
│   │   ├── 📄 pom.xml
│   │   ├── 📄 Dockerfile
│   │   └── 📂 src/
│   │       ├── 📂 main/
│   │       │   ├── 📂 java/...
│   │       │   └── 📂 resources/
│   │       │
│   │       └── 📂 test/
│   │
│   └── 📄 README.md
│
├── 📂 api-gateway/                       # API Gateway (Spring Cloud Gateway)
│   ├── 📄 pom.xml
│   ├── 📄 Dockerfile
│   └── 📂 src/
│       └── 📂 main/
│           ├── 📂 java/
│           │   └── 📂 br/com/distrischool/gateway/
│           │       ├── 📄 GatewayApplication.java
│           │       └── 📂 config/
│           │           └── 📄 GatewayConfig.java
│           │
│           └── 📂 resources/
│               └── 📄 application.yml    # Configuração de rotas
│
├── 📂 frontend/                          # Frontend React
│   ├── 📄 package.json                   # Dependências npm
│   ├── 📄 package-lock.json
│   ├── 📄 vite.config.js                 # Configuração Vite
│   ├── 📄 eslint.config.js               # Linter
│   ├── 📄 Dockerfile                     # Multi-stage: build + Nginx
│   ├── 📄 nginx.conf                     # Configuração Nginx
│   ├── 📄 index.html                     # HTML base
│   │
│   ├── 📂 public/
│   │   ├── 📄 config.js                  # Configuração de API URL
│   │   └── 📄 favicon.ico
│   │
│   └── 📂 src/
│       ├── 📄 main.jsx                   # Entry point
│       ├── 📄 App.jsx                    # Componente principal
│       ├── 📄 index.css                  # Estilos globais
│       │
│       ├── 📂 components/                # Componentes React
│       │   ├── 📄 Dashboard.jsx
│       │   ├── 📄 ProfessorList.jsx
│       │   ├── 📄 ProfessorForm.jsx
│       │   ├── 📄 AlunoList.jsx
│       │   ├── 📄 AlunoForm.jsx
│       │   └── 📄 UserList.jsx
│       │
│       ├── 📂 services/                  # Serviços de API
│       │   ├── 📄 api.js                 # Cliente HTTP base
│       │   ├── 📄 professorService.js
│       │   ├── 📄 alunoService.js
│       │   └── 📄 userService.js
│       │
│       └── 📂 utils/                     # Utilitários
│           └── 📄 validation.js
│
├── 📂 k8s-manifests/                     # Manifests Kubernetes
│   │
│   ├── 📂 postgres/
│   │   ├── 📄 deployment.yaml            # PostgreSQL deployment
│   │   ├── 📄 service.yaml               # PostgreSQL service
│   │   └── 📄 pvc.yaml                   # PersistentVolumeClaim
│   │
│   ├── 📂 rabbitmq/
│   │   ├── 📄 deployment.yaml            # RabbitMQ deployment
│   │   └── 📄 service.yaml               # RabbitMQ service (NodePort)
│   │
│   ├── 📂 professor-service/
│   │   ├── 📄 deployment.yaml            # Professor Service deployment
│   │   └── 📄 service.yaml               # Professor Service service
│   │
│   ├── 📂 aluno-service/
│   │   ├── 📄 deployment.yaml
│   │   └── 📄 service.yaml
│   │
│   ├── 📂 user-service/
│   │   ├── 📄 deployment.yaml
│   │   └── 📄 service.yaml
│   │
│   ├── 📂 api-gateway/
│   │   ├── 📄 deployment.yaml
│   │   └── 📄 service.yaml
│   │
│   ├── 📂 frontend/
│   │   ├── 📄 deployment.yaml
│   │   └── 📄 service.yaml
│   │
│   └── 📄 ingress.yaml                   # Ingress para roteamento externo
│
├── 📂 k8s/                               # Configurações alternativas (legacy)
│
└── 📂 .mvn/                              # Maven wrapper
    └── 📂 wrapper/
        ├── 📄 maven-wrapper.properties
        └── 📄 MavenWrapperDownloader.java
```

---

## Diretórios Principais

### 1. Raiz do Projeto (`/`)

**Propósito**: Contém o Professor Service e arquivos de configuração global

**Arquivos Importantes**:

- **`README.md`**: Documentação principal do projeto
  - Overview do sistema
  - Instruções de instalação
  - Links para outras documentações

- **`pom.xml`**: Configuração Maven do Professor Service
  - Dependências: Spring Boot, PostgreSQL, RabbitMQ, Flyway
  - Plugins de build
  - Versão do Java (17)

- **`Dockerfile`**: Build multi-stage do Professor Service
  - Stage 1: Compilação com Maven
  - Stage 2: Runtime com OpenJDK slim

- **`docker-compose.yml`**: Para desenvolvimento local
  - PostgreSQL
  - Professor Service
  - Útil para testes rápidos sem Kubernetes

- **`full-deploy.ps1`**: Script de deploy automatizado
  - Configura Minikube
  - Builda imagens
  - Faz deploy no Kubernetes

- **`clean-setup.ps1`**: Script de limpeza
  - Remove recursos do Kubernetes
  - Deleta cluster Minikube
  - Limpa imagens Docker

**Quando modificar**:
- `pom.xml`: Adicionar/atualizar dependências
- `Dockerfile`: Otimizar build
- Scripts: Adicionar etapas de deploy

---

### 2. `src/` - Código do Professor Service

**Estrutura Spring Boot padrão**:

```
src/
├── main/
│   ├── java/br/com/distrischool/professortecadm/
│   │   ├── DistrischoolProfessorTecadmServiceApplication.java
│   │   │
│   │   ├── controller/
│   │   │   ├── ProfessorController.java     # REST endpoints
│   │   │   └── TecnicoController.java
│   │   │
│   │   ├── service/
│   │   │   ├── ProfessorService.java        # Lógica de negócio
│   │   │   └── MessagePublisher.java        # Publica eventos RabbitMQ
│   │   │
│   │   ├── repository/
│   │   │   └── ProfessorRepository.java     # Interface JPA
│   │   │
│   │   ├── model/
│   │   │   ├── Professor.java               # Entidade JPA
│   │   │   └── TecnicoAdministrativo.java
│   │   │
│   │   ├── dto/
│   │   │   ├── CreateProfessorRequest.java  # Request DTOs
│   │   │   ├── UpdateProfessorRequest.java
│   │   │   └── ProfessorResponse.java       # Response DTOs
│   │   │
│   │   ├── config/
│   │   │   ├── RabbitMQConfig.java          # Config RabbitMQ
│   │   │   └── OpenApiConfig.java           # Swagger config
│   │   │
│   │   └── exception/
│   │       ├── ResourceNotFoundException.java
│   │       └── GlobalExceptionHandler.java  # Exception handler
│   │
│   └── resources/
│       ├── application.properties            # Configurações
│       └── db/migration/
│           ├── V001__create_professores_table.sql
│           └── V002__create_tecnicos_table.sql
│
└── test/
    └── java/
        └── ...                               # Testes unitários
```

**Responsabilidades**:

- **`controller/`**: Endpoints REST, validação de entrada
- **`service/`**: Lógica de negócio, publicação de eventos
- **`repository/`**: Acesso a dados, queries customizadas
- **`model/`**: Entidades JPA, relacionamentos
- **`dto/`**: Transfer Objects, separação de concerns
- **`config/`**: Beans de configuração Spring
- **`exception/`**: Tratamento centralizado de erros

**Flyway Migrations** (`db/migration/`):
- Versionamento de schema
- Nomeação: `V{version}__{description}.sql`
- Executado automaticamente no startup

---

### 3. `distrischool-aluno-main/` - Aluno Service

**Estrutura similar ao Professor Service**:

```
distrischool-aluno-main/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/
    │   ├── java/br/com/distrischool/aluno/
    │   │   ├── AlunoServiceApplication.java
    │   │   ├── controller/
    │   │   │   └── AlunoController.java
    │   │   ├── service/
    │   │   │   └── AlunoService.java
    │   │   ├── repository/
    │   │   │   └── AlunoRepository.java
    │   │   ├── model/
    │   │   │   └── Aluno.java               # Com endereço embedded
    │   │   └── dto/
    │   │
    │   └── resources/
    │       ├── application.properties
    │       └── db/migration/
    │           └── V001__create_alunos_table.sql
    │
    └── test/
```

**Diferenças do Professor Service**:
- Model `Aluno` tem `Endereco` embedded
- Endpoint adicional: buscar por matrícula
- Schema separado: `aluno_db`

---

### 4. `distrischool-user-service-main/` - User Service

**Estrutura**:

```
distrischool-user-service-main/
└── user-service/
    ├── pom.xml
    ├── Dockerfile
    └── src/
        ├── main/
        │   ├── java/br/com/distrischool/user/
        │   │   ├── UserServiceApplication.java
        │   │   ├── controller/
        │   │   ├── service/
        │   │   ├── repository/
        │   │   ├── model/
        │   │   │   └── User.java            # Com senha encriptada
        │   │   └── security/                # Configurações segurança
        │   │
        │   └── resources/
        │       ├── application.properties
        │       └── db/migration/
        │
        └── test/
```

**Características**:
- Potencial Spring Security
- Senha encriptada
- Roles/permissões
- Schema: `user_db`

---

### 5. `api-gateway/` - API Gateway

**Estrutura**:

```
api-gateway/
├── pom.xml                              # Spring Cloud Gateway
├── Dockerfile
└── src/
    └── main/
        ├── java/br/com/distrischool/gateway/
        │   ├── GatewayApplication.java
        │   └── config/
        │       └── GatewayConfig.java   # Configurações CORS
        │
        └── resources/
            └── application.yml          # Rotas definidas aqui
```

**`application.yml` - Exemplo**:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: professor-service
          uri: http://professor-tecadm-service:8082
          predicates:
            - Path=/api/v1/professores/**
        
        - id: aluno-service
          uri: http://aluno-service:8081
          predicates:
            - Path=/api/alunos/**
        
        - id: user-service
          uri: http://user-service:8080
          predicates:
            - Path=/api/users/**
```

**Responsabilidades**:
- Roteamento centralizado
- CORS configuration
- Possível autenticação/autorização
- Rate limiting (futuro)

---

### 6. `frontend/` - Frontend React

**Estrutura**:

```
frontend/
├── package.json                     # Dependências npm
├── vite.config.js                   # Build config
├── Dockerfile                       # Multi-stage: build + Nginx
├── nginx.conf                       # Config Nginx para SPA
│
├── public/
│   ├── config.js                    # Configuração dinâmica de API URL
│   └── favicon.ico
│
└── src/
    ├── main.jsx                     # Entry point (ReactDOM.render)
    ├── App.jsx                      # Componente raiz com Router
    ├── index.css                    # Estilos globais
    │
    ├── components/
    │   ├── Dashboard.jsx            # Página inicial
    │   ├── ProfessorList.jsx        # Lista de professores
    │   ├── ProfessorForm.jsx        # Form criar/editar professor
    │   ├── AlunoList.jsx            # Lista de alunos
    │   ├── AlunoForm.jsx            # Form criar/editar aluno
    │   └── UserList.jsx             # Lista de usuários
    │
    ├── services/
    │   ├── api.js                   # Axios instance configurada
    │   ├── professorService.js      # CRUD professores
    │   ├── alunoService.js          # CRUD alunos
    │   └── userService.js           # CRUD usuários
    │
    └── utils/
        └── validation.js            # Funções de validação
```

**`public/config.js`**:
```javascript
window.API_BASE_URL = '/api';  // Usa path relativo com Ingress
```

**Build Process**:
1. `npm run build` → Gera bundle otimizado em `dist/`
2. Nginx serve arquivos estáticos de `dist/`
3. Todas as rotas → `index.html` (SPA routing)

---

## Kubernetes Manifests

### Estrutura de `k8s-manifests/`

Cada serviço tem seu próprio diretório com:

1. **`deployment.yaml`**: Define como o pod deve ser criado
2. **`service.yaml`**: Expõe o deployment na rede

### Exemplo: `k8s-manifests/professor-service/`

**`deployment.yaml`**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: professor-tecadm-deployment
spec:
  replicas: 1                            # Número de pods
  selector:
    matchLabels:
      app: professor-tecadm-service
  template:
    metadata:
      labels:
        app: professor-tecadm-service
    spec:
      containers:
      - name: professor-tecadm-service
        image: distrischool-professor-tecadm-service:latest
        imagePullPolicy: Never           # Usa imagem local
        ports:
        - containerPort: 8082
        env:                             # Variáveis de ambiente
        - name: SPRING_DATASOURCE_URL
          value: "jdbc:postgresql://postgres-service:5432/distrischool_db"
        - name: SPRING_RABBITMQ_HOST
          value: "rabbitmq-service"
        readinessProbe:                  # Health check
          httpGet:
            path: /actuator/health
            port: 8082
          initialDelaySeconds: 30
          periodSeconds: 10
```

**`service.yaml`**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: professor-tecadm-service       # DNS name
spec:
  type: ClusterIP                       # Interno apenas
  selector:
    app: professor-tecadm-service       # Match pods com este label
  ports:
  - port: 8082
    targetPort: 8082
```

### PostgreSQL

**`k8s-manifests/postgres/`**:

- **`pvc.yaml`**: PersistentVolumeClaim
  - Solicita 1Gi de armazenamento
  - Dados persistem mesmo se pod for deletado

- **`deployment.yaml`**: PostgreSQL deployment
  - Imagem: `postgres:15`
  - Variáveis: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
  - Volume montado em `/var/lib/postgresql/data`

- **`service.yaml`**: Service ClusterIP na porta 5432

### RabbitMQ

**`k8s-manifests/rabbitmq/`**:

- **`deployment.yaml`**: RabbitMQ deployment
  - Imagem: `rabbitmq:3-management`
  - Portas: 5672 (AMQP), 15672 (Management UI)

- **`service.yaml`**: Service NodePort
  - Management UI acessível via `minikube service rabbitmq-service --url`

### Ingress

**`k8s-manifests/ingress.yaml`**:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: distrischool-ingress
  annotations:
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

**Funcionalidade**:
- Roteia `http://distrischool.local/api` → API Gateway
- Roteia `http://distrischool.local/` → Frontend
- CORS habilitado para permitir requisições cross-origin

---

## Scripts e Automação

### `full-deploy.ps1`

**Propósito**: Deploy completo automatizado

**O que faz**:
1. Verifica pré-requisitos (Docker, Minikube, kubectl)
2. Inicia Minikube (4 CPUs, 8GB RAM)
3. Habilita e configura Ingress
4. Configura Docker daemon para Minikube
5. Builda todas as imagens Docker
6. Deploy de infraestrutura (PostgreSQL, RabbitMQ)
7. Deploy de microserviços
8. Deploy de frontend
9. Aplica Ingress
10. Configura arquivo hosts
11. Valida deployment

**Uso**:
```powershell
# Executar como Administrador (para configurar hosts)
.\full-deploy.ps1
```

### `clean-setup.ps1`

**Propósito**: Limpar ambiente completamente

**O que faz**:
1. Remove Ingress
2. Remove Frontend
3. Remove todos os backend services
4. Remove infraestrutura (PostgreSQL, RabbitMQ)
5. Deleta cluster Minikube
6. Opcionalmente remove imagens Docker

**Uso**:
```powershell
.\clean-setup.ps1
```

---

## Documentação

### Arquivos de Documentação na Raiz

- **`README.md`**: Documentação principal
  - Visão geral do projeto
  - Quick start
  - Links para outras docs

- **`ARCHITECTURE.md`**: Arquitetura detalhada
  - O que é DistriSchool
  - Tecnologias usadas
  - Diagramas de arquitetura
  - Padrões implementados

- **`DEPLOYMENT_GUIDE.md`**: Processo de deploy
  - Explicação detalhada do full-deploy.ps1
  - O que acontece em cada etapa
  - Troubleshooting

- **`MICROSERVICES_TESTING.md`**: Testes de microserviços
  - Comandos para provar independência
  - Testes de escalabilidade
  - Testes de resiliência

- **`API_TESTING_GUIDE.md`**: Testes de API
  - Endpoints de cada serviço
  - Exemplos de requisições
  - Comandos PowerShell e curl

- **`FOLDER_STRUCTURE.md`**: Este arquivo
  - Estrutura de pastas
  - Propósito de cada diretório
  - Onde adicionar novos componentes

- **`POWERSHELL_SCRIPTS_GUIDE.md`**: Guia dos scripts
  - Como usar full-deploy.ps1
  - Como usar clean-setup.ps1
  - Troubleshooting comum

---

## Arquivos de Configuração

### Spring Boot (`application.properties`)

**Localização**: `src/main/resources/application.properties`

```properties
# Server
server.port=8082

# Database
spring.datasource.url=jdbc:postgresql://postgres-service:5432/distrischool_db
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Flyway
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# RabbitMQ
spring.rabbitmq.host=rabbitmq-service
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

# Actuator
management.endpoints.web.exposure.include=health,info
```

### API Gateway (`application.yml`)

**Localização**: `api-gateway/src/main/resources/application.yml`

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
            allowedHeaders: "*"
      
      routes:
        - id: professor-service
          uri: http://professor-tecadm-service:8082
          predicates:
            - Path=/api/v1/professores/**
```

### Frontend Config (`public/config.js`)

```javascript
// Configuração dinâmica da URL da API
// Muda automaticamente dependendo do ambiente

window.API_BASE_URL = '/api';  // Produção com Ingress
// window.API_BASE_URL = 'http://localhost:8080/api';  // Dev local
```

### Docker Compose (`docker-compose.yml`)

**Para desenvolvimento local sem Kubernetes**:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: distrischool_db
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "8082:8082"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/distrischool_db
    depends_on:
      - db

volumes:
  postgres-data:
```

**Uso**:
```bash
docker-compose up -d  # Inicia PostgreSQL e app
docker-compose down   # Para tudo
```

---

## Onde Adicionar Novos Componentes

### Adicionar Novo Microserviço

1. **Criar diretório na raiz**: `novo-service/`

2. **Estrutura Spring Boot**:
   ```
   novo-service/
   ├── pom.xml
   ├── Dockerfile
   └── src/
       ├── main/
       │   ├── java/
       │   └── resources/
       │       ├── application.properties
       │       └── db/migration/
       └── test/
   ```

3. **Criar manifests Kubernetes**: `k8s-manifests/novo-service/`
   - `deployment.yaml`
   - `service.yaml`

4. **Adicionar ao API Gateway**: `api-gateway/src/main/resources/application.yml`
   ```yaml
   - id: novo-service
     uri: http://novo-service:8080
     predicates:
       - Path=/api/novo/**
   ```

5. **Atualizar full-deploy.ps1**: Adicionar build e deploy

### Adicionar Novo Componente Frontend

1. **Criar componente**: `frontend/src/components/NovoComponent.jsx`

2. **Criar serviço**: `frontend/src/services/novoService.js`

3. **Adicionar rota**: `frontend/src/App.jsx`
   ```jsx
   <Route path="/novo" element={<NovoComponent />} />
   ```

### Adicionar Nova Migration

1. **Criar arquivo**: `src/main/resources/db/migration/V00X__description.sql`

2. **Nomeação**: `V` + versão (3 dígitos) + `__` + descrição

3. **Exemplo**: `V003__add_column_to_professores.sql`

---

## Conclusão

A estrutura de pastas do DistriSchool é organizada para:

✅ **Separação clara** de responsabilidades  
✅ **Fácil navegação** entre serviços  
✅ **Escalabilidade** para adicionar novos componentes  
✅ **Manutenção** simplificada com estruturas consistentes  
✅ **Deploy automatizado** com scripts e manifests  

Cada serviço segue a mesma estrutura, facilitando onboarding de novos desenvolvedores e manutenção do projeto.

Para mais informações sobre a arquitetura, consulte [ARCHITECTURE.md](./ARCHITECTURE.md).
