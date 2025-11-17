# DistriSchool - k6 Load Testing Automation Script
# This script runs k6 load tests using Docker against the DistriSchool system

param(
    [string]$BaseUrl = "",
    [string]$AdminEmail = "admin@distrischool.com",
    [string]$AdminPassword = "admin123",
    [switch]$Help
)

# Display help
if ($Help) {
    Write-Host ""
    Write-Host "DistriSchool - k6 Load Testing Script" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\run-load-test.ps1 [options]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Green
    Write-Host "  -BaseUrl <url>          Base URL for the application (default: auto-detect)"
    Write-Host "  -AdminEmail <email>     Admin email for authentication (default: admin@distrischool.com)"
    Write-Host "  -AdminPassword <pass>   Admin password (default: admin123)"
    Write-Host "  -Help                   Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\run-load-test.ps1"
    Write-Host "  .\run-load-test.ps1 -BaseUrl http://distrischool.local"
    Write-Host "  .\run-load-test.ps1 -BaseUrl http://192.168.49.2"
    Write-Host ""
    Write-Host "Notes:" -ForegroundColor Yellow
    Write-Host "  - Docker must be running"
    Write-Host "  - DistriSchool system must be deployed and accessible"
    Write-Host "  - Grafana dashboard available at http://localhost:30030 (admin/admin)"
    Write-Host "  - Prometheus available at http://localhost:30090"
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         DistriSchool - k6 Load Testing                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/5] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker is not running. Please start Docker and try again." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not accessible." -ForegroundColor Red
    exit 1
}

# Check if k6 Docker image is available
Write-Host ""
Write-Host "[2/5] Checking k6 Docker image..." -ForegroundColor Yellow
$k6Image = docker images grafana/k6 -q 2>&1
if (-not $k6Image) {
    Write-Host "✓ Pulling k6 Docker image (first time only)..." -ForegroundColor Yellow
    docker pull grafana/k6:latest
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to pull k6 Docker image." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ k6 image ready" -ForegroundColor Green
} else {
    Write-Host "✓ k6 image already available" -ForegroundColor Green
}

# Determine base URL
Write-Host ""
Write-Host "[3/5] Determining target URL..." -ForegroundColor Yellow
if ($BaseUrl -eq "") {
    # Try to detect Minikube IP
    try {
        $minikubeStatus = minikube status 2>&1
        if ($LASTEXITCODE -eq 0) {
            $minikubeIp = minikube ip 2>&1
            if ($LASTEXITCODE -eq 0 -and $minikubeIp) {
                # For Windows, Docker containers can access host network via special DNS names
                # We'll try host.docker.internal first, then the Minikube IP
                Write-Host "✓ Minikube detected at IP: $minikubeIp" -ForegroundColor Green
                Write-Host "  Testing connectivity..." -ForegroundColor Yellow
                
                # Test with host.docker.internal (works when ingress is accessible from host)
                $testUrl = "http://host.docker.internal"
                Write-Host "  Trying: $testUrl" -ForegroundColor Gray
                
                # If host.docker.internal doesn't work, we'll use the Minikube IP directly
                $BaseUrl = "http://$minikubeIp"
                Write-Host "✓ Will use: $BaseUrl" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "⚠ Could not detect Minikube IP" -ForegroundColor Yellow
    }
    
    if ($BaseUrl -eq "") {
        Write-Host "⚠ Using default: http://distrischool.local" -ForegroundColor Yellow
        Write-Host "  If tests fail, specify the correct URL with -BaseUrl parameter" -ForegroundColor Gray
        $BaseUrl = "http://distrischool.local"
    }
} else {
    Write-Host "✓ Using provided URL: $BaseUrl" -ForegroundColor Green
}

# Check if load test script exists
Write-Host ""
Write-Host "[4/5] Validating test scripts..." -ForegroundColor Yellow
$scriptPath = Join-Path $PSScriptRoot "tests\k6\load-test.js"
if (-not (Test-Path $scriptPath)) {
    Write-Host "✗ Load test script not found at: $scriptPath" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Test script found" -ForegroundColor Green

# Display test configuration
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Test Configuration:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Target URL:       $BaseUrl" -ForegroundColor White
Write-Host "  Admin Email:      $AdminEmail" -ForegroundColor White
Write-Host "  Test Script:      tests/k6/load-test.js" -ForegroundColor White
Write-Host ""
Write-Host "Load Profile:" -ForegroundColor Cyan
Write-Host "  Stage 1: Ramp-up   → 0 to 50 VUs in 30s" -ForegroundColor White
Write-Host "  Stage 2: Sustain   → 50 VUs for 1 minute" -ForegroundColor White
Write-Host "  Stage 3: Stress    → 50 to 200 VUs in 30s" -ForegroundColor White
Write-Host "  Stage 4: Cool-down → 200 to 0 VUs in 30s" -ForegroundColor White
Write-Host ""
Write-Host "Total Duration: ~2.5 minutes" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Confirm before starting
Write-Host ""
Write-Host "Monitoring Dashboards:" -ForegroundColor Green
Write-Host "  Grafana:    http://localhost:30030 (admin/admin)" -ForegroundColor Gray
Write-Host "  Prometheus: http://localhost:30090" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠ Make sure to open Grafana BEFORE starting the test!" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Ready to start load test? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Load test cancelled." -ForegroundColor Yellow
    exit 0
}

# Run the load test
Write-Host ""
Write-Host "[5/5] Starting k6 load test..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Construct the Docker command
$testsDir = Join-Path $PSScriptRoot "tests\k6"

# Run k6 with Docker
# Note: We use --add-host to map distrischool.local to the Minikube IP if needed
$dockerCmd = @(
    "run"
    "--rm"
    "-i"
    "-v"
    "${testsDir}:/scripts"
    "-e"
    "BASE_URL=$BaseUrl"
    "-e"
    "ADMIN_EMAIL=$AdminEmail"
    "-e"
    "ADMIN_PASSWORD=$AdminPassword"
)

# If using distrischool.local, add host mapping
if ($BaseUrl -like "*distrischool.local*") {
    try {
        $minikubeIp = minikube ip 2>&1
        if ($LASTEXITCODE -eq 0 -and $minikubeIp) {
            $dockerCmd += "--add-host"
            $dockerCmd += "distrischool.local:$minikubeIp"
            Write-Host "✓ Added host mapping: distrischool.local -> $minikubeIp" -ForegroundColor Green
            Write-Host ""
        }
    } catch {
        Write-Host "⚠ Could not add host mapping, test may fail if DNS is not configured" -ForegroundColor Yellow
        Write-Host ""
    }
}

$dockerCmd += "grafana/k6"
$dockerCmd += "run"
$dockerCmd += "/scripts/load-test.js"

# Execute the command
& docker $dockerCmd

# Check result
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Load test completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Review metrics in Grafana: http://localhost:30030" -ForegroundColor White
    Write-Host "  2. Check Prometheus for raw data: http://localhost:30090" -ForegroundColor White
    Write-Host "  3. Analyze response times, error rates, and system behavior" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Load test failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify DistriSchool is running: kubectl get pods" -ForegroundColor White
    Write-Host "  2. Check if services are accessible: kubectl get svc" -ForegroundColor White
    Write-Host "  3. Verify ingress: kubectl get ingress" -ForegroundColor White
    Write-Host "  4. Try with explicit IP: .\run-load-test.ps1 -BaseUrl http://<minikube-ip>" -ForegroundColor White
    Write-Host ""
    exit 1
}
