# Hilaz Hanger — install deps and start dev server
$ErrorActionPreference = "Stop"

$PortableNode = Join-Path (Split-Path $PSScriptRoot -Parent) "tools\node\node-v22.16.0-win-x64"
if (Test-Path $PortableNode) {
    $env:PATH = "$PortableNode;$env:PATH"
}

function Find-Npm {
    $candidates = @(
        "$PortableNode\npm.cmd",
        "$env:ProgramFiles\nodejs\npm.cmd",
        "${env:ProgramFiles(x86)}\nodejs\npm.cmd",
        "$env:LOCALAPPDATA\Programs\node\npm.cmd"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { return $c }
    }
    # Do NOT use Get-Command npm — PowerShell resolves to npm.ps1 (blocked by execution policy)
    return $null
}

$npm = Find-Npm
if (-not $npm) {
    Write-Host ""
    Write-Host "Node.js/npm not found." -ForegroundColor Red
    Write-Host "Install Node.js LTS: https://nodejs.org/ (check 'Add to PATH')"
    Write-Host "Or run in an elevated terminal:"
    Write-Host "  winget install OpenJS.NodeJS.LTS --source winget"
    Write-Host ""
    exit 1
}

Write-Host "Using npm: $npm" -ForegroundColor Green
Set-Location $PSScriptRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    & $npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Starting dev server at http://localhost:4200" -ForegroundColor Cyan
& $npm start
