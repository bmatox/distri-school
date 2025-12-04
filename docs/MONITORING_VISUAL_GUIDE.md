# DistriSchool - Guia Visual de Monitoramento

## 🎨 O Que Você Verá Após o Deploy

### 1. 🚀 Executando o Deploy

```powershell
PS C:\distri-school> .\full-deploy.ps1
```

**Saída Esperada:**
```
======================================
DistriSchool - Improved Full Deploy
======================================

Verificando pré-requisitos...
✅ Todos os pré-requisitos estão instalados.

======================================
Configurando Minikube
======================================
✅ Minikube já está rodando.

... (construindo imagens) ...

======================================
Deploy - Infraestrutura
======================================

🔍 Aplicando Stack de Monitoramento (Prometheus + Grafana)...
configmap/prometheus-config created
deployment.apps/prometheus created
service/prometheus-service created
configmap/grafana-datasource created
deployment.apps/grafana created
service/grafana-service created
✅ Stack de monitoramento aplicada.

⏳ Aguardando infraestrutura ficar pronta...
   Aguardando PostgreSQL...
   Aguardando RabbitMQ...
   Aguardando Prometheus...
   Aguardando Grafana...
✅ Infraestrutura pronta!

... (deploy dos serviços) ...

======================================
✅ Deploy Concluído!
======================================

🌐 URLs de Acesso:
   Frontend:   http://distrischool.local
   API:        http://distrischool.local/api
   Prometheus: http://192.168.49.2:30090
   Grafana:    http://192.168.49.2:30030 (admin/admin)
```

---

## 2. 📊 Acessando o Prometheus

### URL: `http://<minikube-ip>:30090`

#### Interface do Prometheus:

```
┌─────────────────────────────────────────────────────────────┐
│ Prometheus                                    Status Targets │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Expression (press Shift+Enter for newlines)                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ http_server_requests_seconds_count                    │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ [Execute]  [Add Panel]                                       │
│                                                               │
│ Graph   Console                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │     📈                                                 │   │
│ │    /│\                                                │   │
│ │   / │ \                                               │   │
│ │  /  │  \                                              │   │
│ │ /   │   \___                                          │   │
│ │/────┴───────\─────────────────────────────            │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Menu "Status" → "Targets":

```
Endpoint                                     State    Last Scrape    Error
──────────────────────────────────────────────────────────────────────────
aluno-service (1/1 up)
  http://aluno-service:8081/actuator/prometheus      UP     2.5s ago      
                                                     
user-service (1/1 up)
  http://user-service:8080/actuator/prometheus       UP     1.8s ago      
                                                     
professor-service (1/1 up)
  http://professor-tecadm-service:8082/actuator/...  UP     3.1s ago      
                                                     
grades-service (1/1 up)
  http://grades-service:8083/actuator/prometheus     UP     2.2s ago      
                                                     
communication-service (1/1 up)
  http://communication-service:8084/actuator/...     UP     1.5s ago      
                                                     
api-gateway (1/1 up)
  http://api-gateway-service:8080/actuator/...       UP     2.9s ago      
```

✅ **Todos os targets devem estar "UP" (verde)**

---

## 3. 🎨 Acessando o Grafana

### URL: `http://<minikube-ip>:30030`

#### Login Screen:
```
┌────────────────────────────────┐
│                                │
│         Welcome to             │
│          Grafana               │
│                                │
│  Email or username             │
│  ┌──────────────────────────┐ │
│  │ admin                    │ │
│  └──────────────────────────┘ │
│                                │
│  Password                      │
│  ┌──────────────────────────┐ │
│  │ ••••••                   │ │
│  └──────────────────────────┘ │
│                                │
│     [    Log in    ]           │
│                                │
└────────────────────────────────┘
```

**Credenciais:**
- Username: `admin`
- Password: `admin`

---

### Home Screen do Grafana:

```
┌──────────────────────────────────────────────────────────────────┐
│ ≡ Grafana            🔍 Search           👤 admin        ⚙️       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Home                                                             │
│  ═══════════════════════════════════════════════════════════════ │
│                                                                   │
│  Welcome to Grafana                                               │
│                                                                   │
│  Getting started                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │                 │  │                 │  │                 │ │
│  │  📊 Create     │  │  📁 Browse      │  │  🔌 Data        │ │
│  │  Dashboard      │  │  Dashboards     │  │  Sources        │ │
│  │                 │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

### Verificar Data Source (Configuration → Data Sources):

```
┌──────────────────────────────────────────────────────────────────┐
│ Configuration → Data Sources                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Data sources                                                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ✅ Prometheus                                 [Default]     │ │
│  │    http://prometheus-service:9090                          │ │
│  │                                                    [Edit]   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  [+ Add data source]                                             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

✅ **Prometheus já está configurado como data source padrão!**

---

## 4. 🎯 Criando Seu Primeiro Dashboard

### Passo 1: Criar Dashboard
**Click:** `+` → `Create Dashboard` → `Add visualization`

### Passo 2: Selecionar Prometheus
**Select:** `Prometheus`

### Passo 3: Adicionar Query

```
┌──────────────────────────────────────────────────────────────────┐
│ Panel editor                                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Visualization: Time series                          [Graph icon] │
│                                                                   │
│  Query: Prometheus                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Metrics browser                                            │ │
│  │ sum(rate(http_server_requests_seconds_count[1m])) by (ser │ │
│  │ vice)                                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  📈 Preview                                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   │   aluno-service                                        │ │
│  │ 15│  ╱─────────────╲                                       │ │
│  │   │ ╱               ╲      user-service                    │ │
│  │ 10│╱                 ╲────────────────                     │ │
│  │   │                   professor-service                    │ │
│  │  5│                   ─────────────────                    │ │
│  │   │                                                         │ │
│  │  0├───────────────────────────────────────────────────────│ │
│  │   12:00  12:15  12:30  12:45  13:00  13:15  13:30        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Title: HTTP Requests per Second                                 │
│  Description: Rate of HTTP requests by service                   │
│                                                                   │
│  [Apply]  [Save]  [Discard]                                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. 📊 Dashboard Exemplo Completo

### Dashboard: "DistriSchool - Overview"

```
┌──────────────────────────────────────────────────────────────────┐
│ 🏠 DistriSchool Overview                                   🔄 ⚙️  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ Total Requests      │  │ Average Latency     │               │
│  │      1,247          │  │      125ms          │               │
│  │  📈 +12% vs 1h ago  │  │  📉 -5% vs 1h ago   │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ Error Rate          │  │ Active Services     │               │
│  │      0.3%           │  │       6/6           │               │
│  │  ✅ Normal          │  │  ✅ All UP          │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                   │
│  HTTP Requests per Second by Service                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 50│                                                         │ │
│  │   │    ┌── aluno-service                                   │ │
│  │ 40│   ╱│╲                                                   │ │
│  │   │  ╱ │ ╲  ┌── user-service                               │ │
│  │ 30│ ╱  │  ╲╱│                                               │ │
│  │   │╱   │   ╱│╲                                              │ │
│  │ 20│    │  ╱ │ ╲── professor-service                        │ │
│  │   │    │ ╱  │  ╲                                            │ │
│  │ 10│    │╱   │   ╲─── other services                        │ │
│  │   │    ╱    │                                               │ │
│  │  0├──────────────────────────────────────────────────────  │ │
│  │   10:00    11:00    12:00    13:00    14:00    15:00      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Response Time Distribution (P50, P95, P99)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │500ms│                                            ╱── P99    │ │
│  │     │                                      ╱────╱           │ │
│  │400ms│                                ╱────╱                 │ │
│  │     │                          ╱────╱      ╱── P95         │ │
│  │300ms│                    ╱────╱      ╱────╱                │ │
│  │     │              ╱────╱      ╱────╱      ╱── P50         │ │
│  │200ms│        ╱────╱      ╱────╱      ╱────╱                │ │
│  │     │  ╱────╱      ╱────╱      ╱────╱                      │ │
│  │100ms│─╱      ╱────╱      ╱────╱                            │ │
│  │     │                                                        │ │
│  │   0ms├──────────────────────────────────────────────────────│ │
│  │     10:00    11:00    12:00    13:00    14:00    15:00    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  JVM Memory Usage by Service                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 100%│                                                       │ │
│  │  90%│    ┌────────────── aluno-service                     │ │
│  │  80%│    │                                                  │ │
│  │  70%│    │  ┌───────────── user-service                    │ │
│  │  60%│    │  │                                               │ │
│  │  50%│    │  │  ┌────────── professor-service               │ │
│  │  40%│    │  │  │                                            │ │
│  │  30%│────┴──┴──┴──────── other services                    │ │
│  │  20%│                                                       │ │
│  │  10%│                                                       │ │
│  │   0%├───────────────────────────────────────────────────── │ │
│  │     10:00    11:00    12:00    13:00    14:00    15:00    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. ✅ Checklist de Verificação

### Após o Deploy, Verifique:

```
□ Todos os pods estão rodando
  kubectl get pods | grep -E "(prometheus|grafana)"
  
  ✅ prometheus-xxxxx-yyyyy        1/1     Running
  ✅ grafana-xxxxx-yyyyy           1/1     Running

□ Serviços estão expostos
  kubectl get svc | grep -E "(prometheus|grafana)"
  
  ✅ prometheus-service   NodePort   10.x.x.x   30090/TCP
  ✅ grafana-service      NodePort   10.x.x.x   30030/TCP

□ Prometheus está coletando métricas
  - Acesse Prometheus UI
  - Vá em Status → Targets
  - Verifique se todos os 6 serviços estão "UP"

□ Grafana está conectado ao Prometheus
  - Acesse Grafana (admin/admin)
  - Vá em Configuration → Data Sources
  - Clique em "Prometheus"
  - Clique em "Test" → deve mostrar "Data source is working"

□ Métricas estão disponíveis
  - No Grafana, crie uma query simples:
    up{service=~".+"}
  - Deve retornar 6 séries (uma por serviço)
```

---

## 7. 🎓 Próximos Passos

### Para Iniciantes:
1. ✅ Explore a interface do Prometheus
2. ✅ Crie um dashboard simples no Grafana
3. ✅ Teste as queries de exemplo do Quick Start

### Para Usuários Intermediários:
1. 📊 Importe dashboards da comunidade Grafana
2. 🔔 Configure alertas para métricas críticas
3. 📈 Crie dashboards customizados para seu negócio

### Para Usuários Avançados:
1. 🎯 Implemente métricas de negócio customizadas
2. 🔍 Configure distributed tracing
3. 📦 Adicione exporters para PostgreSQL e RabbitMQ

---

## 📚 Onde Encontrar Mais Informações

- 🚀 **Quick Start**: `docs/MONITORING_QUICK_START.md`
- 📐 **Arquitetura**: `docs/MONITORING_ARCHITECTURE.md`
- 🔧 **Configuração**: `k8s-manifests/monitoring/README.md`

---

## 🆘 Problemas Comuns

### Prometheus não mostra targets
```bash
# Verificar logs
kubectl logs -l app=prometheus --tail=50

# Verificar ConfigMap
kubectl get configmap prometheus-config -o yaml

# Testar conectividade
kubectl exec -it <prometheus-pod> -- wget -O- http://aluno-service:8081/actuator/prometheus
```

### Grafana não carrega
```bash
# Verificar logs
kubectl logs -l app=grafana --tail=50

# Reiniciar
kubectl rollout restart deployment/grafana

# Port-forward para debug
kubectl port-forward svc/grafana-service 3000:3000
```

### Serviço não aparece no Prometheus
```bash
# Verificar se o endpoint existe
kubectl get endpoints <service-name>

# Testar acesso ao actuator
kubectl port-forward deployment/<deployment-name> 8080:8080
curl http://localhost:8080/actuator/prometheus
```

---

**🎉 Pronto! Sua stack de monitoramento está 100% funcional!**
