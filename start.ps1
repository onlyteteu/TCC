# ============================================================
#  Startup Quest (TCC) - liga tudo e abre o localhost
#  Sobe: Docker Desktop -> PostgreSQL -> Backend Django -> Frontend Next.js
# ============================================================

# Nao usar "Stop" global: comandos nativos (docker) escrevem no stderr sem
# realmente falhar, e no PowerShell 5.1 isso viraria erro terminante.
$ErrorActionPreference = "Continue"

# Raiz do repositorio = pasta onde este script esta
$Root      = $PSScriptRoot
$Backend   = Join-Path $Root "apps\backend"
$Frontend  = Join-Path $Root "apps\frontend"
$Compose   = Join-Path $Root "docker-compose.yml"
$VenvPy    = Join-Path $Backend ".venv\Scripts\python.exe"
$NodeDir   = "C:\Program Files\nodejs"

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    [ok] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    [..] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "    [X] $msg" -ForegroundColor Red }

# Retorna $true se o daemon do Docker responder (usa o codigo de saida, nao o stderr)
function Test-DockerUp {
    docker info 2>$null 1>$null
    return ($LASTEXITCODE -eq 0)
}

# Garante que o node esta no PATH desta execucao
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    if (Test-Path (Join-Path $NodeDir "node.exe")) {
        $env:Path = "$NodeDir;$env:Path"
    }
}

# ------------------------------------------------------------
# 1) Docker Desktop + daemon
# ------------------------------------------------------------
Write-Step "Verificando o Docker..."
if (-not (Test-DockerUp)) {
    Write-Warn "Docker nao esta rodando. Iniciando o Docker Desktop..."
    $dd = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dd) { Start-Process $dd } else { Write-Err "Docker Desktop nao encontrado em $dd"; exit 1 }

    Write-Warn "Aguardando o motor do Docker subir (pode levar 1-2 min na 1a vez)..."
    $deadline = (Get-Date).AddMinutes(5)
    while ((Get-Date) -lt $deadline) {
        if (Test-DockerUp) { break }
        Start-Sleep -Seconds 6
    }
    if (-not (Test-DockerUp)) {
        Write-Err "O Docker nao subiu a tempo. Abra o Docker Desktop, aceite os termos (Accept) e rode de novo."
        exit 1
    }
}
Write-Ok "Docker rodando."

# ------------------------------------------------------------
# 2) PostgreSQL (container)
# ------------------------------------------------------------
Write-Step "Subindo o PostgreSQL..."
docker compose -f $Compose up -d postgres | Out-Null

Write-Warn "Aguardando o banco ficar saudavel (healthy)..."
$deadline = (Get-Date).AddMinutes(2)
while ((Get-Date) -lt $deadline) {
    $status = (docker inspect --format '{{.State.Health.Status}}' tcc-postgres 2>$null)
    if ($status -eq "healthy") { break }
    Start-Sleep -Seconds 3
}
Write-Ok "PostgreSQL pronto."

# ------------------------------------------------------------
# 3) Backend Django (migrations + servidor em janela propria)
# ------------------------------------------------------------
Write-Step "Aplicando migrations do backend..."
& $VenvPy (Join-Path $Backend "manage.py") migrate | Out-Null
Write-Ok "Migrations aplicadas."

Write-Step "Ligando o backend Django (janela propria, porta 8000)..."
Start-Process powershell -ArgumentList @(
    "-NoExit","-Command",
    "cd '$Backend'; Write-Host 'BACKEND - Startup Quest (http://127.0.0.1:8000)' -ForegroundColor Green; & '$VenvPy' manage.py runserver 127.0.0.1:8000"
)

# ------------------------------------------------------------
# 4) Frontend Next.js (janela propria)
# ------------------------------------------------------------
Write-Step "Ligando o frontend Next.js (janela propria, porta 3000)..."
Start-Process powershell -ArgumentList @(
    "-NoExit","-Command",
    "`$env:Path = '$NodeDir;' + `$env:Path; cd '$Frontend'; Write-Host 'FRONTEND - Startup Quest (http://127.0.0.1:3000)' -ForegroundColor Green; npm run dev"
)

# ------------------------------------------------------------
# 5) Esperar o frontend responder e abrir o navegador
# ------------------------------------------------------------
Write-Step "Aguardando o frontend responder em http://127.0.0.1:3000 ..."
$deadline = (Get-Date).AddMinutes(3)
$up = $false
while ((Get-Date) -lt $deadline) {
    try {
        $r = Invoke-WebRequest "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 5
        if ($r.StatusCode -eq 200) { $up = $true; break }
    } catch { }
    Start-Sleep -Seconds 3
}

if ($up) {
    Write-Ok "Frontend no ar. Abrindo o navegador..."
    Start-Process "http://127.0.0.1:3000"
} else {
    Write-Warn "O frontend demorou a responder. Abra manualmente: http://127.0.0.1:3000 (a janela do frontend ainda esta compilando)."
    Start-Process "http://127.0.0.1:3000"
}

Write-Host "`nTudo ligado! " -ForegroundColor Green -NoNewline
Write-Host "Frontend: http://127.0.0.1:3000  |  Backend: http://127.0.0.1:8000/api/health/"
Write-Host "As janelas do backend e do frontend ficam abertas com os logs. Feche-as para parar os servidores." -ForegroundColor DarkGray
