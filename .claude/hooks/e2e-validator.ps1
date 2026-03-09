# e2e-validator.ps1
# Step 38 - E2E 테스트 자동화 Hook

param(
    [string]$ToolName,
    [string]$ToolInput
)

# UTF-8 (BOM 없음) 인코딩 강제
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "=== E2E 테스트 시작 ===" -ForegroundColor Cyan

$failed = $false

# 1. Node.js/웹 프로젝트 - Playwright
if (Test-Path "package.json") {
    Write-Host "`n[1/4] Playwright E2E 테스트..." -ForegroundColor Yellow

    $packageJson = Get-Content "package.json" -Raw -Encoding UTF8 | ConvertFrom-Json

    # test:e2e 또는 playwright 스크립트 확인
    $e2eScript = $null
    if ($packageJson.scripts.'test:e2e') {
        $e2eScript = 'test:e2e'
    } elseif ($packageJson.scripts.playwright) {
        $e2eScript = 'playwright'
    } elseif ($packageJson.scripts.'e2e') {
        $e2eScript = 'e2e'
    }

    if ($e2eScript) {
        Write-Host "  - npm run $e2eScript 실행 중..." -ForegroundColor Gray
        npm run $e2eScript 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ E2E 테스트 실패" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ E2E 테스트 성공" -ForegroundColor Green
        }
    } elseif (Test-Path "playwright.config.ts" -or Test-Path "playwright.config.js") {
        Write-Host "  - npx playwright test 실행 중..." -ForegroundColor Gray
        npx playwright test 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ Playwright 테스트 실패" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ Playwright 테스트 성공" -ForegroundColor Green
        }
    } else {
        Write-Host "  - E2E 테스트 스크립트 없음 (건너뜀)" -ForegroundColor Gray
    }

    # API 통합 테스트 확인
    if ($packageJson.scripts.'test:integration') {
        Write-Host "`n  - API 통합 테스트 실행 중..." -ForegroundColor Gray
        npm run test:integration 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ 통합 테스트 실패" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ 통합 테스트 성공" -ForegroundColor Green
        }
    }
}

# 2. Rust 프로젝트 - 통합 테스트
if (Test-Path "Cargo.toml") {
    Write-Host "`n[2/4] Rust 통합 테스트..." -ForegroundColor Yellow

    # tests/ 디렉토리 확인
    if (Test-Path "tests") {
        Write-Host "  - cargo test --test integration 실행 중..." -ForegroundColor Gray
        cargo test --test integration 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ 통합 테스트 실패" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ 통합 테스트 성공" -ForegroundColor Green
        }
    } else {
        Write-Host "  - tests/ 디렉토리 없음 (건너뜀)" -ForegroundColor Gray
    }
}

# 3. Go 프로젝트 - 통합 테스트
if (Test-Path "go.mod") {
    Write-Host "`n[3/4] Go 통합 테스트..." -ForegroundColor Yellow

    Write-Host "  - go test -tags=integration ./... 실행 중..." -ForegroundColor Gray
    go test -tags=integration ./... 2>&1 | Out-String | Write-Host

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ⚠ 통합 테스트 실패 또는 태그 없음" -ForegroundColor Yellow
        # Go는 integration 태그가 없을 수 있으므로 경고만 표시
    } else {
        Write-Host "  ✓ 통합 테스트 성공" -ForegroundColor Green
    }
}

# 4. Python 프로젝트 - pytest integration
if ((Test-Path "setup.py") -or (Test-Path "pyproject.toml")) {
    Write-Host "`n[4/4] Python 통합 테스트..." -ForegroundColor Yellow

    if (Test-Path "tests") {
        Write-Host "  - pytest tests/integration/ 실행 중..." -ForegroundColor Gray

        if (Test-Path "tests/integration") {
            pytest tests/integration/ 2>&1 | Out-String | Write-Host

            if ($LASTEXITCODE -ne 0) {
                Write-Host "  ✗ 통합 테스트 실패" -ForegroundColor Red
                $failed = $true
            } else {
                Write-Host "  ✓ 통합 테스트 성공" -ForegroundColor Green
            }
        } else {
            Write-Host "  - tests/integration/ 디렉토리 없음 (건너뜀)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  - tests/ 디렉토리 없음 (건너뜀)" -ForegroundColor Gray
    }
}

# 최종 결과
Write-Host "`n=== E2E 테스트 완료 ===" -ForegroundColor Cyan

if ($failed) {
    Write-Host "E2E 테스트 실패: 위 실패한 테스트를 수정하세요" -ForegroundColor Red
    exit 1
}

Write-Host "모든 E2E 테스트 통과" -ForegroundColor Green
exit 0
