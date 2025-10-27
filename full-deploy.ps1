# ====================================
# DistriSchool - Improved Full Deploy Script
# PowerShell Script for Complete Deployment
# ====================================

# Function to print colored messages
function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

# Function to check if a command exists
function Test-Command {
    param([string]$Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

function Wait-ForDeploymentReady {
    param(
        [string]$DeploymentName,
        [int]$TimeoutSeconds = 180
    )
    Write-Host "   -> Aguardando '$DeploymentName' (Máx $TimeoutSeconds s)..." -ForegroundColor Cyan

    kubectl rollout status deployment/$DeploymentName --timeout="$($TimeoutSeconds)s"

    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ $DeploymentName falhou ou atingiu o timeout. Verifique logs."
        exit 1
    }
}

# ====================================
# Header
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "DistriSchool - Improved Full Deploy"
Write-Info "======================================"
Write-Info ""

# ====================================
# Step 1: Check Prerequisites
# ====================================
Write-Info "Verificando pré-requisitos..."

if (-not (Test-Command "minikube")) {
    Write-Error "❌ Minikube não está instalado ou não está no PATH."
    Write-Error "Por favor, instale o Minikube: https://minikube.sigs.k8s.io/docs/start/"
    exit 1
}

if (-not (Test-Command "kubectl")) {
    Write-Error "❌ kubectl não está instalado ou não está no PATH."
    Write-Error "Por favor, instale o kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
}

if (-not (Test-Command "docker")) {
    Write-Error "❌ Docker não está instalado ou não está no PATH."
    Write-Error "Por favor, instale o Docker: https://www.docker.com/products/docker-desktop"
    exit 1
}

Write-Success "✅ Todos os pré-requisitos estão instalados."

# ====================================
# Step 2: Start Minikube with Configuration
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Configurando Minikube"
Write-Info "======================================"
Write-Info ""
Write-Info "Verificando status do Minikube..."

$minikubeStatus = minikube status --format='{{.Host}}' 2>&1

if ($minikubeStatus -ne "Running") {
    Write-Warning "⚠️  Minikube não está rodando."
    Write-Info "Iniciando Minikube com as seguintes configurações:"
    Write-Info "  - CPUs: 4"
    Write-Info "  - Memória: 8192 MB (8 GB)"
    Write-Info "  - Driver: docker"
    Write-Info ""
    Write-Info "Isso pode levar alguns minutos..."

    try {
        minikube start --cpus=4 --memory=8192 --driver=docker
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao iniciar o Minikube"
        }
        Write-Success "✅ Minikube iniciado com sucesso!"
    }
    catch {
        Write-Error "❌ Erro ao iniciar o Minikube: $_"
        Write-Error "Tente iniciar manualmente com: minikube start --cpus=4 --memory=8192 --driver=docker"
        exit 1
    }
}
else {
    Write-Success "✅ Minikube já está rodando."
}

# ====================================
# Step 3: Enable and Configure Ingress
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Configurando Ingress"
Write-Info "======================================"
Write-Info ""
Write-Info "Habilitando addon Ingress do Minikube..."

try {
    minikube addons enable ingress
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao habilitar ingress"
    }
    Write-Success "✅ Addon Ingress habilitado."
}
catch {
    Write-Error "❌ Erro ao habilitar Ingress: $_"
    exit 1
}

Write-Info ""
Write-Info "Aguardando Ingress Controller iniciar..."
Start-Sleep -Seconds 10

Write-Info "Verificando se Ingress Controller está pronto..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx --timeout=120s 2>&1 | Out-Null

Write-Info ""
Write-Info "🔧 Configurando Ingress Controller como LoadBalancer..."
try {
    # Patch the ingress-nginx-controller service to LoadBalancer type
    kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{\"spec\":{\"type\":\"LoadBalancer\"}}'
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao configurar LoadBalancer"
    }
    Write-Success "✅ Ingress Controller configurado como LoadBalancer."
}
catch {
    Write-Error "❌ Erro ao configurar LoadBalancer: $_"
    exit 1
}

Write-Info ""
Write-Info "Aguardando LoadBalancer configurar..."
Start-Sleep -Seconds 5

# Verify LoadBalancer configuration
$ingressSvc = kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.type}'
if ($ingressSvc -ne "LoadBalancer") {
    Write-Error "❌ Falha: Ingress não está como LoadBalancer (está como: $ingressSvc)"
    Write-Warning "Tentando resolver manualmente..."
    kubectl edit svc ingress-nginx-controller -n ingress-nginx
}
else {
    Write-Success "✅ Ingress está como LoadBalancer."
}

# ====================================
# Step 4: Configure Docker Environment
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Configurando Docker"
Write-Info "======================================"
Write-Info ""
Write-Info "Configurando ambiente Docker para usar o daemon do Minikube..."

try {
    & minikube -p minikube docker-env --shell powershell | Invoke-Expression
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao configurar o ambiente Docker"
    }
    Write-Success "✅ Ambiente Docker configurado para Minikube."
}
catch {
    Write-Error "❌ Erro ao configurar ambiente Docker: $_"
    exit 1
}

# ====================================
# Step 5: Build Docker Images
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Construindo Imagens Docker"
Write-Info "======================================"
Write-Info ""

# Save the root directory
$rootDir = Get-Location

# Function to build Docker image
function Build-DockerImage {
    param(
        [string]$ServiceName,
        [string]$FolderPath,
        [string]$ImageTag,
        [string]$Emoji
    )

    Write-Info ""
    Write-Info "$Emoji Building $ServiceName..."

    if ($FolderPath -ne ".") {
        try {
            Set-Location $FolderPath
        }
        catch {
            Write-Error "❌ Erro ao navegar para $FolderPath"
            Set-Location $rootDir
            return $false
        }
    }

    if (-not (Test-Path "Dockerfile")) {
        Write-Error "❌ Dockerfile não encontrado em $(Get-Location)"
        Set-Location $rootDir
        return $false
    }

    try {
        docker build -t $ImageTag .
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build falhou"
        }
        Write-Success "✅ $ServiceName construído com sucesso!"

        if ($FolderPath -ne ".") {
            Set-Location $rootDir
        }
        return $true
    }
    catch {
        Write-Error "❌ Erro ao construir $ServiceName : $_"
        if ($FolderPath -ne ".") {
            Set-Location $rootDir
        }
        return $false
    }
}

# Build all services
$buildSuccess = $true

if (-not (Build-DockerImage -ServiceName "Professor Service" -FolderPath "." -ImageTag "distrischool-professor-tecadm-service:latest" -Emoji "📚")) {
    $buildSuccess = $false
}

if (-not (Build-DockerImage -ServiceName "Aluno Service" -FolderPath ".\Distrischool-aluno-main" -ImageTag "distrischool-aluno-service:latest" -Emoji "👨‍🎓")) {
    $buildSuccess = $false
}

if (-not (Build-DockerImage -ServiceName "User Service" -FolderPath ".\distrischool-user-service-main\user-service" -ImageTag "distrischool-user-service:latest" -Emoji "👤")) {
    $buildSuccess = $false
}

if (-not (Build-DockerImage -ServiceName "API Gateway" -FolderPath ".\api-gateway" -ImageTag "distrischool-api-gateway:latest" -Emoji "🌐")) {
    $buildSuccess = $false
}

if (-not (Build-DockerImage -ServiceName "Frontend" -FolderPath ".\frontend" -ImageTag "distrischool-frontend:latest" -Emoji "💻")) {
    $buildSuccess = $false
}

Set-Location $rootDir

if (-not $buildSuccess) {
    Write-Error ""
    Write-Error "❌ Alguns builds falharam. Por favor, verifique os erros acima."
    exit 1
}

Write-Success ""
Write-Success "✅ Todas as imagens foram construídas com sucesso!"

Write-Info ""
Write-Info "Imagens disponíveis:"
docker images | Select-String "distrischool"

# ====================================
# Step 6: Deploy Infrastructure
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Deploy - Infraestrutura"
Write-Info "======================================"
Write-Info ""

Write-Info "🐘 Aplicando PostgreSQL..."
try {
    kubectl apply -f k8s-manifests/postgres/
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao aplicar manifests do PostgreSQL"
    }
    Write-Success "✅ PostgreSQL aplicado."
}
catch {
    Write-Error "❌ Erro ao aplicar PostgreSQL: $_"
    exit 1
}

Write-Info ""
Write-Info "🐰 Aplicando RabbitMQ..."
try {
    kubectl apply -f k8s-manifests/rabbitmq/
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao aplicar manifests do RabbitMQ"
    }
    Write-Success "✅ RabbitMQ aplicado."
}
catch {
    Write-Error "❌ Erro ao aplicar RabbitMQ: $_"
    exit 1
}

Write-Info ""
Write-Info "⏳ Aguardando infraestrutura ficar pronta..."
Write-Info "   Aguardando PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s 2>&1 | Out-Null
Write-Info "   Aguardando RabbitMQ..."
kubectl wait --for=condition=ready pod -l app=rabbitmq --timeout=120s 2>&1 | Out-Null
Write-Success "✅ Infraestrutura pronta!"

# ====================================
# Step 7: Deploy Backend Services
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Deploy - Backend Services"
Write-Info "======================================"
Write-Info ""

Write-Info "📚 Aplicando Professor Service..."
kubectl apply -f k8s-manifests/professor-service/

Write-Info ""
Write-Info "👨‍🎓 Aplicando Aluno Service..."
kubectl apply -f k8s-manifests/aluno-service/

Write-Info ""
Write-Info "👤 Aplicando User Service..."
kubectl apply -f k8s-manifests/user-service/

Write-Info ""
Write-Info "🌐 Aplicando API Gateway..."
kubectl apply -f k8s-manifests/api-gateway/

Write-Info ""
Write-Info "⏳ Aguardando backend services ficarem prontos..."
Wait-ForDeploymentReady -DeploymentName "professor-tecadm-deployment"
Wait-ForDeploymentReady -DeploymentName "aluno-deployment"
Wait-ForDeploymentReady -DeploymentName "user-deployment"
Wait-ForDeploymentReady -DeploymentName "api-gateway-deployment"
Write-Success "✅ Backend services prontos!"

# ====================================
# Step 8: Deploy Frontend
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Deploy - Frontend"
Write-Info "======================================"
Write-Info ""

Write-Info "💻 Aplicando Frontend..."
kubectl apply -f k8s-manifests/frontend/

Write-Info ""
Write-Info "⏳ Aguardando Frontend ficar pronto..."
Wait-ForDeploymentReady -DeploymentName "frontend-deployment"
Write-Success "✅ Frontend pronto!"

# ====================================
# Step 9: Deploy Ingress
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Deploy - Ingress"
Write-Info "======================================"
Write-Info ""

Write-Info "🌐 Aplicando Ingress..."
try {
    kubectl apply -f k8s-manifests/ingress.yaml
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao aplicar Ingress"
    }
    Write-Success "✅ Ingress aplicado."
}
catch {
    Write-Error "❌ Erro ao aplicar Ingress: $_"
    exit 1
}

Write-Info ""
Write-Info "Aguardando Ingress sincronizar..."
Start-Sleep -Seconds 5

# ====================================
# Step 10: Configure Hosts File
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Configurando Arquivo Hosts"
Write-Info "======================================"
Write-Info ""

# Get the external IP from the LoadBalancer
Write-Info "Obtendo IP do LoadBalancer..."
$externalIp = kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

if ([string]::IsNullOrEmpty($externalIp)) {
    Write-Warning "⚠️  LoadBalancer ainda não tem IP externo."
    Write-Info "Usando 127.0.0.1 como padrão para Windows com minikube tunnel."
    $externalIp = "127.0.0.1"
}

Write-Info "IP do LoadBalancer: $externalIp"

Write-Info ""
Write-Info "Verificando se entrada já existe no arquivo hosts..."
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath
$hostsEntry = "$externalIp distrischool.local"

if ($hostsContent -match "distrischool.local") {
    Write-Warning "⚠️  Entrada 'distrischool.local' já existe no arquivo hosts."
    Write-Info "Removendo entrada antiga..."

    $hostsContent | Where-Object { $_ -notmatch "distrischool.local" } | Set-Content $hostsPath
    Write-Success "✅ Entrada antiga removida."
}

Write-Info "Adicionando nova entrada ao arquivo hosts..."
Add-Content -Path $hostsPath -Value "`n$hostsEntry"
Write-Success "✅ Arquivo hosts configurado: $hostsEntry"

Write-Info ""
Write-Info "Limpando cache DNS..."
ipconfig /flushdns | Out-Null
Write-Success "✅ Cache DNS limpo."

# ====================================
# Step 11: Test Connectivity
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Testando Conectividade"
Write-Info "======================================"
Write-Info ""

Write-Info "Testando conectividade com $externalIp..."
$pingTest = Test-Connection -ComputerName $externalIp -Count 2 -Quiet

if (-not $pingTest) {
    Write-Warning "⚠️  Ping falhou para $externalIp"
    Write-Warning "Isso é normal no Windows com Docker/Minikube."
}
else {
    Write-Success "✅ Ping bem-sucedido!"
}

# ====================================
# Step 12: Start Minikube Tunnel
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "⚠️  AÇÃO NECESSÁRIA"
Write-Info "======================================"
Write-Info ""

Write-Warning "⚠️  IMPORTANTE: O Minikube Tunnel precisa estar rodando!"
Write-Info ""
Write-Info "Para o Ingress funcionar, você DEVE:"
Write-Info ""
Write-Host "1. Abrir um NOVO PowerShell como ADMINISTRADOR" -ForegroundColor Yellow
Write-Host "2. Executar: minikube tunnel" -ForegroundColor Yellow
Write-Host "3. MANTER esse terminal aberto" -ForegroundColor Yellow
Write-Info ""
Write-Warning "O tunnel precisa ficar rodando em segundo plano enquanto usa o sistema!"
Write-Info ""

# Ask user if tunnel is running
Write-Host "Pressione ENTER depois de iniciar o 'minikube tunnel' em outro terminal..." -ForegroundColor Cyan
Read-Host

# ====================================
# Step 13: Final Validation
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "Validação Final"
Write-Info "======================================"
Write-Info ""

Write-Info "Aguardando sistema estabilizar (10 segundos)..."
Start-Sleep -Seconds 10

Write-Info ""
Write-Info "Status dos Pods:"
kubectl get pods -A

Write-Info ""
Write-Info "Status dos Serviços:"
kubectl get services

Write-Info ""
Write-Info "Status do Ingress:"
kubectl get ingress

Write-Info ""
Write-Info "Testando acesso ao frontend..."
try {
    $response = Invoke-WebRequest -Uri "http://distrischool.local" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Success "✅ Frontend está acessível!"
    }
}
catch {
    Write-Warning "⚠️  Não foi possível acessar o frontend automaticamente."
    Write-Info "Tente acessar manualmente: http://distrischool.local"
}

# ====================================
# Final Instructions
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Success "✅ Deploy Concluído!"
Write-Info "======================================"
Write-Info ""

Write-Success "🌐 URLs de Acesso:"
Write-Host "   Frontend: http://distrischool.local" -ForegroundColor Green
Write-Host "   API:      http://distrischool.local/api" -ForegroundColor Green
Write-Info ""

Write-Info "======================================"
Write-Info "Comandos Úteis"
Write-Info "======================================"
Write-Info ""

Write-Info "1. Ver status dos pods:"
Write-Host "   kubectl get pods -A" -ForegroundColor Yellow
Write-Info ""

Write-Info "2. Ver logs em tempo real:"
Write-Host "   kubectl logs -f deployment/api-gateway-deployment" -ForegroundColor Yellow
Write-Info ""

Write-Info "3. Acessar RabbitMQ Management:"
Write-Host "   minikube service rabbitmq-service --url" -ForegroundColor Yellow
Write-Info "   (Use a porta 15672, usuário: guest, senha: guest)"
Write-Info ""

Write-Info "4. Testar endpoint da API:"
Write-Host "   curl http://distrischool.local/api/v1/professores" -ForegroundColor Yellow
Write-Info ""

Write-Info "5. Parar o ambiente:"
Write-Host "   Ctrl+C no terminal do 'minikube tunnel'" -ForegroundColor Yellow
Write-Host "   minikube stop" -ForegroundColor Yellow
Write-Info ""

Write-Info "6. Limpar tudo:"
Write-Host "   .\clean-setup.ps1" -ForegroundColor Yellow
Write-Info ""

Write-Success "======================================"
Write-Success "Ambiente DistriSchool está pronto!"
Write-Success "======================================"
Write-Info ""

Write-Warning "⚠️  LEMBRE-SE: Mantenha o terminal com 'minikube tunnel' aberto!"
Write-Info ""