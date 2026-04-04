param(
  [int]$Port = 3000,
  [switch]$Background
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

function Get-FnmExecutable {
  $candidates = @(
    (Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe\fnm.exe"),
    (Join-Path $env:APPDATA "fnm\fnm.exe")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $null
}

function Test-HttpReady {
  param(
    [int]$TargetPort
  )

  try {
    $response = Invoke-WebRequest -Uri "http://localhost:$TargetPort/dashboard" -UseBasicParsing -TimeoutSec 3
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  }
  catch {
    return $false
  }
}

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty OwningProcess

if ($existing) {
  if (Test-HttpReady -TargetPort $Port) {
    Write-Output "Dev server is already responding on http://localhost:$Port/dashboard (PID $existing)."
    exit 0
  }

  Write-Output "Port $Port is occupied by an unresponsive process. Stopping PID $existing."
  Stop-Process -Id $existing -Force
  Start-Sleep -Seconds 1
}

$logPath = Join-Path $projectRoot ".next-dev.log"
$errorLogPath = Join-Path $projectRoot ".next-dev.err.log"
$nvmrcPath = Join-Path $projectRoot ".nvmrc"
$fnmExe = Get-FnmExecutable
$env:PORT = "$Port"

if ($fnmExe -and (Test-Path $nvmrcPath)) {
  $filePath = $fnmExe
  $argumentList = @("exec", "--using", $nvmrcPath, "npm.cmd", "run", "dev")
}
else {
  $filePath = "npm.cmd"
  $argumentList = @("run", "dev")
}

if ($Background) {
  $process = Start-Process -FilePath $filePath -ArgumentList $argumentList -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $logPath -RedirectStandardError $errorLogPath
  Write-Output "Started dev server in background. PID=$($process.Id)"
  Write-Output "Log: $logPath"
  Write-Output "Error log: $errorLogPath"

  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (Test-HttpReady -TargetPort $Port) {
      Write-Output "Dev server is ready at http://localhost:$Port/dashboard"
      exit 0
    }
  }

  Write-Output "Dev server process started, but no HTTP response yet. Check log: $logPath"
  exit 1
}

& $filePath @argumentList
