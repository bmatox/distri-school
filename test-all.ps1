#!/usr/bin/env pwsh
#Requires -Version 7

<#
.SYNOPSIS
    Executa todos os testes do monorepo DistriSchool (Backend e Frontend)
.DESCRIPTION
    Script de automação para rodar todos os testes de microsserviços e frontend.
    Utiliza fail-fast: para na primeira falha encontrada.
.NOTES
    Autor: DistriSchool Team
    Data: 2025-11-23
#>

# Configuração de cores
$SuccessColor = "Green"
$ErrorColor = "Red"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

# Configuração de encoding para PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Lista de microsserviços backend (que usam Maven)
$backendServices = @(
    "distrischool-aluno-main",
    "distrischool-user-service-main/user-service",
    "professor-service",
    "grades-service",
    "communication-service"
)

# Contador de sucessos
$totalTests = 0
$successfulTests = 0

function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Section {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host ("=" * 80) -ForegroundColor $InfoColor
    Write-Host " $Title" -ForegroundColor $InfoColor
    Write-Host ("=" * 80) -ForegroundColor $InfoColor
}

function Test-BackendService {
    param(
        [string]$ServicePath
    )
    
    $serviceName = Split-Path $ServicePath -Leaf
    Write-Section "Testando Backend: $serviceName"
    
    $fullPath = Join-Path $PSScriptRoot $ServicePath
    
    if (-not (Test-Path $fullPath)) {
        Write-ColorMessage "⚠️  Serviço não encontrado: $fullPath" $WarningColor
        return $true
    }
    
    Push-Location $fullPath
    
    try {
        Write-ColorMessage "📂 Diretório: $fullPath" $InfoColor
        Write-ColorMessage "🔨 Executando: .\mvnw.cmd clean test" $InfoColor
        
        # Executa Maven com output em tempo real
        $mvnProcess = Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "clean", "test" -NoNewWindow -Wait -PassThru
        
        if ($mvnProcess.ExitCode -eq 0) {
            Write-ColorMessage "✅ Testes de $serviceName PASSARAM com sucesso!" $SuccessColor
            return $true
        } else {
            Write-ColorMessage "❌ FALHA nos testes de $serviceName (Exit Code: $($mvnProcess.ExitCode))" $ErrorColor
            return $false
        }
    }
    catch {
        Write-ColorMessage "❌ ERRO ao executar testes de $serviceName : $_" $ErrorColor
        return $false
    }
    finally {
        Pop-Location
    }
}

function Test-Frontend {
    Write-Section "Testando Frontend (React)"
    
    $frontendPath = Join-Path $PSScriptRoot "frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-ColorMessage "⚠️  Frontend não encontrado: $frontendPath" $WarningColor
        return $true
    }
    
    Push-Location $frontendPath
    
    try {
        Write-ColorMessage "📂 Diretório: $frontendPath" $InfoColor
        
        # Verifica se node_modules existe
        if (-not (Test-Path "node_modules")) {
            Write-ColorMessage "📦 Instalando dependências do frontend..." $InfoColor
            # Use cmd /c for npm to avoid PowerShell on Windows invocation issues
            cmd /c "npm install --legacy-peer-deps"
            if ($LASTEXITCODE -ne 0) {
                Write-ColorMessage "❌ FALHA ao instalar dependências do frontend" $ErrorColor
                return $false
            }
        }
        
        Write-ColorMessage "🔨 Executando: npm test -- --run" $InfoColor
        
        # Executa testes do frontend
        # Use cmd /c for npm to avoid PowerShell on Windows invocation issues
        cmd /c "npm test -- --run"
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorMessage "✅ Testes do Frontend PASSARAM com sucesso!" $SuccessColor
            return $true
        } else {
            Write-ColorMessage "❌ FALHA nos testes do Frontend (Exit Code: $LASTEXITCODE)" $ErrorColor
            return $false
        }
    }
    catch {
        Write-ColorMessage "❌ ERRO ao executar testes do Frontend: $_" $ErrorColor
        return $false
    }
    finally {
        Pop-Location
    }
}

# ============================================================================
# INÍCIO DA EXECUÇÃO
# ============================================================================

Write-Section "🚀 INICIANDO BATERIA COMPLETA DE TESTES - DistriSchool"
Write-ColorMessage "Monorepo: $PSScriptRoot" $InfoColor
Write-ColorMessage "Data/Hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $InfoColor

$startTime = Get-Date

# ============================================================================
# TESTES DE BACKEND
# ============================================================================

foreach ($service in $backendServices) {
    $totalTests++
    $result = Test-BackendService -ServicePath $service
    
    if ($result) {
        $successfulTests++
    } else {
        # Fail-Fast: Para na primeira falha
        Write-ColorMessage "`n❌ ABORTANDO: Falha detectada em $service" $ErrorColor
        Write-ColorMessage "Os testes foram interrompidos para correção imediata." $ErrorColor
        exit 1
    }
}

# ============================================================================
# TESTES DE FRONTEND
# ============================================================================

$totalTests++
$frontendResult = Test-Frontend

if ($frontendResult) {
    $successfulTests++
} else {
    # Fail-Fast: Para na falha do frontend
    Write-ColorMessage "`n❌ ABORTANDO: Falha detectada no Frontend" $ErrorColor
    Write-ColorMessage "Os testes foram interrompidos para correção imediata." $ErrorColor
    exit 1
}

# ============================================================================
# RELATÓRIO FINAL
# ============================================================================

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Section "📊 RELATÓRIO FINAL"
Write-ColorMessage "Total de Serviços Testados: $totalTests" $InfoColor
Write-ColorMessage "Testes Bem-Sucedidos: $successfulTests" $SuccessColor
Write-ColorMessage "Tempo Total: $($duration.ToString('mm\:ss'))" $InfoColor

if ($successfulTests -eq $totalTests) {
    Write-Host "`n"
    Write-Host ("*" * 80) -ForegroundColor $SuccessColor
    Write-Host " ✅ SUCESSO TOTAL! Todos os testes passaram com êxito!" -ForegroundColor $SuccessColor
    Write-Host ("*" * 80) -ForegroundColor $SuccessColor
    Write-Host "`n"
    exit 0
} else {
    Write-ColorMessage "`n❌ FALHA: Nem todos os testes passaram." $ErrorColor
    exit 1
}
