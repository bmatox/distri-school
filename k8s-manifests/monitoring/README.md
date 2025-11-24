# DistriSchool - Stack de Monitoramento

Este diretório contém os manifestos do Kubernetes para a stack de monitoramento completa do DistriSchool, incluindo Prometheus e Grafana.

## 📊 Componentes

### Prometheus
- **Porta**: 30090 (NodePort)
- **URL de Acesso**: `http://<minikube-ip>:30090`
- **Função**: Coleta e armazena métricas de todos os microsserviços

### Grafana
- **Porta**: 30030 (NodePort)
- **URL de Acesso**: `http://<minikube-ip>:30030`
- **Credenciais**: admin/admin
- **Função**: Visualização de métricas através de dashboards

## 🚀 Como Usar

### Deploy Automático
A stack de monitoramento é automaticamente implantada quando você executa:
```powershell
.\full-deploy.ps1
```

### Deploy Manual
Se precisar implantar apenas a stack de monitoramento:
```bash
kubectl apply -f k8s-manifests/monitoring/
```

### Verificar Status
```bash
# Ver pods de monitoramento
kubectl get pods -l app=prometheus
kubectl get pods -l app=grafana

# Ver serviços
kubectl get svc | grep -E "(prometheus|grafana)"
```

### Acessar URLs
```bash
# Prometheus
minikube service prometheus-service --url

# Grafana
minikube service grafana-service --url
```

## 📈 Métricas Disponíveis

Todos os microsserviços expõem métricas no endpoint `/actuator/prometheus`:

- **aluno-service**: `http://aluno-service:8081/actuator/prometheus`
- **user-service**: `http://user-service:8080/actuator/prometheus`
- **professor-service**: `http://professor-tecadm-service:8082/actuator/prometheus`
- **grades-service**: `http://grades-service:8083/actuator/prometheus`
- **communication-service**: `http://communication-service:8084/actuator/prometheus`
- **api-gateway**: `http://api-gateway-service:8080/actuator/prometheus`

## 🎯 Configuração do Prometheus

O Prometheus está configurado para fazer scrape de todos os serviços a cada 10 segundos. A configuração pode ser encontrada em `prometheus-config.yaml`.

## 📊 Usando o Grafana

1. Acesse o Grafana através da URL fornecida
2. Faça login com admin/admin
3. O datasource do Prometheus já está pré-configurado
4. Crie novos dashboards ou importe dashboards da comunidade

### Exemplos de Queries (PromQL)

#### Requisições HTTP por segundo
```promql
rate(http_server_requests_seconds_count[1m])
```

#### Uso de CPU por serviço
```promql
process_cpu_usage{service=~".*"}
```

#### Uso de Memória
```promql
jvm_memory_used_bytes{service=~".*"}
```

#### Taxa de Erros HTTP
```promql
rate(http_server_requests_seconds_count{status=~"5.."}[5m])
```

#### Latência P95
```promql
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))
```

## 🔧 Personalização

### Ajustar Intervalo de Scrape
Edite o arquivo `prometheus-config.yaml` e modifique o valor de `scrape_interval`.

### Adicionar Novos Serviços
Para adicionar um novo serviço ao monitoramento:

1. Certifique-se que o serviço tem a dependência `micrometer-registry-prometheus`
2. Configure o actuator para expor o endpoint prometheus
3. Adicione um novo job no `prometheus-config.yaml`:
```yaml
- job_name: 'novo-servico'
  metrics_path: '/actuator/prometheus'
  static_configs:
    - targets: ['novo-servico:porta']
      labels:
        service: 'novo-servico'
```

## 🐛 Troubleshooting

### Prometheus não coleta métricas
1. Verifique se os pods dos microsserviços estão rodando
2. Teste se o endpoint `/actuator/prometheus` está acessível
3. Verifique os logs do Prometheus: `kubectl logs -l app=prometheus`

### Grafana não conecta ao Prometheus
1. Verifique se o Prometheus está rodando: `kubectl get pods -l app=prometheus`
2. Verifique os logs do Grafana: `kubectl logs -l app=grafana`
3. Teste a conectividade: `kubectl exec -it <grafana-pod> -- wget -O- http://prometheus-service:9090`

## 📦 Arquivos

- `prometheus-config.yaml`: ConfigMap com configuração do Prometheus
- `prometheus-deployment.yaml`: Deployment do Prometheus
- `prometheus-service.yaml`: Service do Prometheus (NodePort)
- `grafana-datasource-config.yaml`: ConfigMap com datasource do Prometheus para Grafana
- `grafana-deployment.yaml`: Deployment do Grafana
- `grafana-service.yaml`: Service do Grafana (NodePort)

## 🔒 Segurança

⚠️ **ATENÇÃO**: Esta configuração é para ambientes de desenvolvimento/teste. Para produção:

1. Altere as credenciais padrão do Grafana
2. Configure autenticação adequada
3. Use volumes persistentes para armazenamento de dados
4. Configure SSL/TLS
5. Implemente políticas de rede (NetworkPolicies)
