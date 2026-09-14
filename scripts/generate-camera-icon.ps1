# Add-Type -AssemblyName System.Drawing

# $size = 512
# $bitmap = [System.Drawing.Bitmap]::new($size, $size)
# $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
# $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
# $graphics.Clear([System.Drawing.Color]::Transparent)

# $black = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::Black)
# $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)

# $graphics.FillEllipse($black, 16, 16, 480, 480)
# $graphics.FillRectangle($white, 136, 180, 240, 192)
# $graphics.FillRectangle($white, 104, 212, 304, 128)
# $graphics.FillEllipse($white, 104, 180, 64, 64)
# $graphics.FillEllipse($white, 344, 180, 64, 64)
# $graphics.FillEllipse($white, 104, 308, 64, 64)
# $graphics.FillEllipse($white, 344, 308, 64, 64)
# $graphics.FillRectangle($white, 176, 144, 160, 68)
# $graphics.FillEllipse($black, 190, 214, 132, 132)
# $graphics.FillEllipse($black, 344, 214, 28, 28)

# $projectRoot = Split-Path -Parent $PSScriptRoot
# $resourcesPath = Join-Path $projectRoot 'resources\camera-icon.png'
# $buildPath = Join-Path $projectRoot 'build\camera-icon.png'
# $bitmap.Save($resourcesPath, [System.Drawing.Imaging.ImageFormat]::Png)
# $bitmap.Save($buildPath, [System.Drawing.Imaging.ImageFormat]::Png)

# $black.Dispose()
# $white.Dispose()
# $graphics.Dispose()
# $bitmap.Dispose()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$size = 512
$bitmap = [System.Drawing.Bitmap]::new($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

$black = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::Black)
$pen = [System.Drawing.Pen]::new([System.Drawing.Color]::Black, 38)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

# Head: upper left and upper right.
$graphics.DrawBezier($pen, 184, 91, 184, 51, 216, 19, 256, 19)
$graphics.DrawBezier($pen, 256, 19, 296, 19, 328, 51, 328, 91)

# Head: vertical sides.
$graphics.DrawLine($pen, 184, 91, 184, 198)
$graphics.DrawLine($pen, 328, 91, 328, 198)

# Head: lower right and lower left.
$graphics.DrawBezier($pen, 328, 198, 328, 238, 296, 270, 256, 270)
$graphics.DrawBezier($pen, 256, 270, 216, 270, 184, 238, 184, 198)

# Stem.
$graphics.FillRectangle($black, 237, 351, 38, 143)

# Left arm.
$graphics.DrawBezier($pen, 102, 204, 102, 266, 135, 309, 183, 341)

# Right arm.
$graphics.DrawBezier($pen, 256, 360, 341, 360, 410, 296, 410, 204)

# Base.
$graphics.FillRectangle($black, 180, 475, 152, 37)
$graphics.FillEllipse($black, 161, 475, 38, 38)
$graphics.FillEllipse($black, 313, 475, 38, 38)

$projectRoot = Split-Path -Parent $PSScriptRoot
$resourcesPath = Join-Path $projectRoot 'resources\camera-icon.png'
$buildPath = Join-Path $projectRoot 'build\camera-icon.png'

$bitmap.Save($resourcesPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Save($buildPath, [System.Drawing.Imaging.ImageFormat]::Png)

$pen.Dispose()
$black.Dispose()
$graphics.Dispose()
$bitmap.Dispose()