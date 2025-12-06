# DistriSchool - k6 Load Testing

Este diretório contém os testes de carga do DistriSchool utilizando [k6](https://k6.io/), uma ferramenta moderna de teste de performance e carga.

## 📋 Visão Geral

Os testes de carga simulam usuários reais acessando o sistema DistriSchool para validar:
- **Performance**: Tempos de resposta sob diferentes cargas
- **Escalabilidade**: Capacidade de lidar com aumento de usuários
- **Resiliência**: Comportamento do sistema sob stress
- **Limites**: Identificação de gargalos e pontos de falha

## 🎯 Cenários de Teste

### load-test.js - Teste de Carga Principal

Este script implementa um teste de carga completo com os seguintes cenários:

#### Setup (Autenticação)
- Autentica como administrador via `POST /api/v1/auth/token`
- Obtém token JWT para requisições protegidas
- Credenciais padrão: `admin@distrischool.com` / `admin123`

#### Cenário 1: Leitura Pesada (Endpoints Públicos)
Simula carga de leitura em endpoints que não requerem autenticação:
- `GET /api/v1/professores` - Lista de professores
- `GET /api/cursos` - Lista de cursos

**Objetivo**: Gerar volume alto de requisições HTTP simples para medir capacidade de throughput.

#### Cenário 2: Escrita/Processamento (Endpoints Protegidos)
Simula operações de escrita que disparam processamento assíncrono:
- `POST /api/users` - Criação de usuários com role STUDENT

**Características**:
- Requer autenticação JWT
- Gera dados aleatórios (nomes, emails, contatos) para evitar duplicatas
- Payload inclui `alunoProfile` com dados validados:
  - `contato`: 12-50 caracteres (ex: "(11) 99999-9999")
  - `dataNascimento`: Data no passado (formato YYYY-MM-DD)
  - `endereco`: Campos obrigatórios (rua, numero, cidade, estado, cep)
- Dispara eventos RabbitMQ para sincronização entre microsserviços
- Persiste dados no PostgreSQL

### Perfil de Carga (Stages)

O teste é dividido em 4 estágios que simulam diferentes níveis de carga:

```
Stage 1: Ramp-up (30s)
  0 → 50 VUs
  Aquecimento gradual do sistema

Stage 2: Sustentação (1m)
  50 VUs constantes
  Carga normal de operação

Stage 3: Stress (30s)
  50 → 200 VUs
  Pico de carga para testar limites

Stage 4: Cool-down (30s)
  200 → 0 VUs
  Retorno ao estado normal
```

**Duração Total**: ~2.5 minutos

### Métricas e Thresholds

O teste define limites de qualidade (SLOs):

| Métrica | Threshold | Descrição |
|---------|-----------|-----------|
| `http_req_duration` | p95 < 500ms | 95% das requisições devem responder em menos de 500ms |
| `http_req_failed` | rate < 10% | Taxa de erro deve ser menor que 10% |
| `errors` | rate < 10% | Taxa de erro customizada deve ser menor que 10% |

## 🚀 Como Executar

### Pré-requisitos

1. **Docker** instalado e rodando
2. **DistriSchool** deployado no Minikube
3. **Stack de Monitoramento** ativa (Prometheus + Grafana)
4. **Ingress** configurado e acessível

### Execução Rápida

Execute o script PowerShell automatizado:

```powershell
.\run-load-test.ps1
```

O script irá:
1. ✓ Verificar se Docker está rodando
2. ✓ Baixar a imagem do k6 (se necessário)
3. ✓ Detectar automaticamente o IP do Minikube
4. ✓ Configurar mapeamento de hosts
5. ✓ Executar o teste de carga
6. ✓ Exibir resultados e próximos passos

### Opções Avançadas

```powershell
# Usar URL específica
.\run-load-test.ps1 -BaseUrl http://192.168.49.2

# Usar credenciais diferentes
.\run-load-test.ps1 -AdminEmail "outro@email.com" -AdminPassword "senha"

# Ver ajuda
.\run-load-test.ps1 -Help
```

### Execução Manual com Docker

Se preferir executar manualmente:

```bash
# Obter IP do Minikube
$MINIKUBE_IP = minikube ip

# Executar k6
docker run --rm -i \
  -v ${PWD}/tests/k6:/scripts \
  -e BASE_URL=http://$MINIKUBE_IP \
  -e ADMIN_EMAIL=admin@distrischool.com \
  -e ADMIN_PASSWORD=admin123 \
  --add-host distrischool.local:$MINIKUBE_IP \
  grafana/k6 run /scripts/load-test.js
```

### Execução Nativa (k6 instalado localmente)

Se você tiver o k6 instalado:

```bash
# Windows (chocolatey)
choco install k6

# Executar teste
k6 run tests/k6/load-test.js
```

## 📊 Observando os Resultados

### Durante o Teste

**No Terminal**:
- Progress bar com estágio atual
- Métricas em tempo real (RPS, latência, erros)
- Checks passando/falhando

**No Grafana** (http://localhost:30030):
1. Faça login: `admin` / `admin`
2. Navegue para Dashboards
3. Observe:
   - **Requisições por Segundo**: Deve subir drasticamente durante o teste
   - **Latência (P95, P99)**: Deve aumentar com a carga
   - **CPU/Memória dos Pods**: Variação de recursos
   - **Taxa de Erro**: Deve permanecer baixa (< 10%)

**No Prometheus** (http://localhost:30090):
- Queries customizadas com PromQL
- Dados brutos das métricas
- Grafos de série temporal

### Após o Teste

O k6 exibe um resumo completo:

```
✓ authentication successful
✓ token received
✓ GET professores status 200
✓ GET cursos status 200
✓ POST user (student) status 201 or 200

checks.........................: 95.00% ✓ 1900 ✗ 100
data_received..................: 2.5 MB 1.0 MB/s
data_sent......................: 1.2 MB 480 kB/s
http_req_duration..............: avg=120ms min=10ms med=100ms max=800ms p(95)=350ms p(99)=500ms
http_reqs......................: 2000   13.3/s
iterations.....................: 500    3.3/s
vus............................: 200    min=0 max=200
vus_max........................: 200    min=200 max=200
```

## 📈 Queries PromQL Úteis

Execute no Prometheus ou Grafana:

### Requisições por Segundo
```promql
rate(http_server_requests_seconds_count[1m])
```

### Latência P95 por Serviço
```promql
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))
```

### Taxa de Erro HTTP
```promql
rate(http_server_requests_seconds_count{status=~"5.."}[5m])
```

### Uso de CPU por Pod
```promql
rate(process_cpu_seconds_total[1m])
```

### Uso de Memória JVM
```promql
jvm_memory_used_bytes{area="heap"}
```

### Mensagens RabbitMQ
```promql
rabbitmq_queue_messages_ready
```

## 🔧 Customização

### Modificar Carga

Edite `load-test.js` e ajuste os `stages`:

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Mais agressivo
    { duration: '5m', target: 100 },   // Teste mais longo
    { duration: '30s', target: 500 },  // Stress extremo
  ],
};
```

### Adicionar Novos Cenários

Adicione novos endpoints na função `default`:

```javascript
export default function(data) {
  // ... código existente ...
  
  // Novo cenário: Consultar notas
  const notasRes = http.get(
    `${baseUrl}/api/notas`,
    authHeaders
  );
  
  check(notasRes, {
    'GET notas status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
}
```

### Modificar Thresholds

Ajuste os limites de qualidade conforme necessário:

```javascript
thresholds: {
  http_req_duration: ['p(95)<300'],   // Mais rigoroso
  http_req_failed: ['rate<0.05'],     // Menos tolerante
},
```

## 🐛 Troubleshooting

### Erro: "Authentication failed"

**Causa**: Sistema não está acessível ou credenciais incorretas

**Solução**:
```powershell
# Verificar se pods estão rodando
kubectl get pods

# Verificar ingress
kubectl get ingress

# Testar manualmente
curl http://distrischool.local/api/v1/auth/token
```

### Erro: "Connection refused"

**Causa**: URL incorreta ou sistema não está acessível do Docker

**Solução**:
```powershell
# Obter IP do Minikube
minikube ip

# Executar com IP explícito
.\run-load-test.ps1 -BaseUrl http://192.168.49.2
```

### Alta Taxa de Erros (> 10%)

**Causa**: Sistema sobrecarregado ou bugs

**Ações**:
1. Reduza a carga nos `stages`
2. Verifique logs dos pods: `kubectl logs -l app=aluno-service`
3. Verifique recursos: `kubectl top pods`
4. Aumente recursos (CPU/Memory) nos deployments

### k6 Muito Lento

**Causa**: Docker com poucos recursos ou sistema lento

**Solução**:
1. Aumente recursos do Docker (Settings → Resources)
2. Execute k6 nativamente (sem Docker)
3. Reduza número de VUs ou duração

## 📚 Referências

- [k6 Documentation](https://k6.io/docs/)
- [k6 API Reference](https://k6.io/docs/javascript-api/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [DistriSchool Monitoring Guide](../../k8s-manifests/monitoring/README.md)

## 🎓 Conceitos de Performance

### Virtual Users (VUs)
Usuários virtuais simulados pelo k6. Cada VU executa o script de teste de forma independente.

### Ramp-up
Período de aquecimento onde a carga aumenta gradualmente, permitindo que o sistema se ajuste.

### Throughput
Número de requisições por segundo (RPS) que o sistema consegue processar.

### Latência
Tempo de resposta de uma requisição. Medidas importantes:
- **P50 (Mediana)**: 50% das requisições
- **P95**: 95% das requisições (elimina outliers)
- **P99**: 99% das requisições (casos extremos)

### Taxa de Erro
Percentual de requisições que falharam (status 4xx/5xx ou timeouts).

## 📝 Notas

- Os testes criam dados reais no banco (alunos, professores)
- Use ambiente de teste, não produção!
- Considere limpeza periódica do banco de dados após testes
- RabbitMQ e PostgreSQL também são testados indiretamente
- Grafana mostra métricas em tempo real dos microsserviços

---

**Desenvolvido como parte do DistriSchool - Plataforma de Gestão Escolar Distribuída**
