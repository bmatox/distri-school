# 🚀 DistriSchool - Guia de Testes de Carga com k6

Este guia fornece instruções completas para executar testes de carga no DistriSchool utilizando k6, uma ferramenta moderna de teste de performance desenvolvida pela Grafana Labs.

## 📋 Pré-requisitos

Antes de executar os testes de carga, certifique-se de que:

### 1. Sistema DistriSchool Deployado
```bash
# Verificar se todos os pods estão rodando
kubectl get pods

# Verificar serviços
kubectl get svc

# Verificar ingress
kubectl get ingress
```

Todos os microsserviços devem estar no estado `Running`:
- ✅ aluno-service
- ✅ user-service
- ✅ professor-tecadm-service
- ✅ grades-service
- ✅ communication-service
- ✅ api-gateway
- ✅ frontend
- ✅ postgres
- ✅ rabbitmq

### 2. Stack de Monitoramento Ativa
```bash
# Verificar pods de monitoramento
kubectl get pods -l app=prometheus
kubectl get pods -l app=grafana

# Obter URLs de acesso
minikube service prometheus-service --url
minikube service grafana-service --url
```

Deve haver pods rodando:
- ✅ prometheus
- ✅ grafana

### 3. Docker Instalado e Rodando
```bash
# Windows/Linux/Mac
docker --version
docker info
```

### 4. Ingress Acessível
```bash
# Obter IP do Minikube
minikube ip

# Testar conectividade (use o IP retornado)
curl http://<minikube-ip>/api/v1/auth/token
```

## 🎯 Execução Rápida

### Windows (PowerShell)
```powershell
# Executar teste de carga
.\run-load-test.ps1

# Com opções customizadas
.\run-load-test.ps1 -BaseUrl http://192.168.49.2

# Ver ajuda
.\run-load-test.ps1 -Help
```

### Linux/Mac (Bash)
```bash
# Tornar script executável (primeira vez apenas)
chmod +x run-load-test.sh

# Executar teste de carga
./run-load-test.sh

# Com opções customizadas
./run-load-test.sh --base-url http://192.168.49.2

# Ver ajuda
./run-load-test.sh --help
```

## 📊 Monitorando o Teste em Tempo Real

### Passo 1: Abrir Grafana
```bash
# Obter URL do Grafana
minikube service grafana-service --url

# Ou acesse diretamente (geralmente):
# http://localhost:30030
```

**Credenciais**: `admin` / `admin`

### Passo 2: Criar Dashboard de Monitoramento

Após fazer login no Grafana, crie um novo dashboard com os seguintes painéis:

#### Painel 1: Requisições por Segundo
```promql
sum(rate(http_server_requests_seconds_count[1m]))
```
**Visualização**: Graph  
**Descrição**: Mostra o throughput total do sistema

#### Painel 2: Latência P95 por Serviço
```promql
histogram_quantile(0.95, 
  sum by(le, service) (
    rate(http_server_requests_seconds_bucket[5m])
  )
)
```
**Visualização**: Graph  
**Descrição**: Latência do percentil 95 de cada microsserviço

#### Painel 3: Taxa de Erro
```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[1m])) / 
sum(rate(http_server_requests_seconds_count[1m]))
```
**Visualização**: Gauge  
**Descrição**: Percentual de requisições com erro 5xx

#### Painel 4: Uso de CPU por Pod
```promql
rate(process_cpu_seconds_total{service=~".*"}[1m])
```
**Visualização**: Graph  
**Descrição**: Consumo de CPU de cada microsserviço

#### Painel 5: Uso de Memória JVM
```promql
jvm_memory_used_bytes{area="heap", service=~".*"} / 1024 / 1024
```
**Visualização**: Graph  
**Descrição**: Memória heap usada (em MB) por cada serviço

#### Painel 6: Mensagens RabbitMQ
```promql
rabbitmq_queue_messages_ready
```
**Visualização**: Graph  
**Descrição**: Mensagens na fila aguardando processamento

### Passo 3: Executar o Teste

Com o Grafana aberto e os dashboards configurados:

1. Execute o script de teste de carga
2. Observe as métricas em tempo real no Grafana
3. Acompanhe o progresso no terminal

### O Que Observar Durante o Teste

#### Stage 1: Ramp-up (0-30s)
- ✅ RPS aumentando gradualmente de 0 para ~30-50
- ✅ Latência estável (< 200ms)
- ✅ CPU começando a subir
- ✅ Taxa de erro próxima de 0%

#### Stage 2: Sustentação (30s-1m30s)
- ✅ RPS estável em ~30-50
- ✅ Latência consistente
- ✅ CPU estabilizado
- ✅ Memória crescendo levemente (garbage collection normal)

#### Stage 3: Stress (1m30s-2m)
- ⚠️ RPS subindo para ~100-200
- ⚠️ Latência aumentando (pode chegar a 500ms no P95)
- ⚠️ CPU próximo ao limite
- ⚠️ Taxa de erro pode aumentar (mas deve ficar < 10%)

#### Stage 4: Cool-down (2m-2m30s)
- ✅ RPS voltando para 0
- ✅ Latência normalizando
- ✅ CPU decrescendo
- ✅ Sistema se recuperando

## 📈 Interpretando os Resultados

### Saída do k6 no Terminal

Ao final do teste, o k6 exibe um resumo:

```
✓ authentication successful
✓ token received
✓ GET professores status 200
✓ GET cursos status 200
✓ POST aluno status 201 or 200

checks.........................: 95.24% ✓ 1905 ✗ 95
data_received..................: 2.5 MB 1.0 MB/s
data_sent......................: 1.2 MB 479 kB/s
http_req_duration..............: avg=123.45ms min=12.34ms med=98.76ms max=876.54ms p(95)=345.67ms p(99)=543.21ms
http_req_failed................: 4.76%  ✓ 95   ✗ 1905
http_reqs......................: 2000   13.33/s
iterations.....................: 500    3.33/s
vus............................: 200    min=0 max=200
vus_max........................: 200    min=200 max=200
```

### Métricas Importantes

| Métrica | O Que Significa | Valor Esperado |
|---------|-----------------|----------------|
| `checks` | Porcentagem de validações bem-sucedidas | > 90% ✅ |
| `http_req_duration (p95)` | 95% das requisições respondem em até... | < 500ms ✅ |
| `http_req_duration (p99)` | 99% das requisições respondem em até... | < 1s ✅ |
| `http_req_failed` | Taxa de falha das requisições | < 10% ✅ |
| `http_reqs` | Total de requisições feitas | ~2000 ✅ |
| `iterations` | Ciclos completos de teste | ~500 ✅ |

### Status de Saúde do Sistema

#### 🟢 Sistema Saudável
- Checks > 95%
- P95 latency < 300ms
- Error rate < 5%
- CPU < 80%
- Sem quedas de pods

#### 🟡 Sistema Sob Pressão
- Checks 90-95%
- P95 latency 300-500ms
- Error rate 5-10%
- CPU 80-90%
- Garbage collection frequente

#### 🔴 Sistema Sobrecarregado
- Checks < 90%
- P95 latency > 500ms
- Error rate > 10%
- CPU > 90%
- Pods reiniciando (OOMKilled)

## 🔧 Troubleshooting

### Problema: "Authentication failed"

**Sintomas**:
```
✗ authentication successful
✗ token received
```

**Causas Possíveis**:
1. User Service não está rodando
2. Credenciais incorretas
3. URL base incorreta

**Solução**:
```bash
# Verificar pods
kubectl get pods -l app=user-service

# Verificar logs
kubectl logs -l app=user-service

# Testar manualmente
curl -X POST http://<minikube-ip>/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@distrischool.com","password":"admin123"}'
```

### Problema: "Connection refused" ou "Connection timeout"

**Sintomas**:
- Teste não consegue conectar ao sistema
- Timeout nas requisições

**Causas Possíveis**:
1. Minikube não está rodando
2. Ingress não está configurado
3. Docker não consegue acessar o Minikube

**Solução**:
```bash
# Verificar Minikube
minikube status

# Verificar ingress
kubectl get ingress

# Obter IP e testar
MINIKUBE_IP=$(minikube ip)
curl http://$MINIKUBE_IP/api/v1/auth/token

# Executar com IP explícito
.\run-load-test.ps1 -BaseUrl http://$MINIKUBE_IP
```

### Problema: Alta Taxa de Erros (> 10%)

**Sintomas**:
```
http_req_failed................: 15.50%
errors.........................: 15.50%
```

**Causas Possíveis**:
1. Sistema sobrecarregado
2. Recursos insuficientes (CPU/Memória)
3. Banco de dados lento
4. RabbitMQ com backlog

**Solução**:
```bash
# Verificar recursos dos pods
kubectl top pods

# Verificar logs de erros
kubectl logs -l app=aluno-service --tail=50

# Aumentar recursos
# Editar deployment e aumentar CPU/Memory limits

# Reduzir carga do teste
# Editar tests/k6/load-test.js e reduzir número de VUs
```

### Problema: k6 Muito Lento ou Travando

**Sintomas**:
- Teste demora muito para iniciar
- Docker lento
- Sistema operacional travando

**Causas Possíveis**:
1. Docker com poucos recursos
2. Muitos VUs para máquina local
3. Script de teste com bugs

**Solução**:
```bash
# Aumentar recursos do Docker
# Settings → Resources → Increase CPU/Memory

# Instalar k6 nativamente (mais rápido que Docker)
# Windows:
choco install k6

# Linux:
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Executar diretamente
k6 run tests/k6/load-test.js
```

## 📚 Próximos Passos

### 1. Customizar o Teste

Edite `tests/k6/load-test.js` para:
- Adicionar novos endpoints
- Modificar perfil de carga
- Ajustar thresholds
- Adicionar cenários específicos

### 2. Testar Diferentes Cenários

Crie scripts adicionais:
- `spike-test.js`: Picos repentinos de carga
- `stress-test.js`: Carga extrema até o sistema quebrar
- `soak-test.js`: Carga moderada por período longo (horas)
- `breakpoint-test.js`: Aumentar carga até encontrar limite

### 3. Automatizar com CI/CD

Integre os testes de carga no pipeline:
```yaml
# .github/workflows/performance.yml
name: Performance Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Todo dia às 2am
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run Load Test
        run: k6 run tests/k6/load-test.js
```

### 4. Exportar Resultados

Configure k6 para exportar resultados:
```javascript
export const options = {
  // ... configuração existente ...
  
  // Exportar para JSON
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
  
  // Exportar para InfluxDB (opcional)
  ext: {
    loadimpact: {
      projectID: 12345,
      name: 'DistriSchool Load Test'
    }
  }
};
```

## 📖 Referências

- [Documentação k6](https://k6.io/docs/)
- [k6 API Reference](https://k6.io/docs/javascript-api/)
- [Guia de Monitoramento DistriSchool](../k8s-manifests/monitoring/README.md)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [Grafana Tutorials](https://grafana.com/tutorials/)

## 🎓 Conceitos de SRE

### Service Level Objectives (SLOs)

Defina objetivos mensuráveis:
- **Disponibilidade**: 99.9% uptime
- **Latência**: P95 < 300ms
- **Throughput**: > 100 RPS
- **Error Rate**: < 1%

### Error Budget

Se seu SLO é 99.9% disponibilidade:
- Você tem 0.1% de "orçamento de erro"
- Em 30 dias: 43.2 minutos de downtime permitido
- Use para tomar decisões: feature vs. stability

### Capacity Planning

Use os testes para planejar:
1. Quantos usuários o sistema aguenta?
2. Quando preciso escalar?
3. Quais são os gargalos?
4. Quanto custa cada usuário adicional?

---

**Desenvolvido como parte do DistriSchool - Plataforma de Gestão Escolar Distribuída**

Para mais informações, consulte:
- [README Principal](../README.md)
- [Documentação de Testes](../tests/k6/README.md)
- [Guia de Monitoramento](../k8s-manifests/monitoring/README.md)
