param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$appUrl = 'http://127.0.0.1:5173/'
function Test-Professor {
    try {
        $page = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
        return $page.Content -match 'Mi Profesor|MI PROFESOR|mi-profesor'
    } catch { return $false }
}
try {
    if (-not (Test-Professor)) {
        $nodePath = (Get-Command node -ErrorAction Stop).Source
        $vitePath = Join-Path $PSScriptRoot 'node_modules\vite\bin\vite.js'
        if (-not (Test-Path -LiteralPath $vitePath)) { throw 'No se encontraron las dependencias de la aplicacion.' }
        $logFolder = Join-Path $PSScriptRoot 'tmp'
        New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
        $server = Start-Process -FilePath $nodePath -ArgumentList @(('"' + $vitePath + '"'), '--host', '127.0.0.1', '--port', '5173', '--strictPort') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logFolder 'inicio.log') -RedirectStandardError (Join-Path $logFolder 'inicio-error.log') -PassThru
        $ready = $false
        for ($attempt = 0; $attempt -lt 30; $attempt++) {
            if (Test-Professor) { $ready = $true; break }
            if ($server.HasExited) { break }
            Start-Sleep -Milliseconds 500
        }
        if (-not $ready) { throw 'No se pudo iniciar la aplicacion. Revisa tmp\inicio-error.log; el puerto 5173 podria estar ocupado.' }
    }
    if ($CheckOnly) { Write-Output 'Aplicacion disponible en http://127.0.0.1:5173/' }
    else { Start-Process $appUrl }
} catch {
    if ($CheckOnly) { throw }
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($_.Exception.Message, 'Mi profesor de ingles') | Out-Null
    exit 1
}
