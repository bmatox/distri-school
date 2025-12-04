# DistriSchool - Arquitetura de Monitoramento

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Grafana Dashboard                         │  │
│  │                  (NodePort: 30030)                           │  │
│  │                   admin / admin                              │  │
│  └───────────────────┬──────────────────────────────────────────┘  │
│                      │                                              │
│                      │ Queries PromQL                               │
│                      ▼                                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Prometheus Server                         │  │
│  │                  (NodePort: 30090)                           │  │
│  │                                                              │  │
│  │  Scrape Interval: 10s                                       │  │
│  │  Retention: Default (15 days)                               │  │
│  └───────┬──────────────────────────────────────────────────────┘  │
│          │                                                          │
│          │ Scrapes /actuator/prometheus every 10s                  │
│          │                                                          │
│          ├────────────────────┬────────────────┬──────────────┐   │
│          │                    │                │              │   │
│          ▼                    ▼                ▼              ▼   │
│  ┌──────────────┐    ┌──────────────┐  ┌──────────────┐  ┌─────┐ │
│  │ aluno-service│    │ user-service │  │professor-svc │  │ ... │ │
│  │   :8081      │    │   :8080      │  │   :8082      │  │     │ │
│  │              │    │              │  │              │  │     │ │
│  │ /actuator/   │    │ /actuator/   │  │ /actuator/   │  │     │ │
│  │  prometheus  │    │  prometheus  │  │  prometheus  │  │     │ │
│  └──────────────┘    └──────────────┘  └──────────────┘  └─────┘ │
│                                                                     │
│  + grades-service:8083                                             │
│  + communication-service:8084                                      │
│  + api-gateway:8080                                                │
└─────────────────────────────────────────────────────────────────────┘

         ▲                              ▲
         │                              │
         │ NodePort 30030              │ NodePort 30090
         │                              │
    ┌────┴─────┐                  ┌────┴─────┐
    │ Browser  │                  │ Browser  │
    │ Grafana  │                  │Prometheus│
    └──────────┘                  └──────────┘
```

## 🔄 Fluxo de Dados

### 1. Coleta de Métricas (Scraping)
```
Microservice → Micrometer → Actuator Endpoint → Prometheus
```

1. **Micrometer** coleta métricas automaticamente (JVM, HTTP, DB, etc.)
2. **Spring Boot Actuator** expõe as métricas em formato Prometheus
3. **Prometheus** faz scrape do endpoint a cada 10 segundos
4. Métricas são armazenadas no TSDB (Time Series Database) do Prometheus

### 2. Visualização
```
User → Grafana → Prometheus → Query Result → Chart/Graph
```

1. Usuário cria dashboard no **Grafana**
2. Grafana executa queries **PromQL** no Prometheus
3. Prometheus retorna séries temporais
4. Grafana renderiza gráficos e visualizações

## 📊 Tipos de Métricas Coletadas

### 1. Métricas HTTP (Spring Boot)
- **Contador**: `http_server_requests_seconds_count`
  - Total de requisições HTTP
  - Labels: method, uri, status, service
- **Histograma**: `http_server_requests_seconds_bucket`
  - Distribuição de latência
  - Permite calcular percentis (P50, P95, P99)
- **Soma**: `http_server_requests_seconds_sum`
  - Tempo total de processamento

### 2. Métricas JVM
- **Memória**
  - `jvm_memory_used_bytes`: Memória usada
  - `jvm_memory_max_bytes`: Memória máxima
  - `jvm_memory_committed_bytes`: Memória comprometida
  - Labels: area (heap/non-heap), id (pool)

- **Garbage Collection**
  - `jvm_gc_pause_seconds_count`: Contagem de GC
  - `jvm_gc_pause_seconds_sum`: Tempo total em GC
  - `jvm_gc_memory_allocated_bytes_total`: Memória alocada
  - `jvm_gc_memory_promoted_bytes_total`: Memória promovida

- **Threads**
  - `jvm_threads_live_threads`: Threads vivas
  - `jvm_threads_daemon_threads`: Threads daemon
  - `jvm_threads_peak_threads`: Pico de threads
  - `jvm_threads_states_threads`: Threads por estado

### 3. Métricas de Sistema
- **CPU**
  - `process_cpu_usage`: CPU do processo (0-1)
  - `system_cpu_usage`: CPU do sistema (0-1)
  - `system_cpu_count`: Número de CPUs

- **File Descriptors**
  - `process_files_open_files`: Arquivos abertos
  - `process_files_max_files`: Máximo de arquivos

### 4. Métricas de Database (HikariCP)
- `hikaricp_connections_active`: Conexões ativas
- `hikaricp_connections_idle`: Conexões ociosas
- `hikaricp_connections_pending`: Conexões pendentes
- `hikaricp_connections_max`: Máximo de conexões
- `hikaricp_connections_timeout_total`: Timeouts totais

### 5. Métricas de Circuit Breaker (Resilience4J)
- `resilience4j_circuitbreaker_state`: Estado atual (0=closed, 1=open, 2=half_open)
- `resilience4j_circuitbreaker_calls_seconds_count`: Total de chamadas
- `resilience4j_circuitbreaker_failure_rate`: Taxa de falha

## 🎯 Configuração de Scrape do Prometheus

```yaml
# Configuração para cada microsserviço
- job_name: 'aluno-service'
  metrics_path: '/actuator/prometheus'
  static_configs:
    - targets: ['aluno-service:8081']
      labels:
        service: 'aluno-service'
```

### Componentes da Configuração:
- **job_name**: Nome do job de scrape
- **metrics_path**: Endpoint onde as métricas estão expostas
- **targets**: Endereço do serviço (nome DNS do K8s + porta)
- **labels**: Labels adicionais para identificar métricas

## 📈 Exemplos de Queries PromQL

### Operações Básicas

#### Taxa de Requisições (req/s)
```promql
rate(http_server_requests_seconds_count[1m])
```

#### Requisições por Serviço
```promql
sum(rate(http_server_requests_seconds_count[1m])) by (service)
```

#### Requisições por Endpoint
```promql
sum(rate(http_server_requests_seconds_count[1m])) by (uri)
```

### Latência

#### Latência Média
```promql
rate(http_server_requests_seconds_sum[1m]) 
/ 
rate(http_server_requests_seconds_count[1m])
```

#### Percentil 95 (P95)
```promql
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (service, le)
)
```

#### Percentil 99 (P99)
```promql
histogram_quantile(0.99, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (service, le)
)
```

### Erros

#### Taxa de Erros 4xx
```promql
sum(rate(http_server_requests_seconds_count{status=~"4.."}[1m])) by (service)
```

#### Taxa de Erros 5xx
```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[1m])) by (service)
```

#### Percentual de Erros
```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[1m])) 
/ 
sum(rate(http_server_requests_seconds_count[1m])) * 100
```

### JVM

#### Uso de Memória Heap (%)
```promql
jvm_memory_used_bytes{area="heap"} 
/ 
jvm_memory_max_bytes{area="heap"} * 100
```

#### Alocação de Memória (rate)
```promql
rate(jvm_gc_memory_allocated_bytes_total[1m])
```

#### Frequência de GC
```promql
rate(jvm_gc_pause_seconds_count[1m])
```

### Database

#### Pool de Conexões (utilização %)
```promql
hikaricp_connections_active 
/ 
hikaricp_connections_max * 100
```

## 🔐 Segurança e Boas Práticas

### ⚠️ Configuração Atual (Desenvolvimento)
- Grafana: Credenciais padrão (admin/admin)
- Prometheus: Sem autenticação
- Services: NodePort exposto

### ✅ Recomendações para Produção
1. **Autenticação**
   - Configurar OAuth/LDAP no Grafana
   - Habilitar basic auth no Prometheus

2. **Persistência**
   - Usar PersistentVolumeClaim para dados do Prometheus
   - Backup regular de dashboards do Grafana

3. **Segurança de Rede**
   - Usar ClusterIP ao invés de NodePort
   - Implementar NetworkPolicies
   - Usar Ingress com TLS

4. **Recursos**
   - Ajustar limits/requests baseado em carga real
   - Configurar retention do Prometheus baseado em necessidades

5. **Alta Disponibilidade**
   - Múltiplas réplicas do Prometheus
   - Usar Thanos para armazenamento de longo prazo
   - Grafana com banco de dados externo

## 📚 Referências

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Micrometer Documentation](https://micrometer.io/docs)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [PromQL Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)

## 🎓 Próximos Passos de Aprendizado

1. **Básico**
   - Explore o Prometheus UI e suas queries
   - Crie dashboards simples no Grafana
   - Entenda as métricas expostas pelos serviços

2. **Intermediário**
   - Implemente dashboards customizados
   - Configure alertas no Grafana
   - Explore métricas de negócio customizadas

3. **Avançado**
   - Implemente distributed tracing
   - Configure exporters para infraestrutura (PostgreSQL, RabbitMQ)
   - Implemente service mesh (Istio/Linkerd) para métricas avançadas
