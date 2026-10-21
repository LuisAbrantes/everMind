# Gera os ícones PNG da PWA a partir das mesmas formas do icon.svg.
# Executar:  powershell -ExecutionPolicy Bypass -File .\tools\make-icons.ps1
#
# Usamos System.Drawing (disponivel no Windows) para nao depender de
# rasterizador de SVG. As formas e coordenadas espelham exatamente o icon.svg,
# entao os dois artefatos precisam ser mantidos em sincronia.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\icons'))

# Paleta do design system (ver css/tokens.css)
$BG_TOP     = [System.Drawing.Color]::FromArgb(255,  29,  29,  33)
$BG_BOTTOM  = [System.Drawing.Color]::FromArgb(255,   9,   9,  11)
$BORDER     = [System.Drawing.Color]::FromArgb(255,  39,  39,  42)
$FG         = [System.Drawing.Color]::FromArgb(255, 250, 250, 250)
$FG_MUTED   = [System.Drawing.Color]::FromArgb(255, 161, 161, 170)
$INK        = [System.Drawing.Color]::FromArgb(255,   9,   9,  11)

function New-GradientBrush($x, $y, $w, $h) {
    New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point $x, $y),
        (New-Object System.Drawing.Point $x, ($y + $h)),
        $BG_TOP, $BG_BOTTOM)
}

function New-EverMindIcon([int]$size, [bool]$maskable) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)

    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Desenhamos sempre no espaço de 512 e escalamos no Graphics.
    $g.ScaleTransform($size / 512.0, $size / 512.0)

    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

    # ---- Máscara --------------------------------------------------------
    # Ícone "any": cantos arredondados (rx 112).
    # Ícone "maskable": sem cantos e com 12,5% de margem de segurança, para
    # que o Android possa recortar em círculo, gota ou quadrado.
    $pad = 0
    $radius = 112
    if ($maskable) { $pad = 64; $radius = 0 }

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($radius -gt 0) {
        $d = $radius * 2
        $path.AddArc($pad, $pad, $d, $d, 180, 90)
        $path.AddArc(512 - $pad - $d, $pad, $d, $d, 270, 90)
        $path.AddArc(512 - $pad - $d, 512 - $pad - $d, $d, $d, 0, 90)
        $path.AddArc($pad, 512 - $pad - $d, $d, $d, 90, 90)
        $path.CloseFigure()
    } else {
        $path.AddRectangle((New-Object System.Drawing.Rectangle $pad, $pad, (512 - 2 * $pad), (512 - 2 * $pad)))
    }

    $brush = New-GradientBrush $pad $pad (512 - 2 * $pad) (512 - 2 * $pad)
    $g.FillPath($brush, $path)
    $brush.Dispose()

    if ($radius -gt 0) {
        $pen = New-Object System.Drawing.Pen $BORDER, 12
        $g.DrawPath($pen, $path)
        $pen.Dispose()
    }
    $path.Dispose()

    # ---- Cérebro: dois hemisférios --------------------------------------
    $bL = New-Object System.Drawing.SolidBrush $FG
    $g.FillEllipse($bL, 128, 119, 124, 172)   # cx 190, cy 205, rx 62, ry 86
    $bL.Dispose()

    $bR = New-Object System.Drawing.SolidBrush $FG_MUTED
    $g.FillEllipse($bR, 260, 119, 124, 172)   # cx 322, cy 205
    $bR.Dispose()

    # Sulcos
    $bS = New-Object System.Drawing.SolidBrush $INK
    foreach ($s in @(@(176,172), @(210,214), @(176,248), @(336,172), @(302,214), @(336,248))) {
        $g.FillEllipse($bS, ($s[0] - 10), ($s[1] - 10), 20, 20)
    }
    $bS.Dispose()

    # Fresta central
    $gapPen = New-Object System.Drawing.Pen $INK, 10
    $gapPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $gapPen.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($gapPen, 256, 132, 256, 278)
    $gapPen.Dispose()

    # ---- Broto ----------------------------------------------------------
    $stemPen = New-Object System.Drawing.Pen $FG, 16
    $stemPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $stemPen.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($stemPen, 256, 318, 256, 376)
    $stemPen.Dispose()

    $leafL = New-Object System.Drawing.SolidBrush $FG
    $g.FillEllipse($leafL, 153, 307, 100, 58)  # rotacionado -18 graus no SVG
    $leafL.Dispose()

    $leafR = New-Object System.Drawing.SolidBrush $FG_MUTED
    $g.FillEllipse($leafR, 259, 307, 100, 58)
    $leafR.Dispose()

    $g.Dispose()
    return $bmp
}

function Save-Png($bmp, [string]$name) {
    $path = Join-Path $outDir $name
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "ok  $name"
}

Save-Png (New-EverMindIcon 180 $false) 'icon-180.png'
Save-Png (New-EverMindIcon 192 $false) 'icon-192.png'
Save-Png (New-EverMindIcon 512 $false) 'icon-512.png'
Save-Png (New-EverMindIcon 512 $true)  'icon-maskable-512.png'

Write-Host "Icones gerados em $outDir"
