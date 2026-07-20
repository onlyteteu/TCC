$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$launcherPath = Join-Path $root "start.ps1"
$launcher = Get-Content -LiteralPath $launcherPath -Raw
$tokens = $null
$parseErrors = $null
[System.Management.Automation.Language.Parser]::ParseFile(
    $launcherPath,
    [ref]$tokens,
    [ref]$parseErrors
) | Out-Null

$failures = New-Object System.Collections.Generic.List[string]

if ($parseErrors.Count -gt 0) {
    $failures.Add("start.ps1 possui erros de sintaxe: $($parseErrors[0].Message)")
}

$contracts = @(
    @('\$BackendPort\s*=\s*8000', 'BackendPort deve ser 8000.'),
    @('\$FrontendPort\s*=\s*3001', 'FrontendPort deve ser 3001.'),
    @('\$BackendApiBaseUrl\s*=\s*"http://127\.0\.0\.1:\$BackendPort/api"', 'A URL do backend deve terminar em /api.'),
    @('Get-NetTCPConnection[^\r\n]+\$FrontendPort', 'O listener do frontend deve usar FrontendPort.'),
    @('\$env:BACKEND_API_BASE_URL\s*=\s*''\$BackendApiBaseUrl''', 'O processo do Next deve herdar BACKEND_API_BASE_URL.'),
    @('Start-Process\s+"http://127\.0\.0\.1:\$FrontendPort"', 'O navegador deve abrir a porta configurada.')
)

foreach ($contract in $contracts) {
    if ($launcher -notmatch $contract[0]) {
        $failures.Add($contract[1])
    }
}

if ($failures.Count -gt 0) {
    Write-Host "Launcher invalido:" -ForegroundColor Red
    foreach ($failure in $failures) {
        Write-Host " - $failure" -ForegroundColor Red
    }
    exit 1
}

Write-Host "Launcher valido: backend 8000, frontend 3001 e proxy /api." -ForegroundColor Green
