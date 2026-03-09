# accessibility-validator.ps1
# Step 46 - 접근성 테스트 자동화 Hook

param(
    [string]$ToolName,
    [string]$ToolInput
)

# UTF-8 (BOM 없음) 인코딩 강제
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "=== 접근성 테스트 시작 ===" -ForegroundColor Cyan

$failed = $false

# 웹 프로젝트 확인
if (-not (Test-Path "package.json")) {
    Write-Host "웹 프로젝트가 아님 - 접근성 테스트 건너뜀" -ForegroundColor Gray
    exit 0
}

# 1. Playwright axe-core 테스트
if (Test-Path "playwright.config.ts" -or Test-Path "playwright.config.js") {
    Write-Host "`n[1/3] Playwright axe-core 접근성 테스트..." -ForegroundColor Yellow

    # @a11y 태그로 접근성 테스트 실행
    npx playwright test --grep "@a11y" 2>&1 | Out-String | Write-Host

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ 접근성 위반 발견됨" -ForegroundColor Red
        $failed = $true
    } else {
        Write-Host "  ✓ Playwright 접근성 테스트 통과" -ForegroundColor Green
    }
}

# 2. pa11y 또는 pa11y-ci
$packageJson = Get-Content "package.json" -Raw -Encoding UTF8 | ConvertFrom-Json

if ($packageJson.scripts.'test:a11y') {
    Write-Host "`n[2/3] pa11y 접근성 테스트..." -ForegroundColor Yellow

    npm run test:a11y 2>&1 | Out-String | Write-Host

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ 접근성 위반 발견됨" -ForegroundColor Red
        $failed = $true
    } else {
        Write-Host "  ✓ pa11y 접근성 테스트 통과" -ForegroundColor Green
    }
} else {
    Write-Host "`n[2/3] pa11y 스크립트 없음 (건너뜀)" -ForegroundColor Gray
}

# 3. Lighthouse 접근성 점수
$lighthouseExists = Get-Command lighthouse -ErrorAction SilentlyContinue
if ($lighthouseExists -and (Test-Path "package.json")) {
    Write-Host "`n[3/3] Lighthouse 접근성 점수..." -ForegroundColor Yellow

    # 로컬 서버가 실행 중이어야 함 (건너뜀 처리)
    Write-Host "  - Lighthouse는 수동 실행 권장 (CI에서 실행)" -ForegroundColor Gray
    Write-Host "  - 명령어: lighthouse http://localhost:3000 --only-categories=accessibility" -ForegroundColor Gray
} else {
    Write-Host "`n[3/3] Lighthouse 없음 (건너뜀)" -ForegroundColor Gray
}

# 최종 결과
Write-Host "`n=== 접근성 테스트 완료 ===" -ForegroundColor Cyan

if ($failed) {
    Write-Host "접근성 테스트 실패: WCAG 위반 사항을 수정하세요" -ForegroundColor Red
    Write-Host "위반 사항 확인 후 수정하세요" -ForegroundColor Yellow
    exit 1
}

Write-Host "모든 접근성 테스트 통과" -ForegroundColor Green
exit 0
