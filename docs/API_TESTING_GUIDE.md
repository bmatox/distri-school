# 🔌 DistriSchool - Guia de Testes de API

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Professor Service API](#professor-service-api)
4. [Aluno Service API](#aluno-service-api)
5. [User Service API](#user-service-api)
6. [API Gateway](#api-gateway)
7. [Testando Integração com Frontend](#testando-integração-com-frontend)
8. [Testes Avançados](#testes-avançados)
9. [Ferramentas de Teste](#ferramentas-de-teste)

---

## Visão Geral

Este guia fornece exemplos práticos de como testar todos os endpoints das APIs do DistriSchool. Cada seção inclui:

- **Endpoint**: URL completa
- **Método HTTP**: GET, POST, PUT, DELETE
- **Request**: Corpo da requisição (se aplicável)
- **Response**: Exemplo de resposta esperada
- **Comandos**: PowerShell, curl e Postman

### URLs Base

- **Via Ingress**: `http://distrischool.local/api`
- **Professor Service Direto**: `http://localhost:8082` (com port-forward)
- **Aluno Service Direto**: `http://localhost:8081` (com port-forward)
- **User Service Direto**: `http://localhost:8080` (com port-forward)

---

## Configuração Inicial

### Garantir que o Sistema Está Rodando

```powershell
# Verificar pods
kubectl get pods

# Todos devem estar Running

# Verificar serviços
kubectl get services

# Verificar Ingress
kubectl get ingress

# Garantir que minikube tunnel está rodando
# Deve haver um terminal executando: minikube tunnel
```

### Testar Conectividade Básica

```powershell
# Testar acesso ao API Gateway
curl http://distrischool.local/api/actuator/health

# Resposta esperada:
# {"status":"UP"}
```

---

## Professor Service API

### Base URL
- Via Gateway: `http://distrischool.local/api/v1/professores`
- Direto: `http://localhost:8082/api/v1/professores` (requer port-forward)

### 1. Listar Todos os Professores (GET)

**Endpoint**: `GET /api/v1/professores`

**Descrição**: Retorna lista paginada de professores

**PowerShell**:
```powershell
# Requisição simples
$professores = Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores" -Method GET
$professores | ConvertTo-Json

# Com paginação
$url = "http://distrischool.local/api/v1/professores?page=0&size=10&sort=nome,asc"
$professores = Invoke-RestMethod -Uri $url -Method GET
$professores | ConvertTo-Json
```

**curl**:
```bash
# Listar todos
curl http://distrischool.local/api/v1/professores

# Com paginação
curl "http://distrischool.local/api/v1/professores?page=0&size=10&sort=nome,asc"
```

**Parâmetros de Query**:
- `page`: Número da página (começa em 0)
- `size`: Itens por página (padrão: 20)
- `sort`: Campo de ordenação (ex: `nome,asc`, `dataContratacao,desc`)

**Response (200 OK)**:
```json
{
  "content": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao.silva@distrischool.com",
      "cpf": "12345678901",
      "departamento": "Ciência da Computação",
      "titulacao": "DOUTOR",
      "dataContratacao": "2025-01-01"
    },
    {
      "id": 2,
      "nome": "Maria Santos",
      "email": "maria.santos@distrischool.com",
      "cpf": "98765432100",
      "departamento": "Matemática",
      "titulacao": "MESTRE",
      "dataContratacao": "2024-08-15"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": false,
      "unsorted": true,
      "empty": true
    }
  },
  "totalElements": 2,
  "totalPages": 1,
  "last": true,
  "first": true,
  "number": 0,
  "numberOfElements": 2,
  "size": 20,
  "empty": false
}
```

### 2. Buscar Professor por ID (GET)

**Endpoint**: `GET /api/v1/professores/{id}`

**Descrição**: Retorna um professor específico pelo ID

**PowerShell**:
```powershell
$professorId = 1
$professor = Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores/$professorId" -Method GET
$professor | ConvertTo-Json
```

**curl**:
```bash
curl http://distrischool.local/api/v1/professores/1
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao.silva@distrischool.com",
  "cpf": "12345678901",
  "departamento": "Ciência da Computação",
  "titulacao": "DOUTOR",
  "dataContratacao": "2025-01-01"
}
```

**Response (404 Not Found)**:
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Professor não encontrado com ID: 999",
  "path": "/api/v1/professores/999"
}
```

### 3. Criar Professor (POST)

**Endpoint**: `POST /api/v1/professores`

**Descrição**: Cria um novo professor

**PowerShell**:
```powershell
# Preparar dados
$novoProfessor = @{
    nome = "Carlos Oliveira"
    email = "carlos.oliveira@distrischool.com"
    cpf = "11122233344"
    departamento = "Física"
    titulacao = "DOUTOR"
    dataContratacao = "2025-02-01"
} | ConvertTo-Json

# Criar
$professor = Invoke-RestMethod `
    -Uri "http://distrischool.local/api/v1/professores" `
    -Method POST `
    -Body $novoProfessor `
    -ContentType "application/json"

Write-Host "Professor criado com ID: $($professor.id)"
$professor | ConvertTo-Json
```

**curl**:
```bash
curl -X POST http://distrischool.local/api/v1/professores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos Oliveira",
    "email": "carlos.oliveira@distrischool.com",
    "cpf": "11122233344",
    "departamento": "Física",
    "titulacao": "DOUTOR",
    "dataContratacao": "2025-02-01"
  }'
```

**Request Body**:
```json
{
  "nome": "Carlos Oliveira",
  "email": "carlos.oliveira@distrischool.com",
  "cpf": "11122233344",
  "departamento": "Física",
  "titulacao": "DOUTOR",
  "dataContratacao": "2025-02-01"
}
```

**Validações**:
- `nome`: Obrigatório, não vazio
- `email`: Obrigatório, formato válido, único
- `cpf`: Obrigatório, 11 dígitos
- `departamento`: Obrigatório
- `titulacao`: Valores válidos: `GRADUACAO`, `ESPECIALIZACAO`, `MESTRE`, `DOUTOR`
- `dataContratacao`: Obrigatório, formato: `YYYY-MM-DD`

**Response (201 Created)**:
```json
{
  "id": 3,
  "nome": "Carlos Oliveira",
  "email": "carlos.oliveira@distrischool.com",
  "cpf": "11122233344",
  "departamento": "Física",
  "titulacao": "DOUTOR",
  "dataContratacao": "2025-02-01"
}
```

**Response (400 Bad Request)** - Validação falhou:
```json
{
  "timestamp": "2025-01-15T10:35:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Email já está em uso",
  "path": "/api/v1/professores"
}
```

### 4. Atualizar Professor (PUT)

**Endpoint**: `PUT /api/v1/professores/{id}`

**Descrição**: Atualiza um professor existente

**PowerShell**:
```powershell
$professorId = 3

$professorAtualizado = @{
    nome = "Carlos Oliveira da Silva"
    email = "carlos.oliveira@distrischool.com"
    cpf = "11122233344"
    departamento = "Física e Astronomia"
    titulacao = "DOUTOR"
    dataContratacao = "2025-02-01"
} | ConvertTo-Json

$resultado = Invoke-RestMethod `
    -Uri "http://distrischool.local/api/v1/professores/$professorId" `
    -Method PUT `
    -Body $professorAtualizado `
    -ContentType "application/json"

$resultado | ConvertTo-Json
```

**curl**:
```bash
curl -X PUT http://distrischool.local/api/v1/professores/3 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos Oliveira da Silva",
    "email": "carlos.oliveira@distrischool.com",
    "cpf": "11122233344",
    "departamento": "Física e Astronomia",
    "titulacao": "DOUTOR",
    "dataContratacao": "2025-02-01"
  }'
```

**Response (200 OK)**:
```json
{
  "id": 3,
  "nome": "Carlos Oliveira da Silva",
  "email": "carlos.oliveira@distrischool.com",
  "cpf": "11122233344",
  "departamento": "Física e Astronomia",
  "titulacao": "DOUTOR",
  "dataContratacao": "2025-02-01"
}
```

### 5. Deletar Professor (DELETE)

**Endpoint**: `DELETE /api/v1/professores/{id}`

**Descrição**: Remove um professor

**PowerShell**:
```powershell
$professorId = 3

Invoke-RestMethod `
    -Uri "http://distrischool.local/api/v1/professores/$professorId" `
    -Method DELETE

Write-Host "Professor deletado com sucesso!"

# Verificar que foi deletado (deve dar erro 404)
try {
    Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores/$professorId" -Method GET
    Write-Host "ERRO: Professor ainda existe!"
} catch {
    Write-Host "Confirmado: Professor foi deletado (404 esperado)"
}
```

**curl**:
```bash
curl -X DELETE http://distrischool.local/api/v1/professores/3
```

**Response (204 No Content)**: Sem corpo de resposta

**Response (404 Not Found)**:
```json
{
  "timestamp": "2025-01-15T10:40:00",
  "status": 404,
  "error": "Not Found",
  "message": "Professor não encontrado com ID: 3",
  "path": "/api/v1/professores/3"
}
```

---

## Aluno Service API

### Base URL
- Via Gateway: `http://distrischool.local/api/alunos`
- Direto: `http://localhost:8081/api/alunos`

### 1. Listar Todos os Alunos (GET)

**Endpoint**: `GET /api/alunos`

**PowerShell**:
```powershell
$alunos = Invoke-RestMethod -Uri "http://distrischool.local/api/alunos" -Method GET
$alunos | ConvertTo-Json -Depth 3
```

**curl**:
```bash
curl http://distrischool.local/api/alunos
```

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "nome": "Ana Costa",
    "email": "ana.costa@aluno.distrischool.com",
    "matricula": "2025001",
    "dataNascimento": "2005-03-20",
    "endereco": {
      "rua": "Rua das Flores",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01000-000"
    }
  },
  {
    "id": 2,
    "nome": "Pedro Alves",
    "email": "pedro.alves@aluno.distrischool.com",
    "matricula": "2025002",
    "dataNascimento": "2004-07-15",
    "endereco": {
      "rua": "Av. Paulista",
      "numero": "1000",
      "bairro": "Bela Vista",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310-100"
    }
  }
]
```

### 2. Buscar Aluno por ID (GET)

**Endpoint**: `GET /api/alunos/{id}`

**PowerShell**:
```powershell
$alunoId = 1
$aluno = Invoke-RestMethod -Uri "http://distrischool.local/api/alunos/$alunoId" -Method GET
$aluno | ConvertTo-Json -Depth 3
```

**curl**:
```bash
curl http://distrischool.local/api/alunos/1
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "nome": "Ana Costa",
  "email": "ana.costa@aluno.distrischool.com",
  "matricula": "2025001",
  "dataNascimento": "2005-03-20",
  "endereco": {
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01000-000"
  }
}
```

### 3. Buscar Aluno por Matrícula (GET)

**Endpoint**: `GET /api/alunos/matricula/{matricula}`

**PowerShell**:
```powershell
$matricula = "2025001"
$aluno = Invoke-RestMethod -Uri "http://distrischool.local/api/alunos/matricula/$matricula" -Method GET
$aluno | ConvertTo-Json -Depth 3
```

**curl**:
```bash
curl http://distrischool.local/api/alunos/matricula/2025001
```

**Response (200 OK)**: Mesmo formato do buscar por ID

### 4. Criar Aluno (POST)

**Endpoint**: `POST /api/alunos`

**PowerShell**:
```powershell
$novoAluno = @{
    nome = "Lucas Martins"
    email = "lucas.martins@aluno.distrischool.com"
    matricula = "2025003"
    dataNascimento = "2003-11-10"
    endereco = @{
        rua = "Rua dos Estudantes"
        numero = "456"
        bairro = "Universitário"
        cidade = "Campinas"
        estado = "SP"
        cep = "13083-000"
    }
} | ConvertTo-Json -Depth 3

$aluno = Invoke-RestMethod `
    -Uri "http://distrischool.local/api/alunos" `
    -Method POST `
    -Body $novoAluno `
    -ContentType "application/json"

Write-Host "Aluno criado com ID: $($aluno.id)"
$aluno | ConvertTo-Json -Depth 3
```

**curl**:
```bash
curl -X POST http://distrischool.local/api/alunos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Lucas Martins",
    "email": "lucas.martins@aluno.distrischool.com",
    "matricula": "2025003",
    "dataNascimento": "2003-11-10",
    "endereco": {
      "rua": "Rua dos Estudantes",
      "numero": "456",
      "bairro": "Universitário",
      "cidade": "Campinas",
      "estado": "SP",
      "cep": "13083-000"
    }
  }'
```

**Validações**:
- `nome`: Obrigatório
- `email`: Obrigatório, formato válido
- `matricula`: Obrigatório, único
- `dataNascimento`: Obrigatório, formato: `YYYY-MM-DD`
- `endereco`: Todos os campos obrigatórios

**Response (201 Created)**: Mesmo formato da resposta de busca

### 5. Atualizar Aluno (PUT)

**Endpoint**: `PUT /api/alunos/{id}`

**PowerShell**:
```powershell
$alunoId = 3

$alunoAtualizado = @{
    nome = "Lucas Martins Silva"
    email = "lucas.martins@aluno.distrischool.com"
    matricula = "2025003"
    dataNascimento = "2003-11-10"
    endereco = @{
        rua = "Rua Nova"
        numero = "789"
        bairro = "Jardim"
        cidade = "Campinas"
        estado = "SP"
        cep = "13100-000"
    }
} | ConvertTo-Json -Depth 3

$resultado = Invoke-RestMethod `
    -Uri "http://distrischool.local/api/alunos/$alunoId" `
    -Method PUT `
    -Body $alunoAtualizado `
    -ContentType "application/json"

$resultado | ConvertTo-Json -Depth 3
```

**Response (200 OK)**: Aluno atualizado

### 6. Deletar Aluno (DELETE)

**Endpoint**: `DELETE /api/alunos/{id}`

**PowerShell**:
```powershell
$alunoId = 3
Invoke-RestMethod -Uri "http://distrischool.local/api/alunos/$alunoId" -Method DELETE
Write-Host "Aluno deletado com sucesso!"
```

**curl**:
```bash
curl -X DELETE http://distrischool.local/api/alunos/3
```

**Response (204 No Content)**: Sem corpo de resposta

---

## User Service API

### Base URL
- Via Gateway: `http://distrischool.local/api/users`
- Direto: `http://localhost:8080/api/users`

### 1. Listar Todos os Usuários (GET)

**Endpoint**: `GET /api/users`

**PowerShell**:
```powershell
$users = Invoke-RestMethod -Uri "http://distrischool.local/api/users" -Method GET
$users | ConvertTo-Json
```

**curl**:
```bash
curl http://distrischool.local/api/users
```

**Response (200 OK)**:
```json
{
  "content": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@distrischool.com",
      "role": "ADMIN",
      "createdAt": "2025-01-01T10:00:00"
    },
    {
      "id": 2,
      "username": "secretaria",
      "email": "secretaria@distrischool.com",
      "role": "USER",
      "createdAt": "2025-01-05T14:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 2,
  "totalPages": 1
}
```

### 2. Buscar Usuário por ID (GET)

**Endpoint**: `GET /api/users/{id}`

**PowerShell**:
```powershell
$userId = 1
$user = Invoke-RestMethod -Uri "http://distrischool.local/api/users/$userId" -Method GET
$user | ConvertTo-Json
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@distrischool.com",
  "role": "ADMIN",
  "createdAt": "2025-01-01T10:00:00"
}
```

### 3. Criar Usuário (POST)

**Endpoint**: `POST /api/users`

**PowerShell**:
```powershell
$novoUser = @{
    username = "professor01"
    email = "professor01@distrischool.com"
    password = "senha123"
    role = "USER"
} | ConvertTo-Json

$user = Invoke-RestMethod `
    -Uri "http://distrischool.local/api/users" `
    -Method POST `
    -Body $novoUser `
    -ContentType "application/json"

$user | ConvertTo-Json
```

**Response (201 Created)**:
```json
{
  "id": 3,
  "username": "professor01",
  "email": "professor01@distrischool.com",
  "role": "USER",
  "createdAt": "2025-01-15T11:00:00"
}
```

**Nota**: A senha não é retornada na resposta por questões de segurança.

### 4. Atualizar Usuário (PUT)

**Endpoint**: `PUT /api/users/{id}`

**PowerShell**:
```powershell
$userId = 3

$userAtualizado = @{
    username = "professor01"
    email = "prof.novo@distrischool.com"
    role = "USER"
} | ConvertTo-Json

$resultado = Invoke-RestMethod `
    -Uri "http://distrischool.local/api/users/$userId" `
    -Method PUT `
    -Body $userAtualizado `
    -ContentType "application/json"

$resultado | ConvertTo-Json
```

**Response (200 OK)**: Usuário atualizado

### 5. Deletar Usuário (DELETE)

**Endpoint**: `DELETE /api/users/{id}`

**PowerShell**:
```powershell
$userId = 3
Invoke-RestMethod -Uri "http://distrischool.local/api/users/$userId" -Method DELETE
Write-Host "Usuário deletado com sucesso!"
```

**Response (204 No Content)**: Sem corpo de resposta

---

## API Gateway

### Health Check

**Endpoint**: `GET /api/actuator/health`

**PowerShell**:
```powershell
$health = Invoke-RestMethod -Uri "http://distrischool.local/api/actuator/health" -Method GET
$health | ConvertTo-Json
```

**Response (200 OK)**:
```json
{
  "status": "UP"
}
```

### Roteamento

O API Gateway roteia requisições para os microserviços baseado no path:

| Path | Serviço Destino | Porta |
|------|----------------|-------|
| `/api/v1/professores/**` | Professor Service | 8082 |
| `/api/alunos/**` | Aluno Service | 8081 |
| `/api/users/**` | User Service | 8080 |

**Exemplo de roteamento**:
```
Requisição:  GET http://distrischool.local/api/v1/professores
Gateway:     Roteia para http://professor-tecadm-service:8082/api/v1/professores
Resposta:    Retornada ao cliente
```

---

## Testando Integração com Frontend

### Verificar Requisições do Frontend

1. **Abrir o Frontend**: `http://distrischool.local`

2. **Abrir DevTools**: Pressionar F12

3. **Ir para aba Network**

4. **Realizar operação no frontend** (ex: listar professores)

5. **Verificar requisições**:
   ```
   Request URL: http://distrischool.local/api/v1/professores
   Request Method: GET
   Status Code: 200 OK
   Response: [array de professores]
   ```

6. **Criar novo professor via UI**:
   ```
   Request URL: http://distrischool.local/api/v1/professores
   Request Method: POST
   Status Code: 201 Created
   Request Payload: {nome: "...", email: "...", ...}
   Response: {id: 4, nome: "...", ...}
   ```

### Script para Monitorar Requisições

```powershell
# Monitorar logs do API Gateway em tempo real
kubectl logs -f deployment/api-gateway-deployment

# Fazer requisições do frontend
# Logs mostrarão todas as requisições passando pelo gateway
```

---

## Testes Avançados

### 1. Teste de Carga Simples

```powershell
# Fazer 100 requisições em sequência
for ($i=1; $i -le 100; $i++) {
    Write-Host "Requisição $i"
    $result = Invoke-WebRequest -Uri "http://distrischool.local/api/v1/professores" -UseBasicParsing
    Write-Host "  Status: $($result.StatusCode)"
}
```

### 2. Teste de Concorrência

```powershell
# Fazer múltiplas requisições em paralelo
$jobs = @()
for ($i=1; $i -le 10; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($i)
        $result = Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores"
        Write-Output "Job $i concluído - $($result.totalElements) professores"
    } -ArgumentList $i
}

# Aguardar todos os jobs
$jobs | Wait-Job

# Ver resultados
$jobs | Receive-Job

# Limpar
$jobs | Remove-Job
```

### 3. Teste de Validação

```powershell
# Tentar criar professor com dados inválidos
$professorInvalido = @{
    nome = ""  # Nome vazio (inválido)
    email = "email-invalido"  # Email inválido
    cpf = "123"  # CPF inválido
} | ConvertTo-Json

try {
    Invoke-RestMethod `
        -Uri "http://distrischool.local/api/v1/professores" `
        -Method POST `
        -Body $professorInvalido `
        -ContentType "application/json"
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Erro esperado:"
    $errorDetails | ConvertTo-Json
}
```

### 4. Teste de CORS

```powershell
# Verificar headers CORS
$response = Invoke-WebRequest -Uri "http://distrischool.local/api/v1/professores" -Method OPTIONS

Write-Host "CORS Headers:"
$response.Headers["Access-Control-Allow-Origin"]
$response.Headers["Access-Control-Allow-Methods"]
$response.Headers["Access-Control-Allow-Headers"]
```

---

## Ferramentas de Teste

### 1. PowerShell (Nativo)

**Vantagens**:
- Já vem com Windows
- Fácil de scripting
- Bom para automação

**Comandos principais**:
- `Invoke-RestMethod`: Requisições JSON
- `Invoke-WebRequest`: Requisições HTTP completas

### 2. curl (Command Line)

**Instalação**: Já vem com Windows 10+

**Exemplos**:
```bash
# GET
curl http://distrischool.local/api/v1/professores

# POST
curl -X POST http://distrischool.local/api/v1/professores \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test",...}'

# PUT
curl -X PUT http://distrischool.local/api/v1/professores/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Updated",...}'

# DELETE
curl -X DELETE http://distrischool.local/api/v1/professores/1
```

### 3. Postman (GUI)

**Download**: https://www.postman.com/downloads/

**Configuração**:

1. **Criar nova Collection**: "DistriSchool API"

2. **Adicionar requests**:
   - GET Listar Professores
   - GET Buscar Professor
   - POST Criar Professor
   - PUT Atualizar Professor
   - DELETE Deletar Professor

3. **Configurar variáveis**:
   - `{{base_url}}` = `http://distrischool.local/api`
   - `{{professor_id}}` = `1`

4. **Exemplo de request**:
   ```
   GET {{base_url}}/v1/professores
   
   Headers:
   Content-Type: application/json
   ```

### 4. Swagger UI (Documentação Interativa)

Se os serviços expõem Swagger/OpenAPI:

```powershell
# Acessar Swagger UI do Professor Service
kubectl port-forward deployment/professor-tecadm-deployment 8082:8082

# Abrir no navegador:
# http://localhost:8082/swagger-ui.html
```

### 5. Script de Teste Completo

```powershell
# ==========================================
# Script de Teste Completo da API
# ==========================================

Write-Host "INICIANDO TESTES DE API" -ForegroundColor Cyan

# Variáveis
$baseUrl = "http://distrischool.local/api"

# Teste 1: Listar Professores
Write-Host "`n[TESTE 1] Listar Professores" -ForegroundColor Yellow
$professores = Invoke-RestMethod -Uri "$baseUrl/v1/professores" -Method GET
Write-Host "  Total: $($professores.totalElements) professores" -ForegroundColor Green

# Teste 2: Criar Professor
Write-Host "`n[TESTE 2] Criar Professor" -ForegroundColor Yellow
$novoProfessor = @{
    nome = "Teste API $(Get-Date -Format 'HHmmss')"
    email = "teste.api.$(Get-Date -Format 'HHmmss')@test.com"
    cpf = "$(Get-Random -Minimum 10000000000 -Maximum 99999999999)"
    departamento = "Testes"
    titulacao = "MESTRE"
    dataContratacao = "2025-01-15"
} | ConvertTo-Json

$professor = Invoke-RestMethod -Uri "$baseUrl/v1/professores" -Method POST -Body $novoProfessor -ContentType "application/json"
Write-Host "  Professor criado com ID: $($professor.id)" -ForegroundColor Green

# Salvar ID para próximos testes
$professorId = $professor.id

# Teste 3: Buscar Professor
Write-Host "`n[TESTE 3] Buscar Professor por ID" -ForegroundColor Yellow
$professor = Invoke-RestMethod -Uri "$baseUrl/v1/professores/$professorId" -Method GET
Write-Host "  Professor encontrado: $($professor.nome)" -ForegroundColor Green

# Teste 4: Atualizar Professor
Write-Host "`n[TESTE 4] Atualizar Professor" -ForegroundColor Yellow
$professorAtualizado = @{
    nome = "Teste API Atualizado"
    email = $professor.email
    cpf = $professor.cpf
    departamento = "Testes Atualizados"
    titulacao = "DOUTOR"
    dataContratacao = $professor.dataContratacao
} | ConvertTo-Json

$professor = Invoke-RestMethod -Uri "$baseUrl/v1/professores/$professorId" -Method PUT -Body $professorAtualizado -ContentType "application/json"
Write-Host "  Professor atualizado: $($professor.departamento)" -ForegroundColor Green

# Teste 5: Deletar Professor
Write-Host "`n[TESTE 5] Deletar Professor" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/v1/professores/$professorId" -Method DELETE
Write-Host "  Professor deletado" -ForegroundColor Green

# Teste 6: Verificar deleção
Write-Host "`n[TESTE 6] Verificar Deleção" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/v1/professores/$professorId" -Method GET
    Write-Host "  ERRO: Professor ainda existe!" -ForegroundColor Red
} catch {
    Write-Host "  Confirmado: Professor foi deletado (404)" -ForegroundColor Green
}

# Teste 7: Listar Alunos
Write-Host "`n[TESTE 7] Listar Alunos" -ForegroundColor Yellow
$alunos = Invoke-RestMethod -Uri "$baseUrl/alunos" -Method GET
Write-Host "  Total: $($alunos.Count) alunos" -ForegroundColor Green

# Teste 8: Listar Usuários
Write-Host "`n[TESTE 8] Listar Usuários" -ForegroundColor Yellow
$users = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET
Write-Host "  Total: $($users.totalElements) usuários" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TODOS OS TESTES CONCLUÍDOS COM SUCESSO!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
```

---

## Conclusão

Este guia forneceu exemplos completos de como testar todos os endpoints das APIs do DistriSchool. Os testes podem ser executados:

- **Manualmente**: Para verificar funcionalidades específicas
- **Automaticamente**: Via scripts para testes de regressão
- **Durante demonstrações**: Para provar funcionalidade ao vivo
- **Integração**: Verificando como frontend e backend se comunicam

Para mais informações sobre a arquitetura, consulte [ARCHITECTURE.md](./ARCHITECTURE.md).
Para testes de microserviços, consulte [MICROSERVICES_TESTING.md](./MICROSERVICES_TESTING.md).
