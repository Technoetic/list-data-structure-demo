# tool-result hook
# 1. Read 도구로 Step 파일 읽은 후 자동 진행 리마인더
# 2. HTML 파일 수정 시 자동 Playwright 인터랙션 테스트

$ErrorActionPreference = "Stop"

# ================================================================
# 1. Step 파일 읽기 리마인더
# ================================================================
if ($env:TOOL_NAME -eq "Read") {
    $filePath = $env:RESULT | ConvertFrom-Json | Select-Object -ExpandProperty file_path -ErrorAction SilentlyContinue

    if ($filePath -match "step_archive[/\\]step(\d+)\.md") {
        $stepNum = [int]$matches[1]
        $nextStep = $stepNum + 1

        if ($nextStep -le 54) {
            $message = @"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Step $stepNum 읽기 완료 → 즉시 Step $nextStep 수행
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ "진행할까요?" 질문 금지
❌ 사용자 확인 요청 금지
❌ 대기/멈춤 금지

✅ 즉시 다음 Step 수행
✅ 진행 상황만 보고: "✅ Step $stepNum/54 완료 → Step $nextStep/54 시작..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"@
            Write-Output $message
        }
        elseif ($stepNum -eq 54) {
            $message = @"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Step 54/54 완료 - 전체 작업 종료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

최종 보고를 작성합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"@
            Write-Output $message
        }
    }
}

# ================================================================
# 2. HTML 파일 수정 시 자동 인터랙션 테스트 + 자동 수정 루프
# ================================================================
if ($env:TOOL_NAME -eq "Write" -or $env:TOOL_NAME -eq "Edit") {
    try {
        $result = $env:RESULT | ConvertFrom-Json -ErrorAction SilentlyContinue
        $filePath = $result.file_path

        # HTML 파일인지 확인
        if ($filePath -match '\.html?$' -and (Test-Path $filePath)) {
            Write-Output "`n🎭 HTML 파일 수정 감지: $filePath"
            Write-Output "🔄 Playwright 인터랙션 테스트 + 자동 수정 루프 시작...`n"

            # HTML 자동 수정 루프 실행
            $autoFixScript = Join-Path $PSScriptRoot "html-auto-fix-loop.ps1"

            if (Test-Path $autoFixScript) {
                & powershell -File $autoFixScript -HtmlFilePath $filePath

                $exitCode = $LASTEXITCODE

                if ($exitCode -eq 0) {
                    Write-Output "`n✅ HTML 인터랙션 테스트 통과!"
                    Write-Output "📸 스크린샷 저장 완료`n"
                } elseif ($exitCode -eq 2) {
                    Write-Output "`n⏳ Claude의 수정을 기다리는 중..."
                    Write-Output "파일을 수정하면 자동으로 재테스트됩니다.`n"
                }
            } else {
                Write-Output "⚠️  자동 수정 스크립트를 찾을 수 없습니다: $autoFixScript"
            }
        }
    } catch {
        # JSON 파싱 실패 시 무시
    }
}

exit 0
