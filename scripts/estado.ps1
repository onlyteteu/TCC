# Imprime o estado factual do projeto para a abertura de sessao.
# Uso, na raiz: .\scripts\estado.ps1

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
Push-Location $raiz

function Titulo([string]$texto) {
    Write-Host ''
    Write-Host ("== " + $texto) -ForegroundColor Cyan
}

function Secao([string]$conteudo, [string]$titulo) {
    $padrao = '(?ms)^##\s+' + [regex]::Escape($titulo) + '\s*\r?\n(.*?)(?=^##\s|\z)'
    $achado = [regex]::Match($conteudo, $padrao)
    if ($achado.Success) { return $achado.Groups[1].Value.Trim() }
    return '(secao nao encontrada no bastao)'
}

try {
    Titulo 'Repositorio'
    Write-Host ('branch: ' + (git rev-parse --abbrev-ref HEAD))
    $frente = (git rev-list --count '@{u}..HEAD' 2>$null)
    if ($frente) { Write-Host ('commits a frente do remoto: ' + $frente) }

    Titulo 'Ultimos commits'
    git log -5 --pretty='%h %ad %s' --date=short

    Titulo 'Alteracoes nao commitadas'
    $sujo = git status --short
    if ($sujo) { $sujo } else { Write-Host 'nenhuma' }

    $bastao = Join-Path $raiz 'Documentação\sessoes\HANDOFF.md'
    if (Test-Path -LiteralPath $bastao) {
        $texto = Get-Content -LiteralPath $bastao -Raw -Encoding UTF8

        Titulo 'Bastao: cabecalho'
        Write-Host (Secao $texto 'Cabeçalho')

        Titulo 'Bastao: onde parei'
        Write-Host (Secao $texto 'Onde parei exatamente')

        Titulo 'Bastao: proximo passo'
        Write-Host (Secao $texto 'Próximo passo')

        Titulo 'Bastao: pendencias para o Matheus'
        Write-Host (Secao $texto 'Pendências para o Matheus')

        Write-Host ''
        Write-Host 'Bastao completo em Documentação\sessoes\HANDOFF.md' -ForegroundColor DarkGray
    }
    else {
        Titulo 'Bastao'
        Write-Host 'HANDOFF.md nao encontrado.' -ForegroundColor Yellow
    }
}
finally {
    Pop-Location
}
