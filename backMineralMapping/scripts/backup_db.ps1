# Backup PostgreSQL mineral_mapping (custom format).
# Usage: .\scripts\backup_db.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (Test-Path .\.env) {
    Get-Content .\.env | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
        $k, $v = $_.Split('=', 2)
        [Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim(), 'Process')
    }
}

$db = $env:DB_NAME; if (-not $db) { $db = 'mineral_mapping' }
$user = $env:DB_USER; if (-not $user) { $user = 'postgres' }
$hostName = $env:DB_HOST; if (-not $hostName) { $hostName = 'localhost' }
$port = $env:DB_PORT; if (-not $port) { $port = '5432' }

$outDir = Join-Path $root 'basededonnée\backups'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$out = Join-Path $outDir "$db`_$stamp.dump"

$env:PGPASSWORD = $env:DB_PASSWORD
$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
    $candidates = @(
        'C:\Program Files\PostgreSQL\18\bin\pg_dump.exe',
        'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe',
        'C:\Program Files\PostgreSQL\16\bin\pg_dump.exe'
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { $pgDump = $c; break }
    }
}
if (-not $pgDump) { throw 'pg_dump introuvable' }

& $pgDump -h $hostName -p $port -U $user -Fc -f $out $db
Write-Host "Backup OK: $out"
