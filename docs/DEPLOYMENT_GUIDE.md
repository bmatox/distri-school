# 🚀 DistriSchool - Guia Completo de Deploy

## 📖 Índice

1. [Visão Geral do Processo de Deploy](#visão-geral-do-processo-de-deploy)
2. [O Script full-deploy.ps1](#o-script-full-deployps1)
3. [Pré-requisitos e Verificação](#pré-requisitos-e-verificação)
4. [Configuração do Minikube](#configuração-do-minikube)
5. [Configuração do Ingress](#configuração-do-ingress)
6. [Configuração do Docker](#configuração-do-docker)
7. [Build das Imagens Docker](#build-das-imagens-docker)
8. [Deploy da Infraestrutura](#deploy-da-infraestrutura)
9. [Deploy dos Microserviços](#deploy-dos-microserviços)
10. [Configuração de Rede](#configuração-de-rede)
11. [Validação do Deploy](#validação-do-deploy)
12. [Troubleshooting](#troubleshooting)

---

## Visão Geral do Processo de Deploy

O deploy completo do DistriSchool é realizado através do script `full-deploy.ps1`, que automatiza todo o processo de configuração, build e deployment em um cluster Kubernetes local (Minikube). O script foi projetado para ser executado em Windows com PowerShell, mas os conceitos podem ser adaptados para Linux/Mac.

### Fluxo Geral do Deploy

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. VERIFICAÇÃO DE PRÉ-REQUISITOS                                │
│    ✓ Docker instalado e rodando                                 │
│    ✓ Minikube instalado                                          │
│    ✓ kubectl instalado                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. CONFIGURAÇÃO DO MINIKUBE                                      │
│    • Iniciar cluster com 4 CPUs e 8GB RAM                       │
│    • Driver: Docker                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CONFIGURAÇÃO DO INGRESS                                       │
│    • Habilitar addon ingress                                     │
│    • Configurar como LoadBalancer                                │
│    • Aguardar Ingress Controller iniciar                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. CONFIGURAÇÃO DO DOCKER                                        │
│    • Configurar para usar daemon do Minikube                     │
│    • Imagens serão construídas dentro do Minikube                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BUILD DAS IMAGENS DOCKER                                      │
│    • Professor Service (Multi-stage build com Maven)            │
│    • Aluno Service                                               │
│    • User Service                                                │
│    • API Gateway                                                 │
│    • Frontend (React build + Nginx)                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. DEPLOY DA INFRAESTRUTURA                                      │
│    • PostgreSQL (com PVC para persistência)                      │
│    • RabbitMQ (com management console)                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. DEPLOY DOS MICROSERVIÇOS BACKEND                              │
│    • Professor Service                                           │
│    • Aluno Service                                               │
│    • User Service                                                │
│    • API Gateway                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. DEPLOY DO FRONTEND                                            │
│    • Frontend React/Nginx                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. DEPLOY DO INGRESS                                             │
│    • Aplicar regras de roteamento                                │
│    • /api → API Gateway                                          │
│    • /    → Frontend                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. CONFIGURAÇÃO DE REDE                                         │
│     • Configurar arquivo hosts                                   │
│     • 127.0.0.1 distrischool.local                              │
│     • Limpar cache DNS                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. MINIKUBE TUNNEL (Manual)                                     │
│     • Usuário inicia tunnel em terminal separado                 │
│     • Necessário para LoadBalancer funcionar                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 12. VALIDAÇÃO                                                    │
│     • Verificar status dos pods                                  │
│     • Testar conectividade                                       │
│     • Sistema pronto para uso!                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Tempo Estimado

- **Primeira vez**: 15-25 minutos
  - Download de imagens base
  - Build completo de todas as aplicações
  
- **Execuções subsequentes**: 10-15 minutos
  - Imagens base já em cache
  - Apenas rebuild do código da aplicação

---

## O Script full-deploy.ps1

### Estrutura do Script

O script `full-deploy.ps1` é dividido em funções auxiliares e 12 etapas principais:

#### Funções Auxiliares

```powershell
# Funções de output colorido
Write-Info      # Mensagens informativas (Ciano)
Write-Success   # Mensagens de sucesso (Verde)
Write-Error     # Mensagens de erro (Vermelho)
Write-Warning   # Mensagens de aviso (Amarelo)

# Funções utilitárias
Test-Command    # Verifica se um comando existe
Wait-ForDeploymentReady  # Aguarda deployment ficar pronto
Build-DockerImage       # Constrói imagem Docker
```

### Etapas Detalhadas

---

## Pré-requisitos e Verificação

### Etapa 1: Verificação de Pré-requisitos

```powershell
Write-Info "Verificando pré-requisitos..."

if (-not (Test-Command "minikube")) {
    Write-Error "❌ Minikube não está instalado ou não está no PATH."
    exit 1
}

if (-not (Test-Command "kubectl")) {
    Write-Error "❌ kubectl não está instalado ou não está no PATH."
    exit 1
}

if (-not (Test-Command "docker")) {
    Write-Error "❌ Docker não está instalado ou não está no PATH."
    exit 1
}

Write-Success "✅ Todos os pré-requisitos estão instalados."
```

**O que acontece nos bastidores**:

1. **Test-Command** usa `Get-Command` do PowerShell para verificar se o executável existe no PATH
2. Se algum comando não for encontrado, o script exibe mensagem de erro e termina
3. Se todos os comandos existem, o script continua

**Por que é necessário**:
- Evita erros no meio do deploy
- Garante que o ambiente está pronto
- Fornece feedback imediato ao usuário

---

## Configuração do Minikube

### Etapa 2: Iniciar e Configurar Minikube

```powershell
$minikubeStatus = minikube status --format='{{.Host}}' 2>&1

if ($minikubeStatus -ne "Running") {
    Write-Warning "⚠️  Minikube não está rodando."
    Write-Info "Iniciando Minikube com as seguintes configurações:"
    Write-Info "  - CPUs: 4"
    Write-Info "  - Memória: 8192 MB (8 GB)"
    Write-Info "  - Driver: docker"
    
    minikube start --cpus=4 --memory=8192 --driver=docker
    
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao iniciar o Minikube"
    }
    Write-Success "✅ Minikube iniciado com sucesso!"
}
else {
    Write-Success "✅ Minikube já está rodando."
}
```

**O que acontece nos bastidores**:

1. **Verificação de Status**:
   ```bash
   minikube status --format='{{.Host}}'
   ```
   - Retorna "Running" se o Minikube está ativo
   - Retorna "Stopped" ou erro se não está rodando

2. **Inicialização** (se necessário):
   ```bash
   minikube start --cpus=4 --memory=8192 --driver=docker
   ```
   
   **O que o Minikube faz**:
   - Cria um container Docker especial que rodará o Kubernetes
   - Baixa imagens do Kubernetes (kubelet, kube-apiserver, etc.) - apenas na primeira vez
   - Configura rede virtual interna
   - Inicializa componentes do Kubernetes:
     - kube-apiserver (API do Kubernetes)
     - kube-controller-manager (gerenciamento de recursos)
     - kube-scheduler (agendamento de pods)
     - etcd (banco de dados do Kubernetes)
     - kubelet (agente em cada node)
     - kube-proxy (rede)
   - Configura kubeconfig para kubectl se conectar

3. **Recursos Alocados**:
   - **4 CPUs**: Suficiente para rodar todos os serviços simultaneamente
   - **8 GB RAM**: Distribuídos entre:
     - Componentes do Kubernetes: ~1 GB
     - PostgreSQL: ~512 MB
     - RabbitMQ: ~512 MB
     - Backend services (4x): ~2 GB
     - Frontend: ~256 MB
     - API Gateway: ~512 MB
     - Overhead e cache: ~3 GB

4. **Driver Docker**:
   - Minikube roda como container no Docker Desktop
   - Alternativas: virtualbox, hyperv, kvm
   - Docker é mais leve e integrado

**Primeira execução vs. Subsequentes**:

- **Primeira vez**:
  - Download de ~800 MB de imagens Kubernetes
  - Criação de volumes e rede
  - Tempo: 3-5 minutos

- **Execuções subsequentes**:
  - Imagens já em cache
  - Apenas inicialização dos componentes
  - Tempo: 30-60 segundos

---

## Configuração do Ingress

### Etapa 3: Habilitar e Configurar Ingress

```powershell
Write-Info "Habilitando addon Ingress do Minikube..."

minikube addons enable ingress

Write-Success "✅ Addon Ingress habilitado."

Write-Info "Aguardando Ingress Controller iniciar..."
Start-Sleep -Seconds 10

kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx --timeout=120s

Write-Info "🔧 Configurando Ingress Controller como LoadBalancer..."

kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec":{"type":"LoadBalancer"}}'

Write-Success "✅ Ingress Controller configurado como LoadBalancer."
```

**O que acontece nos bastidores**:

1. **Habilitar Addon**:
   ```bash
   minikube addons enable ingress
   ```
   
   **O Minikube faz**:
   - Deploy do NGINX Ingress Controller no namespace `ingress-nginx`
   - Cria os seguintes recursos:
     - Deployment: `ingress-nginx-controller`
     - Service: `ingress-nginx-controller`
     - ConfigMap: Configurações do NGINX
     - ServiceAccount: Permissões
     - ClusterRole/ClusterRoleBinding: RBAC
   
   **Pods criados**:
   ```
   ingress-nginx-controller-xxxxx   (namespace: ingress-nginx)
   ```

2. **Aguardar Inicialização**:
   ```bash
   kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx --timeout=120s
   ```
   
   - Aguarda até que o pod do Ingress Controller esteja "Ready"
   - Timeout de 120 segundos
   - Verifica readiness probe do pod

3. **Configurar como LoadBalancer**:
   ```bash
   kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec":{"type":"LoadBalancer"}}'
   ```
   
   **Por que isso é necessário**:
   - Por padrão, o Ingress Controller usa tipo NodePort
   - NodePort expõe em portas altas (30000-32767)
   - LoadBalancer permite usar portas padrão (80, 443)
   - Requer `minikube tunnel` para funcionar localmente

4. **Como o Ingress funciona**:
   ```
   Requisição HTTP → minikube tunnel → LoadBalancer → Ingress Controller → Service → Pod
   ```
   
   **Exemplo**:
   ```
   http://distrischool.local/api/v1/professores
   
   1. DNS resolve distrischool.local → 127.0.0.1
   2. minikube tunnel encaminha para LoadBalancer IP
   3. LoadBalancer encaminha para Ingress Controller
   4. Ingress Controller lê regras do Ingress:
      - Path /api → api-gateway-service:8080
   5. Service api-gateway-service encaminha para pod do API Gateway
   6. Pod processa e retorna resposta
   ```

**Arquivos de configuração Ingress**:

O script aplica posteriormente o arquivo `k8s-manifests/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: distrischool-ingress
  annotations:
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
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

---

## Configuração do Docker

### Etapa 4: Configurar Docker para Usar Daemon do Minikube

```powershell
Write-Info "Configurando ambiente Docker para usar o daemon do Minikube..."

& minikube -p minikube docker-env --shell powershell | Invoke-Expression

Write-Success "✅ Ambiente Docker configurado para Minikube."
```

**O que acontece nos bastidores**:

1. **Obter Variáveis de Ambiente**:
   ```bash
   minikube docker-env --shell powershell
   ```
   
   **Retorna**:
   ```powershell
   $Env:DOCKER_TLS_VERIFY = "1"
   $Env:DOCKER_HOST = "tcp://127.0.0.1:xxxxx"
   $Env:DOCKER_CERT_PATH = "C:\Users\usuario\.minikube\certs"
   $Env:MINIKUBE_ACTIVE_DOCKERD = "minikube"
   ```

2. **Aplicar Variáveis**:
   ```powershell
   Invoke-Expression
   ```
   - Executa os comandos de `$Env:` no shell atual
   - Docker CLI agora aponta para o daemon do Minikube

3. **Por que isso é importante**:
   
   **Sem essa configuração**:
   - `docker build` constrói imagem no Docker Desktop
   - Kubernetes não consegue ver a imagem
   - Deploy falha com "ImagePullBackOff"
   
   **Com essa configuração**:
   - `docker build` constrói imagem dentro do Minikube
   - Kubernetes acessa a imagem diretamente
   - Não é necessário registry ou push de imagens

4. **Verificação**:
   ```powershell
   docker info
   ```
   - Mostra "Name: minikube" se configurado corretamente

---

## Build das Imagens Docker

### Etapa 5: Construir Todas as Imagens Docker

```powershell
function Build-DockerImage {
    param(
        [string]$ServiceName,
        [string]$FolderPath,
        [string]$ImageTag,
        [string]$Emoji
    )

    Write-Info "$Emoji Building $ServiceName..."

    if ($FolderPath -ne ".") {
        Set-Location $FolderPath
    }

    docker build -t $ImageTag .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build falhou"
    }
    Write-Success "✅ $ServiceName construído com sucesso!"

    if ($FolderPath -ne ".") {
        Set-Location $rootDir
    }
}

# Build all services
Build-DockerImage -ServiceName "Professor Service" -FolderPath "." -ImageTag "distrischool-professor-tecadm-service:latest" -Emoji "📚"
Build-DockerImage -ServiceName "Aluno Service" -FolderPath ".\Distrischool-aluno-main" -ImageTag "distrischool-aluno-service:latest" -Emoji "👨‍🎓"
Build-DockerImage -ServiceName "User Service" -FolderPath ".\distrischool-user-service-main\user-service" -ImageTag "distrischool-user-service:latest" -Emoji "👤"
Build-DockerImage -ServiceName "API Gateway" -FolderPath ".\api-gateway" -ImageTag "distrischool-api-gateway:latest" -Emoji "🌐"
Build-DockerImage -ServiceName "Frontend" -FolderPath ".\frontend" -ImageTag "distrischool-frontend:latest" -Emoji "💻"
```

**O que acontece nos bastidores para cada serviço**:

#### Professor Service (e outros serviços backend)

**Dockerfile**:
```dockerfile
# ETAPA 1: Build com Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# ETAPA 2: Imagem de execução
FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Processo de Build**:

1. **Stage 1 - Build**:
   ```bash
   FROM maven:3.9-eclipse-temurin-17 AS build
   ```
   - Usa imagem base com Maven e JDK 17 (~500 MB)
   
   ```bash
   COPY pom.xml .
   RUN mvn dependency:go-offline
   ```
   - Copia apenas o pom.xml
   - Baixa todas as dependências Maven
   - **Otimização**: Docker cacheia esta camada
   - Se só o código mudar, dependências não são baixadas novamente
   
   ```bash
   COPY src ./src
   RUN mvn clean package -DskipTests
   ```
   - Copia código fonte
   - Compila o projeto
   - Gera arquivo JAR em `target/`
   - `-DskipTests`: Pula testes para build mais rápido

2. **Stage 2 - Runtime**:
   ```bash
   FROM openjdk:17-slim
   ```
   - Usa imagem menor, apenas JRE (~200 MB)
   - Não inclui Maven ou ferramentas de build
   
   ```bash
   COPY --from=build /app/target/*.jar app.jar
   ```
   - Copia apenas o JAR compilado do stage anterior
   - Imagem final é bem menor (~250 MB vs ~800 MB)

3. **Tempo de build**:
   - **Primeira vez**: 3-5 minutos (download de dependências Maven)
   - **Subsequente**: 1-2 minutos (dependências em cache)

#### API Gateway

Similar aos serviços backend, mas mais rápido:
- Menos dependências Maven
- Código menor
- Tempo: 1-2 minutos

#### Frontend

**Dockerfile**:
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Processo**:

1. **Stage 1 - Build do React**:
   ```bash
   FROM node:18-alpine AS build
   ```
   - Imagem Node.js Alpine (~100 MB)
   
   ```bash
   COPY package*.json ./
   RUN npm ci
   ```
   - Copia apenas package.json e package-lock.json
   - `npm ci` instala dependências (mais rápido e determinístico que `npm install`)
   - **Otimização**: Camada cacheada se package.json não mudar
   
   ```bash
   COPY . .
   RUN npm run build
   ```
   - Copia código fonte
   - `npm run build` chama Vite para build de produção
   - Gera arquivos otimizados em `/app/dist`:
     - HTML, CSS, JS minificados
     - Assets otimizados
     - Chunks para lazy loading

2. **Stage 2 - Servidor Nginx**:
   ```bash
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   ```
   - Imagem Nginx Alpine (~25 MB)
   - Copia apenas arquivos estáticos buildados
   - Não inclui Node.js ou código fonte

3. **Configuração Nginx**:
   ```nginx
   server {
       listen 80;
       root /usr/share/nginx/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   - Serve arquivos estáticos
   - Redireciona todas as rotas para index.html (SPA)

4. **Tempo de build**:
   - **Primeira vez**: 2-4 minutos (download de node_modules)
   - **Subsequente**: 30-60 segundos

**Tamanhos finais das imagens**:
```bash
docker images

distrischool-professor-tecadm-service   latest   250 MB
distrischool-aluno-service              latest   245 MB
distrischool-user-service               latest   240 MB
distrischool-api-gateway                latest   235 MB
distrischool-frontend                   latest   45 MB
```

---

## Deploy da Infraestrutura

### Etapa 6: Deploy de PostgreSQL e RabbitMQ

```powershell
Write-Info "🐘 Aplicando PostgreSQL..."
kubectl apply -f k8s-manifests/postgres/

Write-Info "🐰 Aplicando RabbitMQ..."
kubectl apply -f k8s-manifests/rabbitmq/

Write-Info "⏳ Aguardando infraestrutura ficar pronta..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s
kubectl wait --for=condition=ready pod -l app=rabbitmq --timeout=120s
```

**O que acontece nos bastidores**:

#### PostgreSQL

**Arquivos aplicados** (`k8s-manifests/postgres/`):

1. **pvc.yaml** (PersistentVolumeClaim):
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: postgres-pvc
   spec:
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 1Gi
   ```
   
   **O que faz**:
   - Solicita 1 GB de armazenamento persistente
   - `ReadWriteOnce`: Pode ser montado por apenas um node
   - Kubernetes cria um PersistentVolume automaticamente (no Minikube)
   - Dados persistem mesmo se o pod for deletado/recriado

2. **deployment.yaml**:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: postgres-deployment
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: postgres
     template:
       metadata:
         labels:
           app: postgres
       spec:
         containers:
         - name: postgres
           image: postgres:15
           env:
           - name: POSTGRES_USER
             value: "postgres"
           - name: POSTGRES_PASSWORD
             value: "postgres"
           - name: POSTGRES_DB
             value: "distrischool_db"
           ports:
           - containerPort: 5432
           volumeMounts:
           - name: postgres-storage
             mountPath: /var/lib/postgresql/data
           readinessProbe:
             exec:
               command:
               - pg_isready
               - -U
               - postgres
             initialDelaySeconds: 10
             periodSeconds: 5
         volumes:
         - name: postgres-storage
           persistentVolumeClaim:
             claimName: postgres-pvc
   ```
   
   **O que acontece**:
   - Kubernetes cria um Pod com container PostgreSQL 15
   - Variáveis de ambiente configuram usuário/senha/database
   - Volume persistente é montado em `/var/lib/postgresql/data`
   - **Readiness Probe**: Executa `pg_isready` a cada 5s
     - Pod só recebe tráfego quando probe retorna sucesso
   
   **Inicialização**:
   1. Kubernetes agenda pod em um node
   2. Docker puxa imagem `postgres:15` (primeira vez: ~130 MB)
   3. Container inicia
   4. PostgreSQL inicializa database:
      - Cria estruturas de sistema
      - Configura usuário postgres
      - Cria database distrischool_db
   5. Readiness probe começa a verificar
   6. Quando probe passa, pod fica "Ready"
   
   **Tempo**: 20-40 segundos

3. **service.yaml**:
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: postgres-service
   spec:
     type: ClusterIP
     selector:
       app: postgres
     ports:
     - port: 5432
       targetPort: 5432
   ```
   
   **O que faz**:
   - Cria endpoint estável: `postgres-service:5432`
   - Outros pods podem se conectar usando esse nome
   - Kubernetes DNS resolve `postgres-service` para IP do pod
   - Se pod for recriado, Service continua apontando corretamente

#### RabbitMQ

**Arquivos aplicados** (`k8s-manifests/rabbitmq/`):

1. **deployment.yaml**:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: rabbitmq-deployment
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: rabbitmq
     template:
       metadata:
         labels:
           app: rabbitmq
       spec:
         containers:
         - name: rabbitmq
           image: rabbitmq:3-management
           ports:
           - containerPort: 5672   # AMQP
           - containerPort: 15672  # Management UI
           env:
           - name: RABBITMQ_DEFAULT_USER
             value: "guest"
           - name: RABBITMQ_DEFAULT_PASS
             value: "guest"
           readinessProbe:
             exec:
               command:
               - rabbitmq-diagnostics
               - -q
               - ping
             initialDelaySeconds: 20
             periodSeconds: 10
   ```
   
   **O que acontece**:
   - Imagem `rabbitmq:3-management` inclui console web (~150 MB)
   - Porta 5672: Protocolo AMQP (mensagens)
   - Porta 15672: Interface web de gerenciamento
   - **Readiness Probe**: `rabbitmq-diagnostics ping`
   
   **Inicialização**:
   1. Container inicia RabbitMQ
   2. Cria usuário guest/guest
   3. Inicializa plugins (management)
   4. Readiness probe verifica até RabbitMQ responder
   5. Pod fica "Ready"
   
   **Tempo**: 30-50 segundos

2. **service.yaml**:
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: rabbitmq-service
   spec:
     type: NodePort
     selector:
       app: rabbitmq
     ports:
     - name: amqp
       port: 5672
       targetPort: 5672
     - name: management
       port: 15672
       targetPort: 15672
       nodePort: 30672
   ```
   
   **O que faz**:
   - Endpoint interno: `rabbitmq-service:5672` (AMQP)
   - Endpoint interno: `rabbitmq-service:15672` (Management)
   - NodePort 30672: Acesso externo ao Management via `minikube service rabbitmq-service --url`

**Verificação de Prontidão**:

```bash
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s
kubectl wait --for=condition=ready pod -l app=rabbitmq --timeout=120s
```

- Aguarda até readiness probes passarem
- Timeout de 120 segundos
- Se falhar, script para com erro

---

## Deploy dos Microserviços

### Etapa 7: Deploy dos Backend Services

```powershell
Write-Info "📚 Aplicando Professor Service..."
kubectl apply -f k8s-manifests/professor-service/

Write-Info "👨‍🎓 Aplicando Aluno Service..."
kubectl apply -f k8s-manifests/aluno-service/

Write-Info "👤 Aplicando User Service..."
kubectl apply -f k8s-manifests/user-service/

Write-Info "🌐 Aplicando API Gateway..."
kubectl apply -f k8s-manifests/api-gateway/

Wait-ForDeploymentReady -DeploymentName "professor-tecadm-deployment"
Wait-ForDeploymentReady -DeploymentName "aluno-deployment"
Wait-ForDeploymentReady -DeploymentName "user-deployment"
Wait-ForDeploymentReady -DeploymentName "api-gateway-deployment"
```

**O que acontece nos bastidores**:

#### Exemplo: Professor Service

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: professor-tecadm-deployment
spec:
  replicas: 1
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
        imagePullPolicy: Never  # Importante! Usa imagem local
        ports:
        - containerPort: 8082
        env:
        - name: SPRING_DATASOURCE_URL
          value: "jdbc:postgresql://postgres-service:5432/distrischool_db"
        - name: SPRING_DATASOURCE_USERNAME
          value: "postgres"
        - name: SPRING_DATASOURCE_PASSWORD
          value: "postgres"
        - name: SPRING_RABBITMQ_HOST
          value: "rabbitmq-service"
        - name: SPRING_RABBITMQ_PORT
          value: "5672"
        - name: SPRING_RABBITMQ_USERNAME
          value: "guest"
        - name: SPRING_RABBITMQ_PASSWORD
          value: "guest"
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8082
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8082
          initialDelaySeconds: 60
          periodSeconds: 20
```

**Processo de Deploy**:

1. **Kubernetes cria Pod**:
   ```bash
   kubectl apply -f k8s-manifests/professor-service/deployment.yaml
   ```

2. **Scheduling**:
   - Scheduler escolhe node (no Minikube, há apenas um)
   - Verifica se há recursos suficientes (CPU, RAM)

3. **Pull de Imagem**:
   - `imagePullPolicy: Never` → Kubernetes usa imagem já no daemon local
   - Se fosse `Always`, tentaria fazer pull de um registry

4. **Start do Container**:
   - Docker inicia container com a imagem
   - Variáveis de ambiente são injetadas
   - Container executa: `java -jar app.jar`

5. **Inicialização da Aplicação Spring Boot**:
   
   **O que acontece dentro do container**:
   
   a. **Spring Boot inicia** (~10 segundos):
      ```
      Starting DistrischoolProfessorTecadmServiceApplication
      ```
   
   b. **Flyway executa migrations** (~5 segundos):
      ```
      Flyway: Migrating schema "professor_db" to version 001
      Flyway: Successfully applied 1 migration
      ```
      - Cria tabelas: `professores`, `tecnicos_administrativos`, etc.
   
   c. **Conexão com PostgreSQL**:
      ```
      HikariPool-1 - Starting...
      HikariPool-1 - Start completed.
      ```
      - URL: `jdbc:postgresql://postgres-service:5432/distrischool_db`
      - DNS do Kubernetes resolve `postgres-service` para IP do pod
   
   d. **Conexão com RabbitMQ**:
      ```
      o.s.a.r.c.CachingConnectionFactory : Created new connection: rabbitConnectionFactory#1234
      ```
      - Host: `rabbitmq-service:5672`
      - Cria exchange `distrischool.events.exchange` se não existir
   
   e. **Servidor web inicia**:
      ```
      Tomcat started on port(s): 8082 (http)
      Started DistrischoolProfessorTecadmServiceApplication in 25.123 seconds
      ```

6. **Health Checks**:
   
   **Readiness Probe**:
   ```bash
   curl http://<pod-ip>:8082/actuator/health
   ```
   - Inicia após 30 segundos
   - Verifica a cada 10 segundos
   - Resposta esperada:
     ```json
     {
       "status": "UP",
       "components": {
         "db": {"status": "UP"},
         "diskSpace": {"status": "UP"},
         "ping": {"status": "UP"},
         "rabbit": {"status": "UP"}
       }
     }
     ```
   - Quando retorna "UP", pod fica "Ready"
   - Service começa a encaminhar tráfego para o pod
   
   **Liveness Probe**:
   ```bash
   curl http://<pod-ip>:8082/actuator/health
   ```
   - Inicia após 60 segundos
   - Verifica a cada 20 segundos
   - Se falhar 3 vezes consecutivas, Kubernetes reinicia o pod

7. **Rollout Status**:
   ```powershell
   Wait-ForDeploymentReady -DeploymentName "professor-tecadm-deployment"
   ```
   
   **O que isso faz**:
   ```bash
   kubectl rollout status deployment/professor-tecadm-deployment --timeout=180s
   ```
   - Aguarda até o deployment estar completamente disponível
   - Verifica se:
     - Réplicas desejadas == Réplicas disponíveis
     - Todas as réplicas estão "Ready"
   - Se timeout, script para com erro

**Tempo de deploy de cada serviço**: 40-60 segundos

#### Service (Networking)

**service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: professor-tecadm-service
spec:
  type: ClusterIP
  selector:
    app: professor-tecadm-service
  ports:
  - port: 8082
    targetPort: 8082
```

**O que faz**:
- Cria endpoint: `professor-tecadm-service:8082`
- API Gateway pode acessar via `http://professor-tecadm-service:8082/api/v1/professores`
- Kubernetes DNS torna o nome resolúvel
- Se houver múltiplas réplicas, faz load balancing automaticamente

**Os outros serviços seguem o mesmo padrão**:
- Aluno Service: Porta 8081
- User Service: Porta 8080
- API Gateway: Porta 8080

---

## Deploy do Frontend

### Etapa 8: Deploy do Frontend

```powershell
Write-Info "💻 Aplicando Frontend..."
kubectl apply -f k8s-manifests/frontend/

Wait-ForDeploymentReady -DeploymentName "frontend-deployment"
```

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: distrischool-frontend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 80
```

**O que acontece**:

1. **Kubernetes cria Pod com Nginx**
2. **Nginx serve arquivos estáticos**:
   - `/usr/share/nginx/html/index.html`
   - `/usr/share/nginx/html/assets/*.js`
   - `/usr/share/nginx/html/assets/*.css`

3. **Configuração do Nginx**:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
   - Qualquer rota que não encontra arquivo → redireciona para index.html
   - Permite que React Router funcione no refresh

4. **Config.js**:
   - Frontend acessa `/config.js` para obter URL da API
   - Em produção com Ingress: usa `/api` (path relativo)

**service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
```

**Tempo**: 10-20 segundos (imagem pequena e rápida de iniciar)

---

## Deploy do Ingress

### Etapa 9: Aplicar Regras de Ingress

```powershell
Write-Info "🌐 Aplicando Ingress..."
kubectl apply -f k8s-manifests/ingress.yaml
```

**ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: distrischool-ingress
  annotations:
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "Content-Type, Authorization"
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

**O que acontece nos bastidores**:

1. **Ingress Controller lê o recurso Ingress**:
   - Pod do Ingress Controller observa mudanças em recursos Ingress
   - Quando novo Ingress é criado/atualizado, Controller detecta

2. **Controller configura NGINX**:
   - Ingress Controller é essencialmente um NGINX configurável
   - Traduz regras do Ingress para configuração NGINX
   
   **Configuração NGINX gerada** (simplificada):
   ```nginx
   server {
       listen 80;
       server_name distrischool.local;
       
       # CORS headers
       add_header Access-Control-Allow-Origin *;
       add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
       add_header Access-Control-Allow-Headers "Content-Type, Authorization";
       
       # API routes
       location /api {
           proxy_pass http://api-gateway-service:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # Frontend routes
       location / {
           proxy_pass http://frontend-service:80;
           proxy_set_header Host $host;
       }
   }
   ```

3. **Reload do NGINX**:
   - Controller recarrega configuração do NGINX
   - Novas regras entram em efeito

4. **Fluxo de Requisição**:
   ```
   http://distrischool.local/api/v1/professores
   
   1. DNS: distrischool.local → 127.0.0.1
   2. minikube tunnel encaminha para LoadBalancer
   3. LoadBalancer → Ingress Controller (NGINX)
   4. NGINX lê Host header: distrischool.local
   5. NGINX analisa path: /api/v1/professores
   6. Match com regra: path /api
   7. Proxy para: api-gateway-service:8080/api/v1/professores
   8. Service encaminha para pod do API Gateway
   9. API Gateway roteia para professor-tecadm-service:8082
   10. Resposta retorna pelo mesmo caminho
   ```

**Annotations CORS**:

```yaml
annotations:
  nginx.ingress.kubernetes.io/enable-cors: "true"
  nginx.ingress.kubernetes.io/cors-allow-origin: "*"
```

**O que fazem**:
- Habilitam CORS no NGINX
- Frontend pode fazer requisições para API de origem diferente
- Headers CORS são adicionados automaticamente nas respostas
- Permite `OPTIONS` preflight requests

---

## Configuração de Rede

### Etapa 10: Configurar Arquivo Hosts

```powershell
$externalIp = kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

if ([string]::IsNullOrEmpty($externalIp)) {
    $externalIp = "127.0.0.1"
}

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsEntry = "$externalIp distrischool.local"

# Remove entrada antiga se existir
$hostsContent = Get-Content $hostsPath
$hostsContent | Where-Object { $_ -notmatch "distrischool.local" } | Set-Content $hostsPath

# Adiciona nova entrada
Add-Content -Path $hostsPath -Value "`n$hostsEntry"

ipconfig /flushdns
```

**O que acontece nos bastidores**:

1. **Obter IP do LoadBalancer**:
   ```bash
   kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
   ```
   
   - Em ambientes cloud (AWS, GCP): Retorna IP público
   - No Minikube: Geralmente vazio até `minikube tunnel` rodar
   - Script usa 127.0.0.1 como padrão

2. **Modificar arquivo hosts**:
   
   **Arquivo**: `C:\Windows\System32\drivers\etc\hosts`
   
   **Antes**:
   ```
   # Copyright (c) 1993-2009 Microsoft Corp.
   127.0.0.1       localhost
   ::1             localhost
   ```
   
   **Depois**:
   ```
   # Copyright (c) 1993-2009 Microsoft Corp.
   127.0.0.1       localhost
   ::1             localhost
   
   127.0.0.1 distrischool.local
   ```
   
   **O que isso faz**:
   - Quando navegador acessa `http://distrischool.local`
   - Sistema operacional consulta arquivo hosts antes do DNS
   - Resolve `distrischool.local` para `127.0.0.1`
   - Requisição vai para localhost

3. **Limpar cache DNS**:
   ```bash
   ipconfig /flushdns
   ```
   - Windows cacheia resoluções DNS
   - Comando limpa o cache
   - Garante que nova entrada seja usada imediatamente

4. **Como funciona com minikube tunnel**:
   
   **minikube tunnel** (executado manualmente):
   ```bash
   minikube tunnel
   ```
   
   **O que faz**:
   - Cria rotas de rede no Windows
   - Encaminha tráfego de 127.0.0.1 para Minikube
   - Especificamente, encaminha para LoadBalancer IPs
   - Deve rodar em terminal separado como Admin
   
   **Rotas criadas**:
   ```
   10.96.0.0/12 → 192.168.49.2 (IP interno do Minikube)
   ```
   
   **Fluxo completo**:
   ```
   Navegador: http://distrischool.local
       ↓
   DNS (hosts file): distrischool.local → 127.0.0.1
       ↓
   minikube tunnel: 127.0.0.1 → LoadBalancer IP do Ingress
       ↓
   Ingress Controller: Processa requisição
       ↓
   Roteia para service apropriado
   ```

---

## Validação do Deploy

### Etapa 11 e 12: Minikube Tunnel e Validação

```powershell
Write-Warning "⚠️  IMPORTANTE: O Minikube Tunnel precisa estar rodando!"
Write-Host "1. Abrir um NOVO PowerShell como ADMINISTRADOR"
Write-Host "2. Executar: minikube tunnel"
Write-Host "3. MANTER esse terminal aberto"

Read-Host "Pressione ENTER depois de iniciar o 'minikube tunnel' em outro terminal..."

Write-Info "Status dos Pods:"
kubectl get pods -A

Write-Info "Status dos Serviços:"
kubectl get services

Write-Info "Status do Ingress:"
kubectl get ingress

Write-Info "Testando acesso ao frontend..."
$response = Invoke-WebRequest -Uri "http://distrischool.local" -TimeoutSec 5 -UseBasicParsing
if ($response.StatusCode -eq 200) {
    Write-Success "✅ Frontend está acessível!"
}
```

**Validações realizadas**:

1. **Status dos Pods**:
   ```bash
   kubectl get pods -A
   ```
   
   **Saída esperada**:
   ```
   NAMESPACE       NAME                                        READY   STATUS    RESTARTS   AGE
   default         postgres-deployment-xxx                     1/1     Running   0          5m
   default         rabbitmq-deployment-xxx                     1/1     Running   0          5m
   default         professor-tecadm-deployment-xxx             1/1     Running   0          3m
   default         aluno-deployment-xxx                        1/1     Running   0          3m
   default         user-deployment-xxx                         1/1     Running   0          3m
   default         api-gateway-deployment-xxx                  1/1     Running   0          3m
   default         frontend-deployment-xxx                     1/1     Running   0          2m
   ingress-nginx   ingress-nginx-controller-xxx                1/1     Running   0          8m
   ```
   
   **Verificar**:
   - Todos devem estar `Running`
   - `READY` deve ser `1/1`
   - `RESTARTS` deve ser 0 ou baixo

2. **Status dos Services**:
   ```bash
   kubectl get services
   ```
   
   **Saída esperada**:
   ```
   NAME                        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
   kubernetes                  ClusterIP   10.96.0.1       <none>        443/TCP
   postgres-service            ClusterIP   10.96.100.1     <none>        5432/TCP
   rabbitmq-service            NodePort    10.96.100.2     <none>        5672:30672/TCP,15672:30672/TCP
   professor-tecadm-service    ClusterIP   10.96.100.3     <none>        8082/TCP
   aluno-service               ClusterIP   10.96.100.4     <none>        8081/TCP
   user-service                ClusterIP   10.96.100.5     <none>        8080/TCP
   api-gateway-service         ClusterIP   10.96.100.6     <none>        8080/TCP
   frontend-service            ClusterIP   10.96.100.7     <none>        80/TCP
   ```

3. **Status do Ingress**:
   ```bash
   kubectl get ingress
   ```
   
   **Saída esperada**:
   ```
   NAME                  CLASS   HOSTS                 ADDRESS         PORTS   AGE
   distrischool-ingress  nginx   distrischool.local    10.96.100.100   80      2m
   ```
   
   **Verificar**:
   - `ADDRESS` deve estar preenchido
   - `HOSTS` deve ser `distrischool.local`

4. **Teste HTTP**:
   ```powershell
   Invoke-WebRequest -Uri "http://distrischool.local"
   ```
   
   **Se funcionar**:
   - StatusCode: 200
   - Frontend HTML é retornado
   - Sistema está funcionando!
   
   **Se falhar**:
   - Verificar se minikube tunnel está rodando
   - Verificar arquivo hosts
   - Verificar se frontend pod está Ready

---

## Troubleshooting

### Problemas Comuns e Soluções

#### 1. ImagePullBackOff

**Erro**:
```
NAMESPACE   NAME                                        READY   STATUS             RESTARTS
default     professor-tecadm-deployment-xxx             0/1     ImagePullBackOff   0
```

**Causa**: Kubernetes não consegue encontrar a imagem

**Solução**:
```powershell
# Verificar se Docker está usando daemon do Minikube
minikube docker-env --shell powershell | Invoke-Expression

# Listar imagens disponíveis
docker images | Select-String "distrischool"

# Se imagem não existir, rebuild
cd caminho/do/servico
docker build -t distrischool-xxx-service:latest .

# Verificar que imagePullPolicy é "Never" no deployment.yaml
```

#### 2. CrashLoopBackOff

**Erro**:
```
default     professor-tecadm-deployment-xxx             0/1     CrashLoopBackOff   3
```

**Causa**: Aplicação está crasheando ao iniciar

**Solução**:
```powershell
# Ver logs do pod
kubectl logs professor-tecadm-deployment-xxx

# Comum: Não consegue conectar ao PostgreSQL
# Verificar se PostgreSQL está rodando
kubectl get pod -l app=postgres

# Comum: Erro de configuração
# Verificar variáveis de ambiente no deployment.yaml
```

#### 3. Pending

**Erro**:
```
default     professor-tecadm-deployment-xxx             0/1     Pending   0
```

**Causa**: Falta de recursos (CPU/RAM)

**Solução**:
```powershell
# Ver detalhes
kubectl describe pod professor-tecadm-deployment-xxx

# Se for falta de recursos, aumentar recursos do Minikube
minikube stop
minikube delete
minikube start --cpus=6 --memory=12288
```

#### 4. Frontend não carrega

**Sintoma**: Browser mostra "Site can't be reached"

**Soluções**:
```powershell
# 1. Verificar arquivo hosts
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "distrischool"

# 2. Adicionar se não existir (como Admin)
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "`n127.0.0.1 distrischool.local"

# 3. Limpar DNS cache
ipconfig /flushdns

# 4. Verificar se minikube tunnel está rodando
# Deve haver um terminal rodando: minikube tunnel

# 5. Testar com IP direto
kubectl get ingress
# Usar o IP mostrado em ADDRESS
```

#### 5. API retorna 404

**Sintoma**: Frontend carrega mas API retorna 404

**Soluções**:
```powershell
# 1. Verificar se API Gateway está rodando
kubectl get pod -l app=api-gateway-deployment

# 2. Ver logs do API Gateway
kubectl logs -f deployment/api-gateway-deployment

# 3. Testar diretamente o serviço
kubectl port-forward deployment/professor-tecadm-deployment 8082:8082

# Em outro terminal:
curl http://localhost:8082/api/v1/professores

# 4. Se funcionar diretamente mas não via Gateway, problema está no roteamento
```

---

## Conclusão

O processo de deploy do DistriSchool é completamente automatizado através do script `full-deploy.ps1`, que:

1. **Configura o ambiente**: Minikube, Ingress, Docker
2. **Constrói as imagens**: Build multi-stage otimizado
3. **Deploya a infraestrutura**: PostgreSQL, RabbitMQ
4. **Deploya os serviços**: Backend services, API Gateway, Frontend
5. **Configura a rede**: Ingress, hosts file
6. **Valida o sistema**: Health checks, testes de conectividade

O resultado é um cluster Kubernetes completo e funcional com uma arquitetura de microserviços pronta para uso, acessível através de `http://distrischool.local`.

Para arquitetura detalhada, consulte [ARCHITECTURE.md](./ARCHITECTURE.md).
Para testes de microserviços, consulte [MICROSERVICES_TESTING.MD](./MICROSERVICES_TESTING.md).
