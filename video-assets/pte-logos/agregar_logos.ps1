# Agrega los logos de NASG, Zaboli y Fortis al ultimo slide ("PTE POWER.") del video.
# Requisito: ffmpeg y ffprobe en el PATH  (winget install Gyan.FFmpeg)
# Uso:  powershell -ExecutionPolicy Bypass -File .\agregar_logos.ps1
#       (opcional) -SegundosFinales 6    -> cuantos segundos del final muestran los logos
#       (opcional) -Inicio 42.5          -> segundo exacto donde empieza el ultimo slide

param(
    [string]$Video = "C:\Users\gabri\Desktop\Biogrow\Turbines\Videos Seneca Demo\PTE Complete video 1080.mp4",
    [double]$SegundosFinales = 6,
    [double]$Inicio = -1
)

$ErrorActionPreference = "Stop"
$overlay = Join-Path $PSScriptRoot "logos_overlay_1920x1080.png"

if (-not (Test-Path -LiteralPath $Video)) {
    # Por si la extension no es .mp4
    $dir = Split-Path $Video
    $found = Get-ChildItem -LiteralPath $dir -File | Where-Object { $_.BaseName -eq "PTE Complete video 1080" } | Select-Object -First 1
    if (-not $found) { throw "No encuentro el video: $Video" }
    $Video = $found.FullName
}

$dur = [double]::Parse((& ffprobe -v error -show_entries format=duration -of csv=p=0 "$Video").Trim(),
                       [Globalization.CultureInfo]::InvariantCulture)
if ($Inicio -lt 0) { $Inicio = [math]::Max(0, $dur - $SegundosFinales) }
$st = $Inicio.ToString("0.###", [Globalization.CultureInfo]::InvariantCulture)

$out = Join-Path (Split-Path $Video) ("{0} - con logos.mp4" -f [IO.Path]::GetFileNameWithoutExtension($Video))

# Los logos aparecen con un fundido de 0.8 s y se quedan hasta el final.
$filter = "[1:v]format=rgba,fade=in:st=${st}:d=0.8:alpha=1[ov];" +
          "[0:v][ov]overlay=0:0:shortest=1:enable='gte(t,$st)',format=yuv420p[v]"

& ffmpeg -y -i "$Video" -loop 1 -i "$overlay" -filter_complex $filter `
    -map "[v]" -map "0:a?" -c:v libx264 -crf 18 -preset slow -c:a copy -movflags +faststart "$out"

Write-Host "`nListo: $out  (logos desde el segundo $st de $dur)"
