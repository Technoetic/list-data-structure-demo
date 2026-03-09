# ================================================================
# HTML Interaction Tester Hook
# ================================================================
# 목적: HTML 파일 수정 시 자동으로 Playwright 인터랙션 테스트 실행
# 기능: Hover, Click, Drag, Double-click 테스트 + 스크린샷
# ================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$HtmlFilePath,

    [string]$ProjectRoot = $PWD,

    [int]$MaxRetries = 3,

    [switch]$AutoFix = $false
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$safeFileName = [System.IO.Path]::GetFileNameWithoutExtension($HtmlFilePath) -replace '[^a-zA-Z0-9]', '_'
$LogFile = Join-Path $ProjectRoot ".claude\hooks\html-interaction-tester_${safeFileName}_${timestamp}.log"
$ScreenshotDir = Join-Path $ProjectRoot ".claude\screenshots\interactions\$safeFileName"
$ResultFile = Join-Path $ProjectRoot ".claude\html_interaction_test_${safeFileName}_${timestamp}.md"

# 디렉토리 생성
New-Item -ItemType Directory -Force -Path (Split-Path $LogFile) | Out-Null
New-Item -ItemType Directory -Force -Path $ScreenshotDir | Out-Null

# 로그 함수
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage -Encoding UTF8
}

Write-Log "=== HTML Interaction Tester 시작 ===" "INFO"
Write-Log "대상 파일: $HtmlFilePath" "INFO"

# ================================================================
# Playwright 테스트 스크립트 생성
# ================================================================
$testScriptPath = Join-Path $ProjectRoot ".claude\playwright-interaction-test-temp.js"
$absoluteHtmlPath = Resolve-Path $HtmlFilePath
$fileUrl = "file:///$($absoluteHtmlPath -replace '\\', '/')"

$jsScreenshotDir = $ScreenshotDir -replace '\\', '/'

$testScript = @"
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const screenshotDir = '$jsScreenshotDir';
  const results = [];
  let allPassed = true;

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    console.log('🌐 페이지 로딩: $fileUrl');
    await page.goto('$fileUrl', { waitUntil: 'networkidle', timeout: 10000 });

    // 초기 스크린샷
    await page.screenshot({
      path: path.join(screenshotDir, '00_initial.png'),
      fullPage: true
    });
    console.log('✅ 초기 스크린샷 저장');

    // ================================================================
    // 1. 인터랙티브 요소 자동 탐지
    // ================================================================
    const interactiveElements = await page.evaluate(() => {
      const elements = [];

      // 클릭 가능한 요소들
      const clickables = document.querySelectorAll('button, a, [onclick], [role="button"], input[type="button"], input[type="submit"]');
      clickables.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          elements.push({
            type: 'clickable',
            selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : ''),
            index: idx,
            text: el.textContent.trim().substring(0, 30),
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          });
        }
      });

      // 드래그 가능한 요소들
      const draggables = document.querySelectorAll('[draggable="true"], [ondrag], [ondragstart]');
      draggables.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          elements.push({
            type: 'draggable',
            selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
            index: idx,
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          });
        }
      });

      return elements;
    });

    console.log(\`🔍 발견된 인터랙티브 요소: \${interactiveElements.length}개\`);

    // ================================================================
    // 2. Hover 테스트
    // ================================================================
    console.log('\\n🖱️  Hover 테스트 시작');
    let hoverCount = 0;
    for (const el of interactiveElements.slice(0, 5)) { // 최대 5개
      try {
        await page.mouse.move(el.x, el.y);
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(screenshotDir, \`01_hover_\${hoverCount}_\${el.type}.png\`)
        });
        console.log(\`  ✅ Hover: \${el.text || el.selector}\`);
        results.push({ test: 'hover', element: el.selector, status: 'pass' });
        hoverCount++;
      } catch (err) {
        console.log(\`  ❌ Hover 실패: \${el.selector} - \${err.message}\`);
        results.push({ test: 'hover', element: el.selector, status: 'fail', error: err.message });
        allPassed = false;
      }
    }

    // ================================================================
    // 3. Click 테스트
    // ================================================================
    console.log('\\n👆 Click 테스트 시작');
    let clickCount = 0;
    const clickableEls = interactiveElements.filter(el => el.type === 'clickable').slice(0, 5);
    for (const el of clickableEls) {
      try {
        await page.mouse.click(el.x, el.y);
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(screenshotDir, \`02_click_\${clickCount}.png\`)
        });
        console.log(\`  ✅ Click: \${el.text || el.selector}\`);
        results.push({ test: 'click', element: el.selector, status: 'pass' });
        clickCount++;
      } catch (err) {
        console.log(\`  ❌ Click 실패: \${el.selector} - \${err.message}\`);
        results.push({ test: 'click', element: el.selector, status: 'fail', error: err.message });
        allPassed = false;
      }
    }

    // ================================================================
    // 4. Double-click 테스트
    // ================================================================
    console.log('\\n👆👆 Double-click 테스트 시작');
    let dblClickCount = 0;
    for (const el of clickableEls.slice(0, 3)) {
      try {
        await page.mouse.dblclick(el.x, el.y);
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(screenshotDir, \`03_doubleclick_\${dblClickCount}.png\`)
        });
        console.log(\`  ✅ Double-click: \${el.text || el.selector}\`);
        results.push({ test: 'doubleclick', element: el.selector, status: 'pass' });
        dblClickCount++;
      } catch (err) {
        console.log(\`  ❌ Double-click 실패: \${el.selector} - \${err.message}\`);
        results.push({ test: 'doubleclick', element: el.selector, status: 'fail', error: err.message });
        allPassed = false;
      }
    }

    // ================================================================
    // 5. Drag 테스트
    // ================================================================
    console.log('\\n🖱️  Drag 테스트 시작');
    let dragCount = 0;
    const draggableEls = interactiveElements.filter(el => el.type === 'draggable').slice(0, 3);
    for (const el of draggableEls) {
      try {
        await page.mouse.move(el.x, el.y);
        await page.mouse.down();
        await page.mouse.move(el.x + 100, el.y + 50, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(screenshotDir, \`04_drag_\${dragCount}.png\`)
        });
        console.log(\`  ✅ Drag: \${el.selector}\`);
        results.push({ test: 'drag', element: el.selector, status: 'pass' });
        dragCount++;
      } catch (err) {
        console.log(\`  ❌ Drag 실패: \${el.selector} - \${err.message}\`);
        results.push({ test: 'drag', element: el.selector, status: 'fail', error: err.message });
        allPassed = false;
      }
    }

    // 최종 스크린샷
    await page.screenshot({
      path: path.join(screenshotDir, '99_final.png'),
      fullPage: true
    });

    await browser.close();

    // 결과 출력
    console.log('\\n' + '='.repeat(60));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));
    console.log(\`총 테스트: \${results.length}개\`);
    console.log(\`통과: \${results.filter(r => r.status === 'pass').length}개\`);
    console.log(\`실패: \${results.filter(r => r.status === 'fail').length}개\`);
    console.log('='.repeat(60));

    // JSON 결과 출력 (PowerShell이 파싱)
    console.log('JSON_RESULT_START');
    console.log(JSON.stringify({ success: allPassed, results: results }));
    console.log('JSON_RESULT_END');

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('❌ 치명적 오류:', error.message);
    console.log('JSON_RESULT_START');
    console.log(JSON.stringify({ success: false, error: error.message }));
    console.log('JSON_RESULT_END');
    process.exit(1);
  }
})();
"@

Set-Content -Path $testScriptPath -Value $testScript -Encoding UTF8
Write-Log "테스트 스크립트 생성: $testScriptPath" "INFO"

# ================================================================
# 테스트 실행 (재시도 로직 포함)
# ================================================================
$retryCount = 0
$testPassed = $false
$testResults = $null

while ($retryCount -lt $MaxRetries -and -not $testPassed) {
    $attempt = $retryCount + 1
    Write-Log "테스트 시도 $attempt/$MaxRetries" "INFO"

    try {
        $output = node $testScriptPath 2>&1 | Out-String
        Write-Log $output "INFO"

        # JSON 결과 추출
        if ($output -match '(?s)JSON_RESULT_START\s*\n(.+?)\n\s*JSON_RESULT_END') {
            $jsonResult = $matches[1]
            $testResults = $jsonResult | ConvertFrom-Json

            if ($testResults.success) {
                $testPassed = $true
                Write-Log "✅ 테스트 통과!" "INFO"
            } else {
                Write-Log "❌ 테스트 실패" "WARN"
                $retryCount++

                if ($retryCount -lt $MaxRetries) {
                    Write-Log "3초 후 재시도..." "INFO"
                    Start-Sleep -Seconds 3
                }
            }
        } else {
            Write-Log "테스트 결과 파싱 실패" "ERROR"
            $retryCount++
        }

    } catch {
        Write-Log "테스트 실행 오류: $_" "ERROR"
        $retryCount++

        if ($retryCount -lt $MaxRetries) {
            Start-Sleep -Seconds 3
        }
    }
}

# ================================================================
# 결과 리포트 생성
# ================================================================
$finalStatus = if ($testPassed) { "✅ 성공" } else { "❌ 실패" }
$screenshotFiles = Get-ChildItem -Path $ScreenshotDir -Filter "*.png" | Sort-Object Name

$reportContent = @"
# HTML Interaction Test Report

## 파일 정보
- **대상 파일**: ``$HtmlFilePath``
- **테스트 시간**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **최종 상태**: $finalStatus
- **시도 횟수**: $($retryCount + 1)/$MaxRetries

## 테스트 결과

### 통계
- **총 테스트**: $($testResults.results.Count)개
- **통과**: $($testResults.results | Where-Object { $_.status -eq 'pass' } | Measure-Object | Select-Object -ExpandProperty Count)개
- **실패**: $($testResults.results | Where-Object { $_.status -eq 'fail' } | Measure-Object | Select-Object -ExpandProperty Count)개

### 상세 결과

$(foreach ($result in $testResults.results) {
"#### $($result.test.ToUpper()) - $($result.element)
- **상태**: $(if ($result.status -eq 'pass') { '✅ 통과' } else { '❌ 실패' })
$(if ($result.error) { "- **오류**: $($result.error)" })
"
})

## 스크린샷

$(foreach ($screenshot in $screenshotFiles) {
"### $($screenshot.Name)
![Screenshot]($($screenshot.FullName -replace '\\', '/'))
"
})

## 로그 파일
- 전체 로그: ``$LogFile``
- 스크린샷 디렉토리: ``$ScreenshotDir``

---

$(if (-not $testPassed) {
"## ⚠️ 다음 단계

테스트가 실패했습니다. Claude에게 다음을 요청하세요:

1. 실패한 인터랙션 분석
2. HTML/CSS/JavaScript 수정
3. 재테스트 자동 실행
"
})
"@

Set-Content -Path $ResultFile -Value $reportContent -Encoding UTF8
Write-Log "결과 리포트 생성: $ResultFile" "INFO"

# ================================================================
# 임시 파일 정리
# ================================================================
if (Test-Path $testScriptPath) {
    Remove-Item $testScriptPath -Force
    Write-Log "임시 스크립트 삭제" "INFO"
}

Write-Log "=== HTML Interaction Tester 완료 ===" "INFO"

# 종료 코드
if ($testPassed) {
    exit 0
} else {
    exit 1
}
