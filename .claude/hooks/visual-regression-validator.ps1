# visual-regression-validator.ps1
# Step 42 - UI 회귀 테스트 자동화 Hook

param(
    [string]$ToolName,
    [string]$ToolInput
)

# UTF-8 (BOM 없음) 인코딩 강제
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "=== UI 회귀 테스트 시작 ===" -ForegroundColor Cyan

$failed = $false

# 1. Playwright 스냅샷 테스트 확인
if (Test-Path "package.json") {
    Write-Host "`n[1/2] Playwright 스냅샷 테스트..." -ForegroundColor Yellow

    $packageJson = Get-Content "package.json" -Raw -Encoding UTF8 | ConvertFrom-Json

    # test:visual 또는 visual 스크립트 확인
    $visualScript = $null
    if ($packageJson.scripts.'test:visual') {
        $visualScript = 'test:visual'
    } elseif ($packageJson.scripts.visual) {
        $visualScript = 'visual'
    }

    if ($visualScript) {
        Write-Host "  - npm run $visualScript 실행 중..." -ForegroundColor Gray
        npm run $visualScript 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ 스냅샷 테스트 실패 (UI 회귀 감지됨)" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ 스냅샷 테스트 성공" -ForegroundColor Green
        }
    } elseif (Test-Path "playwright.config.ts" -or Test-Path "playwright.config.js") {
        # @visual 태그로 스냅샷 테스트 실행
        Write-Host "  - npx playwright test --grep @visual 실행 중..." -ForegroundColor Gray
        npx playwright test --grep "@visual" 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ 스냅샷 테스트 실패 (UI 회귀 감지됨)" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ 스냅샷 테스트 성공" -ForegroundColor Green
        }
    } else {
        Write-Host "  - 스냅샷 테스트 없음 (건너뜀)" -ForegroundColor Gray
    }
}

# 2. Jest 스냅샷 테스트 확인
if (Test-Path "package.json") {
    Write-Host "`n[2/2] Jest 스냅샷 테스트..." -ForegroundColor Yellow

    $packageJson = Get-Content "package.json" -Raw -Encoding UTF8 | ConvertFrom-Json

    # Jest 설정 확인
    if ($packageJson.devDependencies.jest -or $packageJson.dependencies.jest) {
        Write-Host "  - npm test -- -u 없이 스냅샷 검증 중..." -ForegroundColor Gray
        npm test -- --no-updateSnapshot 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ Jest 스냅샷 테스트 실패" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ Jest 스냅샷 테스트 성공" -ForegroundColor Green
        }
    } else {
        Write-Host "  - Jest 없음 (건너뜀)" -ForegroundColor Gray
    }
}

# 최종 결과
Write-Host "`n=== UI 회귀 테스트 완료 ===" -ForegroundColor Cyan

if ($failed) {
    Write-Host "UI 회귀 테스트 실패: 스냅샷 차이를 확인하고 수정하세요" -ForegroundColor Red
    Write-Host "차이점 확인: test-results/ 또는 __diff_output__/ 디렉토리" -ForegroundColor Yellow
    exit 1
}

Write-Host "모든 UI 회귀 테스트 통과" -ForegroundColor Green
exit 0
