# DistriSchool - Guia Rápido de Monitoramento

## 🚀 Início Rápido

### Passo 1: Deploy Completo
Execute o script de deploy que automaticamente configura toda a infraestrutura, incluindo a stack de monitoramento:

```powershell
.\full-deploy.ps1
```

### Passo 2: Obter URLs de Acesso

#### Opção 1: Usando comandos diretos
```bash
# Prometheus
minikube service prometheus-service --url

# Grafana
minikube service grafana-service --url
```

#### Opção 2: Usando IP do Minikube
```bash
# Obter o IP do Minikube
minikube ip

# Acessar no navegador:
# Prometheus: http://<minikube-ip>:30090
# Grafana: http://<minikube-ip>:30030
```

### Passo 3: Fazer Login no Grafana
- **URL**: Obtida no passo anterior
- **Usuário**: `admin`
- **Senha**: `admin`

### Passo 4: Verificar Conexão com Prometheus
1. No Grafana, vá em **Configuration** → **Data Sources**
2. Você verá o Prometheus já configurado
3. Clique em **Test** para confirmar a conexão

## 📊 Criando Seu Primeiro Dashboard

### Dashboard de Requisições HTTP

1. No Grafana, clique em **+** → **Create Dashboard**
2. Clique em **Add visualization**
3. Selecione **Prometheus** como data source
4. Use as seguintes queries:

#### Requisições por Segundo (todos os serviços)
```promql
sum(rate(http_server_requests_seconds_count[1m])) by (service)
```

#### Latência P95 por Serviço
```promql
histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (service, le))
```

#### Taxa de Erros (status 5xx)
```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[1m])) by (service)
```

### Dashboard de JVM

#### Uso de Memória Heap
```promql
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100
```

#### Threads Ativas
```promql
jvm_threads_live_threads
```

#### Taxa de Garbage Collection
```promql
rate(jvm_gc_pause_seconds_count[1m])
```

### Dashboard de Sistema

#### CPU Process
```promql
process_cpu_usage * 100
```

#### Conexões de Banco de Dados Ativas
```promql
hikaricp_connections_active
```

## 🔍 Explorando Métricas no Prometheus

### Passo 1: Acessar Prometheus
Abra o Prometheus no navegador (porta 30090)

### Passo 2: Verificar Targets
1. Vá em **Status** → **Targets**
2. Você deve ver todos os microsserviços listados:
   - aluno-service
   - user-service
   - professor-service
   - grades-service
   - communication-service
   - api-gateway

### Passo 3: Testar Queries
Na aba **Graph**, experimente:

```promql
# Ver todas as métricas disponíveis
{__name__=~".+"}

# Métricas de um serviço específico
{service="aluno-service"}

# Requisições HTTP totais
http_server_requests_seconds_count
```

## 📈 Dashboards Prontos da Comunidade

Você pode importar dashboards prontos no Grafana:

1. Clique em **+** → **Import**
2. Digite um ID de dashboard ou cole JSON
3. Selecione o Prometheus como data source

### Dashboards Recomendados:

- **JVM (Micrometer)** - ID: `4701`
- **Spring Boot Statistics** - ID: `6756`
- **Spring Boot APM Dashboard** - ID: `12900`

## 🧪 Testando a Stack de Monitoramento

### 1. Gerar Tráfego
```bash
# Fazer várias requisições para gerar métricas
for i in {1..100}; do
  curl http://distrischool.local/api/v1/professores
  sleep 0.1
done
```

### 2. Visualizar no Grafana
- Crie um painel com a query: `rate(http_server_requests_seconds_count[1m])`
- Observe o gráfico mudando conforme as requisições são feitas

### 3. Simular Erros (Opcional)
```bash
# Fazer requisições para endpoints inválidos
for i in {1..50}; do
  curl http://distrischool.local/api/v1/invalid-endpoint
done
```

- No Grafana, use: `rate(http_server_requests_seconds_count{status=~"4.."}[1m])`
- Veja os erros 404 aparecendo

## 🔧 Troubleshooting

### Prometheus não mostra targets
```bash
# Verificar se os pods estão rodando
kubectl get pods

# Verificar se os endpoints estão expostos
kubectl get endpoints

# Testar acesso direto ao actuator
kubectl port-forward deployment/aluno-deployment 8081:8081
curl http://localhost:8081/actuator/prometheus
```

### Grafana não carrega
```bash
# Ver logs do Grafana
kubectl logs -l app=grafana

# Reiniciar o Grafana
kubectl rollout restart deployment/grafana
```

### Métricas não aparecem
```bash
# Verificar configuração do Prometheus
kubectl get configmap prometheus-config -o yaml

# Ver logs do Prometheus
kubectl logs -l app=prometheus
```

## 📚 Recursos Adicionais

- [Documentação Completa](../k8s-manifests/monitoring/README.md)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Micrometer Metrics](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.metrics)

## 🆘 Comandos Úteis

```bash
# Ver todos os pods de monitoramento
kubectl get pods -l app=prometheus -l app=grafana

# Reiniciar stack de monitoramento
kubectl rollout restart deployment/prometheus deployment/grafana

# Remover e reaplicar configuração
kubectl delete -f k8s-manifests/monitoring/
kubectl apply -f k8s-manifests/monitoring/

# Port-forward para acesso local
kubectl port-forward svc/prometheus-service 9090:9090
kubectl port-forward svc/grafana-service 3000:3000
```

## 💡 Dicas

1. **Salve seus dashboards**: Após criar dashboards no Grafana, exporte-os como JSON para backup
2. **Use variáveis**: No Grafana, use variáveis para criar dashboards dinâmicos que funcionam com todos os serviços
3. **Configure alertas**: O Grafana suporta alertas que podem notificar você quando métricas atingem valores críticos
4. **Explore métricas**: Use o Prometheus para descobrir quais métricas estão disponíveis antes de criar dashboards

---

**Próximos Passos**: Explore as queries PromQL avançadas na [documentação completa](../k8s-manifests/monitoring/README.md) para criar dashboards mais sofisticados.
