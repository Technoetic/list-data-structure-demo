# html-bundler.ps1
# JS/CSS 분리 파일을 단일 index.html로 번들링
# Step 36 빌드 검증 시 자동 실행

param(
    [string]$ToolName,
    [string]$ToolInput
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "=== HTML 번들러 시작 ===" -ForegroundColor Cyan

$projectRoot = 'c:\Users\Admin\Desktop\pred\web'
$srcHtml     = Join-Path $projectRoot 'src\index.html'
$distDir     = Join-Path $projectRoot 'dist'
$distHtml    = Join-Path $distDir 'index.html'

# src/index.html 없으면 건너뜀 (인라인 프로젝트는 번들 불필요)
if (-not (Test-Path $srcHtml)) {
    Write-Host "src/index.html 없음 - 번들링 건너뜀 (이미 단일 파일 방식)" -ForegroundColor Gray
    exit 0
}

# dist 디렉토리 생성
if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

$html = Get-Content $srcHtml -Raw -Encoding UTF8

# 1. <link rel="stylesheet" href="...css"> → 인라인 <style>
$html = [regex]::Replace($html, '<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\'][^>]*/?>',
{
    param($m)
    $href = $m.Groups[1].Value
    $cssPath = Join-Path $projectRoot $href
    if (Test-Path $cssPath) {
        $css = Get-Content $cssPath -Raw -Encoding UTF8
        Write-Host "  CSS 인라인: $href" -ForegroundColor Gray
        return "<style>`n$css`n</style>"
    }
    return $m.Value
})

# 2. <script src="...js" type="module"> → 인라인 <script>
$html = [regex]::Replace($html, '<script[^>]+src=["\']([^"\']+\.js)["\'][^>]*></script>',
{
    param($m)
    $src = $m.Groups[1].Value
    $jsPath = Join-Path $projectRoot $src
    if (Test-Path $jsPath) {
        $js = Get-Content $jsPath -Raw -Encoding UTF8
        # export/import 제거 (인라인 시 불필요)
        $js = $js -replace '^\s*export\s+(default\s+)?', ''
        $js = $js -replace "^import\s+.+from\s+['""].+['""];?\s*`n", ''
        Write-Host "  JS 인라인: $src" -ForegroundColor Gray
        return "<script>`n$js`n</script>"
    }
    return $m.Value
})

[System.IO.File]::WriteAllText($distHtml, $html, [System.Text.Encoding]::UTF8)

Write-Host "번들링 완료: dist/index.html" -ForegroundColor Green
Write-Host "=== HTML 번들러 완료 ===" -ForegroundColor Cyan
exit 0
