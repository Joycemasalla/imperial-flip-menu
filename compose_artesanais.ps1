param(
    [string]$InputPath = "test_img_artesanais.jpg",
    [string]$OutputPath = "src\assets\artesanais.jpg",
    [int]$CanvasWidth = 1500,
    [int]$CanvasHeight = 500
)

Add-Type -AssemblyName System.Drawing

# Load input image
$sourceImage = [System.Drawing.Image]::FromFile($InputPath)

# Create canvas
$bitmap = New-Object System.Drawing.Bitmap($CanvasWidth, $CanvasHeight)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Fill background with a color (let's use black or dark gray)
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$graphics.FillRectangle($bgBrush, 0, 0, $CanvasWidth, $CanvasHeight)

# Calculate aspect ratio preserving dimensions
$sourceAspect = $sourceImage.Width / $sourceImage.Height
$canvasAspect = $CanvasWidth / $CanvasHeight

$destWidth = $CanvasWidth
$destHeight = $CanvasHeight

# If the source image is taller than the canvas
if ($sourceAspect -lt $canvasAspect) {
    # Match height
    $destHeight = $CanvasHeight
    $destWidth = [int]($CanvasHeight * $sourceAspect)
} else {
    # Match width
    $destWidth = $CanvasWidth
    $destHeight = [int]($CanvasWidth / $sourceAspect)
}

# Calculate position to center the image
$x = [int](($CanvasWidth - $destWidth) / 2)
$y = [int](($CanvasHeight - $destHeight) / 2)

# Draw image onto canvas
$graphics.DrawImage($sourceImage, $x, $y, $destWidth, $destHeight)

# Save the final image
$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Clean up
$graphics.Dispose()
$bgBrush.Dispose()
$bitmap.Dispose()
$sourceImage.Dispose()

Write-Output "Saved formatted image to $OutputPath"
