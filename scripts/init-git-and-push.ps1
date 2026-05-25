# Run from c:\webpage after creating empty GitHub repo
param(
    [Parameter(Mandatory = $true)]
    [string]$GitHubUsername,
    [string]$RepoName = "hilaz-hanger"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path ".git")) {
    git init
    git add .
    git commit -m "Initial commit — Hilaz Hanger ecommerce"
}

$remote = "https://github.com/$GitHubUsername/$RepoName.git"
$existing = git remote get-url origin 2>$null
if (-not $existing) {
    git remote add origin $remote
} else {
    git remote set-url origin $remote
}

git branch -M main
Write-Host ""
Write-Host "Remote: $remote" -ForegroundColor Cyan
Write-Host "Run: git push -u origin main" -ForegroundColor Green
Write-Host "Then follow DEPLOY-NOW.md for Render + Vercel" -ForegroundColor Yellow
