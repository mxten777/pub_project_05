# ============================================================================
# Smart Bid Radar - 입찰 데이터 자동 수집 스크립트
# ============================================================================
# 용도: Windows Task Scheduler에서 주기적으로 실행
# 주기: 30~60분 권장
# 실행: powershell -ExecutionPolicy Bypass -File bids_scheduler.ps1
# ============================================================================

# 설정
$API_BASE_URL = "http://localhost:8004"
$API_ENDPOINT = "/v1/collect/bids"
$LOG_DIR = ".\logs"
$MAX_RETRIES = 2
$RETRY_DELAY_SECONDS = 30

# ===== 모드 선택 =====
# mock: 테스트 데이터 생성 (현재 기본값)
# real: 공공데이터포털 API 실호출 (승인 후 변경)
# ⚠️ REAL 모드 전환 전 확인 사항:
#    1. 공공데이터포털 활용신청 승인 완료
#    2. .env 파일 Decoding Key 설정 확인
#    3. 수동 테스트 1회 실행 (pages=1)
$MODE = "mock"  # mock 또는 real

# 로그 디렉터리 생성
if (-Not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

# 타임스탬프 생성
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$date = Get-Date -Format "yyyyMMdd"
$logFile = Join-Path $LOG_DIR "scheduler_bids_$date.log"

# 로그 함수
function Write-Log {
    param([string]$message, [string]$level = "INFO")
    $logTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$logTimestamp] [$level] $message"
    Write-Output $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

# 시작 로그
Write-Log "========================================" "INFO"
Write-Log "입찰 데이터 수집 시작" "INFO"
Write-Log "Mode: $MODE" "INFO"
Write-Log "Timestamp: $timestamp" "INFO"

# run_id 생성
$runId = "auto_bids_$timestamp"

# API 요청 본문
$body = @{
    mode = $MODE
    run_id = $runId
    pages = 3
    force = $false
} | ConvertTo-Json

# 헤더
$headers = @{
    "Content-Type" = "application/json"
}

# 재시도 로직
$attempt = 0
$success = $false

while ($attempt -le $MAX_RETRIES -and -not $success) {
    $attempt++
    
    try {
        Write-Log "API 호출 시도 $attempt/$($MAX_RETRIES + 1)" "INFO"
        Write-Log "URL: $API_BASE_URL$API_ENDPOINT" "DEBUG"
        Write-Log "Body: $body" "DEBUG"
        
        # API 호출
        $response = Invoke-RestMethod -Uri "$API_BASE_URL$API_ENDPOINT" `
            -Method Post `
            -Headers $headers `
            -Body $body `
            -TimeoutSec 600
        
        # 응답 확인
        if ($response.status -eq "completed") {
            Write-Log "✅ 수집 성공" "SUCCESS"
            Write-Log "Run ID: $($response.run_id)" "INFO"
            Write-Log "Trace ID: $($response.trace_id)" "INFO"
            Write-Log "수집 건수: $($response.fetched_items)" "INFO"
            Write-Log "저장 건수: $($response.stored_items)" "INFO"
            Write-Log "오류 건수: $($response.errors_count)" "INFO"
            Write-Log "소요 시간: $($response.duration_sec)초" "INFO"
            Write-Log "파일 경로: $($response.raw_file_path)" "INFO"
            
            $success = $true
            
        } elseif ($response.status -eq "failed") {
            Write-Log "❌ 수집 실패" "ERROR"
            Write-Log "Run ID: $($response.run_id)" "ERROR"
            Write-Log "오류 메시지: $($response.error_message)" "ERROR"
            
            if ($attempt -le $MAX_RETRIES) {
                Write-Log ("Retry in {0}s (will retry)" -f $RETRY_DELAY_SECONDS) "WARN"
                Start-Sleep -Seconds $RETRY_DELAY_SECONDS
            }
            
        } else {
            Write-Log "⚠️ 알 수 없는 상태: $($response.status)" "WARN"
            Write-Log "응답: $($response | ConvertTo-Json)" "DEBUG"
            
            if ($attempt -le $MAX_RETRIES) {
                Write-Log ("Retry in {0}s (will retry)" -f $RETRY_DELAY_SECONDS) "WARN"
                Start-Sleep -Seconds $RETRY_DELAY_SECONDS
            }
        }
        powershell -ExecutionPolicy Bypass -File .\bids_scheduler.ps1

    } catch {
        Write-Log "❌ API 호출 오류" "ERROR"
        Write-Log "오류 메시지: $($_.Exception.Message)" "ERROR"
        
        # 서버 연결 확인
        try {
            $healthCheck = Invoke-RestMethod -Uri "$API_BASE_URL/health" -TimeoutSec 5
            Write-Log "서버 상태: OK (timestamp: $($healthCheck.timestamp))" "INFO"
        } catch {
            Write-Log "⚠️ 서버 응답 없음 - 서버가 실행 중인지 확인하세요" "ERROR"
        }
        
        if ($attempt -le $MAX_RETRIES) {
            Write-Log "재시도 대기 중 ($RETRY_DELAY_SECONDS초)..." "WARN"
            Start-Sleep -Seconds $RETRY_DELAY_SECONDS
        }
    }
}

# 최종 결과
if ($success) {
    Write-Log "입찰 데이터 수집 완료 ✅" "INFO"
    Write-Log "========================================" "INFO"
    exit 0
} else {
    Write-Log "입찰 데이터 수집 실패 (최대 재시도 횟수 초과) ❌" "ERROR"
    Write-Log "========================================" "ERROR"
    exit 1
}
