# build-validator.ps1
# Step 37 - 빌드 검증 자동화 Hook

param(
    [string]$ToolName,
    [string]$ToolInput
)

# UTF-8 (BOM 없음) 인코딩 강제
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "=== 빌드 검증 시작 ===" -ForegroundColor Cyan

$failed = $false

# 1. Node.js/npm 프로젝트 체크
if (Test-Path "package.json") {
    Write-Host "`n[1/4] Node.js 빌드 검증..." -ForegroundColor Yellow

    $packageJson = Get-Content "package.json" -Raw -Encoding UTF8 | ConvertFrom-Json

    if ($packageJson.scripts.build) {
        Write-Host "  - npm run build 실행 중..." -ForegroundColor Gray
        npm run build 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ npm run build 실패" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ npm run build 성공" -ForegroundColor Green

            # 빌드 출력물 확인
            $buildDirs = @("dist", "build", "out", ".next")
            $foundOutput = $false

            foreach ($dir in $buildDirs) {
                if (Test-Path $dir) {
                    Write-Host "  ✓ 빌드 출력물 확인: $dir/" -ForegroundColor Green
                    $foundOutput = $true
                    break
                }
            }

            if (-not $foundOutput) {
                Write-Host "  ⚠ 빌드 출력 디렉토리를 찾을 수 없음 (dist/build/out/.next)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  - package.json에 build 스크립트 없음 (건너뜀)" -ForegroundColor Gray
    }
}

# 2. Rust 프로젝트 체크
if (Test-Path "Cargo.toml") {
    Write-Host "`n[2/4] Rust 빌드 검증..." -ForegroundColor Yellow

    Write-Host "  - cargo build --release 실행 중..." -ForegroundColor Gray
    cargo build --release 2>&1 | Out-String | Write-Host

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ cargo build 실패" -ForegroundColor Red
        $failed = $true
    } else {
        Write-Host "  ✓ cargo build 성공" -ForegroundColor Green

        if (Test-Path "target/release") {
            Write-Host "  ✓ 빌드 출력물 확인: target/release/" -ForegroundColor Green
        }
    }
}

# 3. Go 프로젝트 체크
if (Test-Path "go.mod") {
    Write-Host "`n[3/4] Go 빌드 검증..." -ForegroundColor Yellow

    Write-Host "  - go build 실행 중..." -ForegroundColor Gray
    go build ./... 2>&1 | Out-String | Write-Host

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ go build 실패" -ForegroundColor Red
        $failed = $true
    } else {
        Write-Host "  ✓ go build 성공" -ForegroundColor Green
    }
}

# 4. Python 프로젝트 체크 (setup.py 또는 pyproject.toml)
if ((Test-Path "setup.py") -or (Test-Path "pyproject.toml")) {
    Write-Host "`n[4/4] Python 빌드 검증..." -ForegroundColor Yellow

    if (Test-Path "pyproject.toml") {
        Write-Host "  - python -m build 실행 중..." -ForegroundColor Gray
        python -m build 2>&1 | Out-String | Write-Host

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ python build 실패" -ForegroundColor Red
            $failed = $true
        } else {
            Write-Host "  ✓ python build 성공" -ForegroundColor Green

            if (Test-Path "dist") {
                Write-Host "  ✓ 빌드 출력물 확인: dist/" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  - setup.py 확인됨 (수동 빌드 필요)" -ForegroundColor Gray
    }
}

# 최종 결과
Write-Host "`n=== 빌드 검증 완료 ===" -ForegroundColor Cyan

if ($failed) {
    Write-Host "빌드 검증 실패: 위 오류를 수정하세요" -ForegroundColor Red
    exit 1
}

Write-Host "모든 빌드 검증 통과" -ForegroundColor Green
exit 0
