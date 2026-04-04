param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
  Write-Output "No process is listening on port $Port."
  exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($pid in $pids) {
  Stop-Process -Id $pid -Force
  Write-Output "Stopped PID $pid on port $Port."
}
