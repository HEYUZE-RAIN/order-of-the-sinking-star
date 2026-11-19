param(
  [string]$img = "q_tophat_big.png",
  [double]$scale = 1.0
)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Foundation, ContentType = WindowsRuntime]

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function Await($op, $type) {
  $t = $asTaskGeneric.MakeGenericMethod($type).Invoke($null, @($op))
  $t.Wait(-1) | Out-Null
  return $t.Result
}

$path = (Resolve-Path $img).Path
$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($path)) ([Windows.Storage.StorageFile])
$stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) { Write-Output "NO_ENGINE"; exit }

$result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
foreach ($line in $result.Lines) {
  $x0 = 1e9; $y0 = 1e9; $x1 = -1; $y1 = -1
  foreach ($w in $line.Words) {
    $r = $w.BoundingRect
    if ($r.X -lt $x0) { $x0 = $r.X }
    if ($r.Y -lt $y0) { $y0 = $r.Y }
    if (($r.X + $r.Width) -gt $x1) { $x1 = $r.X + $r.Width }
    if (($r.Y + $r.Height) -gt $y1) { $y1 = $r.Y + $r.Height }
  }
  $a = [int]($x0 / $scale); $b = [int]($y0 / $scale)
  $c = [int]($x1 / $scale); $d = [int]($y1 / $scale)
  Write-Output ("BBOX|{0}|{1}|{2}|{3}|{4}" -f $a, $b, $c, $d, $line.Text)
}
