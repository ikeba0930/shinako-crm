param(
  [string]$Message = "update"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

git add .

$status = git status --short
if (-not $status) {
  Write-Output "No changes to deploy."
  exit 0
}

git commit -m $Message
git push

Write-Output "Pushed to GitHub. Vercel should start a deployment automatically."
