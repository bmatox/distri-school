# ====================================
# DistriSchool - Clean Setup Script
# PowerShell Script to Clean Minikube Environment
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

# ====================================
# Header
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Info "DistriSchool - Clean Setup Script"
Write-Info "======================================"
Write-Info ""
Write-Warning "⚠️  Este script irá:"
Write-Warning "   1. Remover todos os recursos do Kubernetes"
Write-Warning "   2. Deletar completamente o cluster Minikube"
Write-Warning "   3. Limpar todo o ambiente DistriSchool"
Write-Info ""

# Ask for confirmation
$confirmation = Read-Host "Tem certeza que deseja continuar? (S/N)"
if ($confirmation -ne "S" -and $confirmation -ne "s") {
    Write-Info "Operação cancelada pelo usuário."
    exit 0
}

# ====================================
# Step 1: Check Prerequisites
# ====================================
Write-Info ""
Write-Info "Verificando pré-requisitos..."

if (-not (Test-Command "minikube")) {
    Write-Error "❌ Minikube não está instalado ou não está no PATH."
    Write-Error "Não é possível executar a limpeza sem o Minikube instalado."
    exit 1
}

if (-not (Test-Command "kubectl")) {
    Write-Warning "⚠️  kubectl não está instalado ou não está no PATH."
    Write-Warning "Continuando apenas com a limpeza do Minikube..."
}

Write-Success "✅ Pré-requisitos verificados."

# ====================================
# Step 2: Check Minikube Status
# ====================================
Write-Info ""
Write-Info "Verificando status do Minikube..."

$minikubeStatus = minikube status --format='{{.Host}}' 2>&1

if ($minikubeStatus -eq "Running" -and (Test-Command "kubectl")) {
    Write-Info ""
    Write-Info "🗑️  Removendo recursos do Kubernetes antes de deletar o Minikube..."
    Write-Info ""
    
    # Remove Ingress if exists
    Write-Info "Removendo Ingress..."
    kubectl delete -f k8s-manifests/ingress.yaml --ignore-not-found=true 2>&1 | Out-Null
    
    # Remove Frontend
    Write-Info "Removendo Frontend..."
    kubectl delete -f k8s-manifests/frontend/ --ignore-not-found=true 2>&1 | Out-Null
    
    # Remove API Gateway
    Write-Info "Removendo API Gateway..."
    kubectl delete -f k8s-manifests/api-gateway/ --ignore-not-found=true 2>&1 | Out-Null
    
    # Remove Backend Services
    Write-Info "Removendo Backend Services..."
    kubectl delete -f k8s-manifests/user-service/ --ignore-not-found=true 2>&1 | Out-Null
    kubectl delete -f k8s-manifests/aluno-service/ --ignore-not-found=true 2>&1 | Out-Null
    kubectl delete -f k8s-manifests/professor-service/ --ignore-not-found=true 2>&1 | Out-Null
    
    # Remove Infrastructure
    Write-Info "Removendo Infrastructure (RabbitMQ e PostgreSQL)..."
    kubectl delete -f k8s-manifests/rabbitmq/ --ignore-not-found=true 2>&1 | Out-Null
    kubectl delete -f k8s-manifests/postgres/ --ignore-not-found=true 2>&1 | Out-Null
    
    Write-Success "✅ Recursos do Kubernetes removidos."
    
    # Wait a bit for resources to be deleted
    Write-Info ""
    Write-Info "⏳ Aguardando finalização da remoção dos recursos (10 segundos)..."
    Start-Sleep -Seconds 10
}
elseif ($minikubeStatus -ne "Running") {
    Write-Info "ℹ️  Minikube não está rodando. Pulando remoção de recursos Kubernetes."
}

# ====================================
# Step 3: Delete Minikube
# ====================================
Write-Info ""
Write-Info "🗑️  Deletando o cluster Minikube..."

try {
    minikube delete
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao deletar o Minikube"
    }
    Write-Success "✅ Cluster Minikube deletado com sucesso!"
}
catch {
    Write-Error "❌ Erro ao deletar o Minikube: $_"
    Write-Warning "Tente deletar manualmente com: minikube delete"
    exit 1
}

# ====================================
# Step 4: Clean Docker Images (Optional)
# ====================================
Write-Info ""
$cleanDocker = Read-Host "Deseja remover as imagens Docker do DistriSchool? (S/N)"

if ($cleanDocker -eq "S" -or $cleanDocker -eq "s") {
    if (Test-Command "docker") {
        Write-Info ""
        Write-Info "🗑️  Removendo imagens Docker do DistriSchool..."
        
        $images = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "distrischool"
        
        if ($images) {
            foreach ($image in $images) {
                Write-Info "   Removendo $image..."
                docker rmi $image -f 2>&1 | Out-Null
            }
            Write-Success "✅ Imagens Docker removidas."
        }
        else {
            Write-Info "ℹ️  Nenhuma imagem DistriSchool encontrada."
        }
    }
    else {
        Write-Warning "⚠️  Docker não está disponível. Pulando limpeza de imagens."
    }
}
else {
    Write-Info "ℹ️  Imagens Docker mantidas."
}

# ====================================
# Final Message
# ====================================
Write-Info ""
Write-Info "======================================"
Write-Success "✅ Limpeza Concluída!"
Write-Info "======================================"
Write-Info ""
Write-Info "O ambiente DistriSchool foi completamente limpo."
Write-Info ""
Write-Info "Próximos passos:"
Write-Info "  1. Execute o script full-deploy.ps1 para recriar o ambiente"
Write-Host "     .\full-deploy.ps1" -ForegroundColor Yellow
Write-Info ""
Write-Info "  2. Ou inicie o Minikube manualmente:"
Write-Host "     minikube start --cpus=4 --memory=8192 --driver=docker" -ForegroundColor Yellow
Write-Info ""
