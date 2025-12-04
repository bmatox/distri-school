# 🛡️ Padrões de Resiliência e Arquitetura de Mensageria

## Visão Geral

Este documento descreve a implementação de padrões de resiliência (Circuit Breaker e Retry) e a arquitetura de mensageria assíncrona (RabbitMQ) no DistriSchool.

## 🔄 Resilience4J - Padrões de Resiliência

### Por que Resiliência?

Em uma arquitetura de microserviços, falhas são inevitáveis. Padrões de resiliência garantem que:
- Falhas em um serviço não causem cascata de falhas
- O sistema continue operacional mesmo com problemas parciais
- Usuários recebam feedback apropriado em caso de problemas
- Serviços tenham chance de se recuperar antes de novas tentativas

### Circuit Breaker

O **Circuit Breaker** previne cascata de falhas interrompendo chamadas para serviços que estão falhando.

#### Estados do Circuit Breaker

1. **CLOSED** (Fechado): Estado normal, requisições fluem normalmente
2. **OPEN** (Aberto): Serviço está falhando, requisições são rejeitadas imediatamente
3. **HALF_OPEN** (Semi-aberto): Tentando recuperação, algumas requisições são permitidas

#### Configuração

```properties
# Circuit Breaker Configuration
resilience4j.circuitbreaker.instances.default.registerHealthIndicator=true
resilience4j.circuitbreaker.instances.default.slidingWindowSize=10
resilience4j.circuitbreaker.instances.default.minimumNumberOfCalls=5
resilience4j.circuitbreaker.instances.default.permittedNumberOfCallsInHalfOpenState=3
resilience4j.circuitbreaker.instances.default.automaticTransitionFromOpenToHalfOpenEnabled=true
resilience4j.circuitbreaker.instances.default.waitDurationInOpenState=5s
resilience4j.circuitbreaker.instances.default.failureRateThreshold=50
resilience4j.circuitbreaker.instances.default.eventConsumerBufferSize=10
```

**Explicação dos Parâmetros:**
- `slidingWindowSize=10`: Analisa as últimas 10 requisições
- `minimumNumberOfCalls=5`: Necessário no mínimo 5 chamadas antes de calcular taxa de falha
- `permittedNumberOfCallsInHalfOpenState=3`: Permite 3 chamadas no estado half-open
- `automaticTransitionFromOpenToHalfOpenEnabled=true`: Transição automática após tempo de espera
- `waitDurationInOpenState=5s`: Aguarda 5 segundos antes de tentar half-open
- `failureRateThreshold=50`: Abre circuito se 50% das chamadas falharem

#### Exemplo de Uso

```java
@Service
public class GradeService {
    
    @CircuitBreaker(name = "default", fallbackMethod = "createGradeFallback")
    @Retry(name = "default")
    public Grade createGrade(CreateGradeRequest request) {
        // Lógica de criação de nota
        Grade grade = gradeRepository.save(grade);
        
        // Publicação de evento
        rabbitTemplate.convertAndSend(EXCHANGE_NAME, "grade.created", grade);
        
        return grade;
    }
    
    // Método fallback executado quando circuit breaker está aberto
    private Grade createGradeFallback(CreateGradeRequest request, Exception e) {
        log.error("Circuit breaker activated - createGrade fallback", e);
        throw new RuntimeException("Service temporarily unavailable. Please try again later.");
    }
}
```

### Retry

O **Retry** tenta executar operações múltiplas vezes antes de falhar definitivamente.

#### Configuração

```properties
# Retry Configuration
resilience4j.retry.instances.default.maxAttempts=3
resilience4j.retry.instances.default.waitDuration=1s
resilience4j.retry.instances.default.enableExponentialBackoff=true
resilience4j.retry.instances.default.exponentialBackoffMultiplier=2
```

**Explicação dos Parâmetros:**
- `maxAttempts=3`: Máximo de 3 tentativas
- `waitDuration=1s`: Espera 1 segundo entre tentativas
- `enableExponentialBackoff=true`: Backoff exponencial ativado
- `exponentialBackoffMultiplier=2`: Multiplica tempo de espera por 2 a cada tentativa

**Sequência de Espera:**
- Tentativa 1: Falha
- Espera 1s
- Tentativa 2: Falha
- Espera 2s (1s * 2)
- Tentativa 3: Falha
- Desiste

### Serviços com Resiliência

Os seguintes serviços implementam padrões de resiliência:

1. **Professor Service** (porta 8082)
2. **Aluno Service** (porta 8081)
3. **Grades Service** (porta 8083)
4. **Communication Service** (porta 8084)

## 🐰 RabbitMQ - Arquitetura de Mensageria

### Por que Mensageria Assíncrona?

A mensageria assíncrona oferece:
- **Desacoplamento**: Serviços não precisam conhecer uns aos outros
- **Escalabilidade**: Múltiplos consumidores podem processar mensagens
- **Resiliência**: Mensagens são persistidas até serem processadas
- **Event-Driven**: Reação a eventos de negócio em tempo real

### Topologia

```
┌─────────────────────────────────────────────────────────┐
│                    distrischool.events.exchange         │
│                    (Topic Exchange)                     │
└───────────────┬────────────────┬────────────────────────┘
                │                │
    grade.*     │                │    notification.*
                │                │
                ▼                ▼
    ┌───────────────┐  ┌──────────────────────┐
    │ grades.events │  │ communication.events │
    │    .queue     │  │       .queue         │
    └───────────────┘  └──────────────────────┘
                │                │
                ▼                ▼
    ┌────────────────┐ ┌──────────────────┐
    │ Grades Service │ │ Communication    │
    │   (Producer)   │ │    Service       │
    └────────────────┘ │  (Consumer)      │
                       └──────────────────┘
```

### Exchange e Routing Keys

**Exchange Name**: `distrischool.events.exchange`  
**Type**: Topic Exchange

**Routing Keys Utilizadas:**

| Serviço | Routing Keys | Descrição |
|---------|-------------|-----------|
| Grades Service | `grade.created`, `grade.updated`, `grade.deleted` | Eventos de notas |
| Communication Service | `notification.created`, `notification.read`, `notification.deleted` | Eventos de notificações |
| Professor Service | `professor.created`, `professor.updated`, `professor.deleted` | Eventos de professores |
| Aluno Service | `aluno.created`, `aluno.updated`, `aluno.deleted` | Eventos de alunos |
| User Service | `user.created`, `user.updated`, `user.deleted` | Eventos de usuários |

### Filas

| Fila | Serviço Consumidor | Padrão de Routing |
|------|-------------------|-------------------|
| `grades.events.queue` | Grades Service | `grade.*` |
| `communication.events.queue` | Communication Service | `notification.*` |

### Fluxo de Eventos: Lançamento de Nota

Este é um exemplo completo de como os eventos fluem no sistema:

```
1. Professor lança nota via frontend
   └─> POST /api/grades

2. Grades Service processa requisição
   └─> Salva nota no banco de dados
   └─> Publica evento: grade.created

3. RabbitMQ roteia evento
   └─> Exchange: distrischool.events.exchange
   └─> Routing Key: grade.created
   └─> Fila: communication.events.queue

4. Communication Service consome evento
   └─> GradeEventListener recebe mensagem
   └─> Cria notificação para o aluno
   └─> Salva no banco de dados
   └─> Publica evento: notification.created

5. Aluno vê notificação no frontend
   └─> GET /api/notifications/user/{userId}/unread
```

### Configuração RabbitMQ

#### Producer (Grades Service)

```java
@Configuration
public class RabbitMQConfig {
    
    public static final String EXCHANGE_NAME = "distrischool.events.exchange";
    public static final String QUEUE_NAME = "grades.events.queue";
    public static final String ROUTING_KEY = "grade.*";
    
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }
    
    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME, true); // durable
    }
    
    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }
    
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
```

#### Consumer (Communication Service)

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class GradeEventListener {
    
    private final NotificationService notificationService;
    
    @RabbitListener(queues = "communication.events.queue")
    public void handleGradeCreated(Map<String, Object> gradeData) {
        try {
            String routingKey = (String) gradeData.get("_routingKey");
            
            if ("grade.created".equals(routingKey)) {
                log.info("Received grade.created event: {}", gradeData);
                
                Long studentId = ((Number) gradeData.get("studentId")).longValue();
                String subject = (String) gradeData.get("subject");
                Object gradeValue = gradeData.get("grade");
                
                CreateNotificationRequest request = new CreateNotificationRequest();
                request.setUserId(studentId);
                request.setTitle("Nova Nota Lançada");
                request.setMessage(String.format("Você recebeu uma nova nota em %s: %s", 
                    subject, gradeValue));
                request.setNotificationType("GRADE_POSTED");
                
                notificationService.createNotification(request);
            }
        } catch (Exception e) {
            log.error("Error processing grade event", e);
        }
    }
}
```

### Propriedades de Conexão

```properties
# RabbitMQ Configuration
spring.rabbitmq.host=${SPRING_RABBITMQ_HOST:rabbitmq-service}
spring.rabbitmq.port=${SPRING_RABBITMQ_PORT:5672}
spring.rabbitmq.username=${SPRING_RABBITMQ_USERNAME:guest}
spring.rabbitmq.password=${SPRING_RABBITMQ_PASSWORD:guest}
```

### Garantias de Entrega

#### Persistência

- **Exchange**: Durável (sobrevive a reinicializações)
- **Filas**: Duráveis (mensagens são persistidas em disco)
- **Mensagens**: Podem ser marcadas como persistentes

#### Confirmação de Mensagens

```properties
# Confirmação manual de mensagens
spring.rabbitmq.listener.simple.acknowledge-mode=manual
```

## 📊 Monitoramento

### Health Checks

O Circuit Breaker expõe health indicators:

```bash
curl http://distrischool.local/api/grades/actuator/health
```

**Resposta:**
```json
{
  "status": "UP",
  "components": {
    "circuitBreakers": {
      "status": "UP",
      "details": {
        "default": {
          "status": "UP",
          "state": "CLOSED",
          "failureRate": "0.0%",
          "slowCallRate": "0.0%"
        }
      }
    },
    "db": {
      "status": "UP"
    },
    "rabbit": {
      "status": "UP"
    }
  }
}
```

### RabbitMQ Management Console

Acesse a interface web do RabbitMQ para monitorar:

```bash
minikube service rabbitmq-service --url
# Usar porta 15672
# Credenciais: guest/guest
```

**Funcionalidades:**
- Visualizar exchanges e filas
- Monitorar taxa de mensagens
- Ver bindings entre exchanges e filas
- Debug de mensagens
- Estatísticas de consumo

## 🧪 Testando Resiliência

### Teste 1: Circuit Breaker

```bash
# Simular falha no banco de dados
kubectl delete pod -l app=postgres

# Tentar criar nota
curl -X POST http://distrischool.local/api/grades \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "professorId": 2,
    "subject": "Math",
    "grade": 8.5,
    "evaluationType": "PROVA"
  }'

# Após 5 tentativas com 50% de falha, circuit breaker abre
# Resposta: "Service temporarily unavailable. Please try again later."
```

### Teste 2: Retry com Exponential Backoff

```bash
# Observar logs do serviço
kubectl logs -f deployment/grades-deployment

# Ver tentativas de retry
# Tentativa 1: Falha
# Esperando 1s...
# Tentativa 2: Falha
# Esperando 2s...
# Tentativa 3: Falha
# Desistindo...
```

### Teste 3: Mensageria Assíncrona

```bash
# 1. Lançar nota
curl -X POST http://distrischool.local/api/grades \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "professorId": 2,
    "subject": "Matemática",
    "grade": 9.0,
    "evaluationType": "PROVA"
  }'

# 2. Verificar logs do Communication Service
kubectl logs -f deployment/communication-deployment
# Deve mostrar: "Received grade.created event"
# Deve mostrar: "Created notification for student 1"

# 3. Consultar notificações do aluno
curl http://distrischool.local/api/notifications/user/1/unread

# Deve retornar notificação criada automaticamente
```

## 🔍 Troubleshooting

### Circuit Breaker Sempre Aberto

**Problema**: Circuit breaker não fecha mesmo após serviço se recuperar.

**Solução**:
1. Verificar `waitDurationInOpenState` - pode estar muito alto
2. Verificar `automaticTransitionFromOpenToHalfOpenEnabled=true`
3. Reiniciar o serviço para resetar estado

### Mensagens Não Consumidas

**Problema**: Mensagens ficam acumuladas na fila.

**Solução**:
1. Verificar se consumidor está rodando: `kubectl get pods`
2. Verificar logs do consumidor: `kubectl logs deployment/communication-deployment`
3. Verificar binding no RabbitMQ Management Console
4. Verificar routing key do evento corresponde ao padrão da fila

### Retry Infinito

**Problema**: Serviço fica tentando infinitamente.

**Solução**:
1. Verificar `maxAttempts` está configurado
2. Verificar se fallback method está sendo executado
3. Adicionar timeout nas operações

## 📚 Recursos Adicionais

- [Resilience4J Documentation](https://resilience4j.readme.io/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Spring AMQP Documentation](https://docs.spring.io/spring-amqp/reference/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
