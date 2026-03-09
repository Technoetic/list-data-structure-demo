# crossbrowser-validator.ps1
# Step 41 - 크로스 브라우저 테스트 자동화 Hook

param(
    [string]$ToolName,
    [string]$ToolInput
)

# UTF-8 (BOM 없음) 인코딩 강제
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "=== 크로스 브라우저 테스트 시작 ===" -ForegroundColor Cyan

$failed = $false

# Playwright 설정 확인
if (-not (Test-Path "playwright.config.ts") -and -not (Test-Path "playwright.config.js")) {
    Write-Host "Playwright 설정 파일 없음 - 웹 앱이 아닐 수 있습니다" -ForegroundColor Yellow
    Write-Host "크로스 브라우저 테스트 건너뜀" -ForegroundColor Gray
    exit 0
}

Write-Host "`n[1/3] Chromium 테스트..." -ForegroundColor Yellow
npx playwright test --project=chromium 2>&1 | Out-String | Write-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Chromium 테스트 실패" -ForegroundColor Red
    $failed = $true
} else {
    Write-Host "  ✓ Chromium 테스트 성공" -ForegroundColor Green
}

Write-Host "`n[2/3] Firefox 테스트..." -ForegroundColor Yellow
npx playwright test --project=firefox 2>&1 | Out-String | Write-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Firefox 테스트 실패" -ForegroundColor Red
    $failed = $true
} else {
    Write-Host "  ✓ Firefox 테스트 성공" -ForegroundColor Green
}

Write-Host "`n[3/3] WebKit (Safari) 테스트..." -ForegroundColor Yellow
npx playwright test --project=webkit 2>&1 | Out-String | Write-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ WebKit 테스트 실패" -ForegroundColor Red
    $failed = $true
} else {
    Write-Host "  ✓ WebKit 테스트 성공" -ForegroundColor Green
}

# 최종 결과
Write-Host "`n=== 크로스 브라우저 테스트 완료 ===" -ForegroundColor Cyan

if ($failed) {
    Write-Host "크로스 브라우저 테스트 실패: 위 실패한 브라우저의 테스트를 수정하세요" -ForegroundColor Red
    exit 1
}

Write-Host "모든 브라우저에서 테스트 통과" -ForegroundColor Green
exit 0
