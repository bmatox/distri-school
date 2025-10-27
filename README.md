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


## 🚀 Tecnologias

### Backend
- **Java 17** - Linguagem de programação
- **Spring Boot 3.5.6** - Framework de aplicação
- **Spring Cloud Gateway 2024.0.2** - API Gateway
- **Spring Data JPA** - Persistência de dados
- **Spring AMQP** - Integração com RabbitMQ
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
distrischool-professor-tecadm-service/
├── 📂 src/                          # Professor Service (Spring Boot)
├── 📂 distrischool-aluno-main/      # Aluno Service
├── 📂 distrischool-user-service-main/ # User Service
├── 📂 api-gateway/                  # API Gateway (Spring Cloud Gateway)
├── 📂 frontend/                     # Frontend (React + Vite + Nginx)
├── 📂 k8s-manifests/                # Kubernetes manifests
│   ├── postgres/                    # PostgreSQL deployment
│   ├── rabbitmq/                    # RabbitMQ deployment
│   ├── professor-service/           # Professor Service deployment
│   ├── aluno-service/               # Aluno Service deployment
│   ├── user-service/                # User Service deployment
│   ├── api-gateway/                 # API Gateway deployment
│   ├── frontend/                    # Frontend deployment
│   └── ingress.yaml                 # Ingress rules
├── 🔧 full-deploy.ps1               # Script de deploy automatizado
├── 🔧 clean-setup.ps1               # Script de limpeza
├── 📄 docker-compose.yml            # Docker Compose para dev local
└── 📄 Dockerfile                    # Professor Service Dockerfile
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
| POST | `/v1/professores` | Cria novo professor |
| PUT | `/v1/professores/{id}` | Atualiza professor |
| DELETE | `/v1/professores/{id}` | Remove professor |

### Aluno Service (Porta 8081)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/alunos` | Lista alunos |
| GET | `/alunos/{id}` | Busca aluno por ID |
| GET | `/alunos/matricula/{matricula}` | Busca por matrícula |
| POST | `/alunos` | Cria novo aluno |
| PUT | `/alunos/{id}` | Atualiza aluno |
| DELETE | `/alunos/{id}` | Remove aluno |

### User Service (Porta 8080)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users` | Lista usuários (paginado) |
| GET | `/users/{id}` | Busca usuário por ID |
| POST | `/users` | Cria novo usuário |
| PUT | `/users/{id}` | Atualiza usuário |
| DELETE | `/users/{id}` | Remove usuário |

**📖 Para exemplos de requisições e respostas, consulte [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)**
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

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- DistriSchool Team

## 🙏 Agradecimentos

- Spring Boot Team
- RabbitMQ Team
- Kubernetes Community
- React Team
- Todos os contribuidores open-source

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
