# 🎓 DistriSchool - Pitch de Apresentação

## Plataforma de Gestão Escolar Distribuída

> Apresentação de 10 minutos | 8 slides

---

## 📋 Índice dos Slides

1. [Slide 1: Capa e Introdução](#slide-1-capa-e-introdução)
2. [Slide 2: O Problema](#slide-2-o-problema)
3. [Slide 3: A Solução - DistriSchool](#slide-3-a-solução---distrischool)
4. [Slide 4: Arquitetura do Sistema](#slide-4-arquitetura-do-sistema)
5. [Slide 5: Stack Tecnológico](#slide-5-stack-tecnológico)
6. [Slide 6: Funcionalidades Principais](#slide-6-funcionalidades-principais)
7. [Slide 7: Demonstração e Resultados](#slide-7-demonstração-e-resultados)
8. [Slide 8: Conclusão e Próximos Passos](#slide-8-conclusão-e-próximos-passos)

---

# Slide 1: Capa e Introdução

> 📸 **Sugestão de Print**: Logo do projeto ou screenshot da tela inicial do sistema (Dashboard)

## 🎓 DistriSchool

### Plataforma de Gestão Escolar Distribuída

**Uma solução moderna baseada em microserviços para a gestão acadêmica**

---

**Desenvolvido em 8 semanas seguindo metodologia ágil**

- ✅ Arquitetura de Microserviços
- ✅ Containerização com Docker
- ✅ Orquestração com Kubernetes
- ✅ Comunicação Síncrona e Assíncrona
- ✅ Frontend Moderno com React

**Equipe**: DistriSchool Team

---

# Slide 2: O Problema

> 📸 **Sugestão de Print**: Imagem ilustrativa de um sistema monolítico travado ou mensagem de erro genérica de sistemas legados

## 🔴 Desafios da Gestão Escolar Tradicional

### Problemas dos Sistemas Monolíticos

| Problema | Impacto |
|----------|---------|
| **Sistemas Acoplados** | Falha em um módulo afeta todo o sistema |
| **Dificuldade de Escalar** | Não é possível escalar funcionalidades isoladamente |
| **Deploy Arriscado** | Atualizações exigem parada total do sistema |
| **Tecnologia Obsoleta** | Difícil adotar novas tecnologias |
| **Time-to-Market Lento** | Novas funcionalidades demoram para serem lançadas |

### Cenário Atual

- 🏫 Instituições com sistemas legados difíceis de manter
- 📉 Downtime afetando alunos, professores e administração
- 💰 Alto custo de infraestrutura para garantir disponibilidade
- 🔒 Dificuldade em implementar segurança moderna

---

# Slide 3: A Solução - DistriSchool

> 📸 **Sugestão de Print**: Screenshot da interface principal do DistriSchool mostrando o Dashboard com cards de navegação para Alunos, Professores, Notas e Notificações

## ✅ Uma Abordagem Moderna e Distribuída

### O que é o DistriSchool?

Uma **plataforma completa de gestão escolar** baseada em **arquitetura de microserviços**, oferecendo:

### Proposta de Valor

| Benefício | Como Entregamos |
|-----------|-----------------|
| **Alta Disponibilidade** | Serviços independentes - falha isolada não derruba o sistema |
| **Escalabilidade** | Escale apenas o que precisa (ex: só o serviço de notas em época de provas) |
| **Deploy Contínuo** | Atualize serviços sem parar o sistema |
| **Flexibilidade Tecnológica** | Cada serviço pode usar a tecnologia mais adequada |
| **Resiliência** | Circuit Breaker e Retry protegem contra falhas em cascata |

### Público-Alvo

- 🎓 **Instituições de Ensino**: Escolas, faculdades e universidades
- 👨‍💼 **Administradores**: Gestão simplificada de alunos, professores e notas
- 👨‍🏫 **Professores**: Lançamento de notas e comunicação com alunos
- 👨‍🎓 **Alunos**: Acesso a notas e notificações em tempo real

---

# Slide 4: Arquitetura do Sistema

> 📸 **Sugestão de Print**: 
> - Diagrama de arquitetura (pode usar o ASCII art abaixo ou criar versão visual)
> - Screenshot do Kubernetes Dashboard mostrando os pods rodando
> - Screenshot do RabbitMQ Management Console mostrando as filas

## 🏗️ Arquitetura de Microserviços

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Navegador)                          │
│                    Frontend React + Nginx (SPA)                      │
└─────────────────────────────┬────────────────────────────────────────┘
                              │ HTTP/HTTPS
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES INGRESS (NGINX)                        │
│              Load Balancing + SSL Termination + CORS                 │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Spring Cloud Gateway)                 │
│          Roteamento Centralizado + Autenticação JWT + CORS           │
└───────┬──────────┬──────────┬──────────┬──────────┬─────────────────┘
        │          │          │          │          │
        ▼          ▼          ▼          ▼          ▼
   ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
   │  USER   ││PROFESSOR││  ALUNO  ││ GRADES  ││ COMMUNI-│
   │ SERVICE ││ SERVICE ││ SERVICE ││ SERVICE ││ CATION  │
   │  :8080  ││  :8082  ││  :8081  ││  :8083  ││  :8084  │
   └────┬────┘└────┬────┘└────┬────┘└────┬────┘└────┬────┘
        │          │          │          │          │
        └──────────┴──────────┴──────┬───┴──────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
      ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
      │  PostgreSQL │        │  RabbitMQ   │        │ Prometheus  │
      │   Database  │        │ (Mensageria)│        │ + Grafana   │
      └─────────────┘        └─────────────┘        └─────────────┘
```

### Princípios Arquiteturais

- 🔹 **Database per Service**: Cada serviço com schema próprio
- 🔹 **Event-Driven**: Comunicação assíncrona via RabbitMQ
- 🔹 **API Gateway Pattern**: Ponto único de entrada
- 🔹 **Service Discovery**: Kubernetes DNS automático
- 🔹 **Resiliência**: Circuit Breaker (Resilience4J)

---

# Slide 5: Stack Tecnológico

> 📸 **Sugestão de Print**: 
> - Logos das tecnologias utilizadas (Java, Spring Boot, React, Docker, Kubernetes, PostgreSQL, RabbitMQ)
> - Screenshot do código fonte de um microserviço (ex: ProfessorController.java)
> - Screenshot do terminal com comandos `kubectl get pods` mostrando todos os serviços

## 💻 Tecnologias Utilizadas

### Backend (Microserviços)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Java** | 17 LTS | Linguagem principal |
| **Spring Boot** | 3.5.6 | Framework de aplicação |
| **Spring Cloud Gateway** | 2024.0.2 | API Gateway |
| **Spring Data JPA** | - | Persistência de dados |
| **Spring AMQP** | - | Integração com RabbitMQ |
| **Resilience4J** | 2.1.0 | Circuit Breaker e Retry |
| **Flyway** | - | Migrations de banco de dados |
| **JWT (JJWT)** | 0.12.6 | Autenticação e autorização |

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 19 | Biblioteca UI |
| **React Router DOM** | 7 | Roteamento SPA |
| **Vite** | 7 | Build tool |
| **Nginx** | - | Web server produção |

### Infraestrutura

| Tecnologia | Uso |
|------------|-----|
| **Docker** | Containerização |
| **Kubernetes** | Orquestração |
| **PostgreSQL 15** | Banco de dados |
| **RabbitMQ 3** | Message broker |
| **Prometheus + Grafana** | Monitoramento |
| **GitHub Actions** | CI/CD |

---

# Slide 6: Funcionalidades Principais

> 📸 **Sugestão de Prints** (múltiplas imagens recomendadas):
> - **Login**: Tela de login com campos de email e senha
> - **Gestão de Usuários**: Lista de usuários com filtro por role
> - **Cadastro de Alunos**: Formulário de criação de aluno com matrícula automática
> - **Lançamento de Notas**: Professor selecionando disciplina e lançando nota
> - **Notificações**: Badge de notificações no header e lista de notificações não lidas
> - **Sincronização**: Logs do terminal mostrando eventos RabbitMQ

## ⚙️ Módulos do Sistema

### 1. Gestão de Usuários e Autenticação 🔐

- ✅ Autenticação JWT com tokens seguros (HMAC-SHA256)
- ✅ Senhas criptografadas com BCrypt
- ✅ Controle de acesso baseado em roles (RBAC)
- ✅ Perfis: **ADMIN**, **TEACHER**, **STUDENT**, **TECHNICAL_ADMIN**

### 2. Sincronização Bidirecional Automática 🔄

- ✅ Criar **User** com role TEACHER → Cria **Professor** automaticamente
- ✅ Criar **User** com role STUDENT → Cria **Aluno** automaticamente
- ✅ Criar **Professor** → Cria **User** automaticamente
- ✅ Comunicação via eventos RabbitMQ (assíncrona)

### 3. Sistema de Notas e Avaliações 📊

- ✅ Lançamento de notas por professores
- ✅ Múltiplos tipos de avaliação (AV1, AV2, AV3, Prova, Trabalho)
- ✅ Consulta por aluno, professor ou disciplina
- ✅ Notificações automáticas para alunos

### 4. Sistema de Notificações 📬

- ✅ Notificações em tempo real via eventos
- ✅ Marcação de lida/não lida
- ✅ Tipos: Notas lançadas, Anúncios, Sistema

### 5. Padrões de Resiliência 🛡️

- ✅ **Circuit Breaker**: Previne cascata de falhas
- ✅ **Retry**: Tentativas automáticas com backoff exponencial
- ✅ **Fallback**: Tratamento gracioso de erros

---

# Slide 7: Demonstração e Resultados

> 📸 **Sugestão de Prints** (múltiplas imagens recomendadas):
> - **Testes de Carga**: Output do k6 mostrando métricas de performance
> - **Grafana Dashboard**: Gráficos de RPS, Latência P95, CPU/Memória em tempo real
> - **Prometheus**: Queries PromQL executando no Prometheus UI
> - **Resiliência**: Terminal mostrando `kubectl scale` e pods sendo recriados
> - **Health Check**: Output do endpoint `/actuator/health` de um serviço

## 📈 Validação do Sistema

### Testes de Carga (k6)

| Métrica | Resultado | SLO |
|---------|-----------|-----|
| **Throughput** | ~50-200 req/s | ✅ > 30 req/s |
| **Latência P95** | < 500ms | ✅ < 500ms |
| **Taxa de Erro** | < 5% | ✅ < 10% |
| **Disponibilidade** | 99.5%+ | ✅ > 99% |

### Demonstração de Resiliência

```bash
# 1. Parar um serviço (Professor Service)
kubectl scale deployment professor-tecadm-deployment --replicas=0

# 2. Aluno Service continua funcionando!
curl http://distrischool.local/api/alunos  # ✅ Status 200

# 3. Escalar horizontalmente
kubectl scale deployment professor-tecadm-deployment --replicas=3

# 4. Kubernetes recria pods automaticamente
kubectl delete pod <nome-do-pod>  # Pod recriado em segundos
```

### Monitoramento em Tempo Real

- 📊 **Grafana Dashboards**: Visualização de métricas JVM, HTTP, DB
- 🔔 **Prometheus Alerts**: Alertas configuráveis
- 📈 **Métricas de Negócio**: RPS, Latência, Erros por serviço

### Plano de Desenvolvimento Cumprido

| Semana | Entrega | Status |
|--------|---------|--------|
| 1-2 | Requisitos, Docker/K8s, Serviços básicos (Alunos, Usuários, Professores) | ✅ Concluído |
| 3-4 | API Gateway, RabbitMQ/Kafka, Frontend básico | ✅ Concluído |
| 5-6 | Circuit Breaker, Resiliência, Notificações Assíncronas, Documentação | ✅ Concluído |
| 7 | CI/CD, Monitoramento, Testes de carga | ✅ Concluído |
| 8 | Ajustes finais, Revisão de código, Apresentação | ✅ Concluído |

---

# Slide 8: Conclusão e Próximos Passos

> 📸 **Sugestão de Print**: 
> - Screenshot do GitHub Actions mostrando pipeline CI/CD verde (builds passando)
> - Screenshot do repositório GitHub com a estrutura de pastas
> - Visão geral do sistema funcionando (Dashboard com dados reais)

## 🎯 Conclusão

### O que foi Entregue

✅ **6 Microserviços** independentes e deployáveis  
✅ **Frontend React** moderno com autenticação  
✅ **API Gateway** com roteamento e segurança JWT  
✅ **Mensageria** assíncrona com RabbitMQ  
✅ **Resiliência** com Circuit Breaker e Retry  
✅ **Monitoramento** completo com Prometheus/Grafana  
✅ **CI/CD** automatizado com GitHub Actions  
✅ **Documentação** técnica abrangente  

### Diferenciais Técnicos

| Aspecto | Implementação |
|---------|---------------|
| **Arquitetura** | Microserviços genuínos, não apenas módulos separados |
| **Comunicação** | Síncrona (REST) e Assíncrona (Eventos RabbitMQ) |
| **Persistência** | Database per Service com Flyway migrations |
| **Segurança** | JWT + BCrypt + RBAC |
| **DevOps** | Docker + Kubernetes + CI/CD completo |
| **Observabilidade** | Health checks + Métricas + Logs estruturados |

### Próximos Passos (Roadmap)

1. 🔜 **Distributed Tracing** com Jaeger/Zipkin
2. 🔜 **Service Mesh** com Istio
3. 🔜 **API Versioning** para backward compatibility
4. 🔜 **Mobile App** React Native
5. 🔜 **Relatórios e Analytics** avançados
6. 🔜 **Multi-tenancy** para múltiplas instituições

---

## 🙏 Obrigado!

### Repositório

🔗 **GitHub**: [github.com/bmatox/distri-school](https://github.com/bmatox/distri-school)

### Documentação Adicional

- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura detalhada
- 📖 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guia de deploy
- 📖 [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) - Testes de API
- 📖 [LOAD_TESTING_GUIDE.md](LOAD_TESTING_GUIDE.md) - Testes de carga

### Contato

**DistriSchool Team**

---

## 📊 Apêndice: Estrutura de Serviços

### Tabela de Endpoints por Serviço

| Serviço | Porta Interna | Endpoints Principais |
|---------|---------------|---------------------|
| **User Service** | 8080 | `/api/users`, `/api/v1/auth/token` |
| **Aluno Service** | 8081 | `/api/alunos`, `/api/alunos/matricula/{mat}` |
| **Professor Service** | 8082 | `/api/v1/professores` |
| **Grades Service** | 8083 | `/api/grades`, `/api/grades/student/{id}` |
| **Communication Service** | 8084 | `/api/notifications`, `/api/notifications/user/{id}` |
| **API Gateway** | 8080 (externo) | Roteamento centralizado para todos os serviços |

> **Nota**: O API Gateway é o ponto de entrada externo (exposto via Ingress) e roteia as requisições para os serviços internos. O User Service e API Gateway usam a mesma porta internamente, mas o API Gateway é exposto externamente enquanto o User Service é acessado apenas internamente via API Gateway.

### Eventos RabbitMQ

| Exchange | Routing Keys |
|----------|-------------|
| `distrischool.events.exchange` | `user.created`, `user.updated`, `user.deleted` |
| | `professor.created`, `professor.updated`, `professor.deleted` |
| | `aluno.created`, `aluno.updated`, `aluno.deleted` |
| | `grade.created`, `notification.created` |

---

*Apresentação gerada para o projeto DistriSchool - Plataforma de Gestão Escolar Distribuída*
