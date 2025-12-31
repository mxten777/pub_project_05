# Phase 1 REAL 전환 운영 준비 매뉴얼

> **문서 유형**: 운영 준비 보고서 (Operational Readiness Report)  
> **작성일**: 2026-01-01  
> **현재 상태**: READY (승인 대기 중)  
> **대상**: 운영팀, 배포 담당자, 기술 책임자  
> **목적**: Phase 1 REAL 전환 전 준비 완료 상태 증빙 및 전환 통제 기준 제공

---

## 1. 문서 개요

### 1.1 Phase 1 범위 정의

**Phase 1 REAL 전환**은 다음 작업만 포함한다:
- Mock 데이터 생성에서 공공데이터포털 실제 API 호출로 전환
- PowerShell 스케줄러 `$MODE` 변수 값 변경 (`mock` → `real`)
- Task Scheduler REAL 작업 활성화
- 최초 REAL 데이터 수집 및 품질 검증

**Phase 1에 포함하지 않는 작업**:
- ❌ Firestore 저장 로직 구현
- ❌ 프론트엔드 실시간 데이터 바인딩
- ❌ ML 모델 학습 데이터 확보
- ❌ 프로덕션 배포 (Vercel)

### 1.2 전환 조건

Phase 1 REAL 전환은 다음 조건이 **모두** 충족되어야 실행한다:
1. 공공데이터포털 활용신청 **승인 완료**
2. .env 파일 Decoding Key 설정 **완료**
3. 단건 테스트 (pages=1) **성공**
4. 운영 책임자 **승인**

---

## 2. 현재 완료 상태 요약 (Mock 기준)

### 2.1 배포 완료 항목

| 구분 | 상태 | 검증 방법 |
|------|------|----------|
| **collect_bids.py** | ✅ 배포 완료 | `python collect_bids.py --source mock --count 50` 성공 |
| **collect_awards.py** | ✅ 배포 완료 | `python collect_awards.py --source mock --count 50` 성공 |
| **bids_scheduler.ps1** | ✅ 배포 완료 | `.\bids_scheduler.ps1` 실행 → [SUCCESS] 확인 |
| **awards_scheduler.ps1** | ✅ 배포 완료 | `.\awards_scheduler.ps1` 실행 → [SUCCESS] 확인 |
| **api_server.py** | ✅ 배포 완료 | `Invoke-RestMethod http://localhost:8004/health` 응답 확인 |
| **Task Scheduler Mock 작업** | ✅ 활성화 | 30분/6시간 주기 자동 실행 중 |
| **Task Scheduler REAL 작업** | ⚠️ 비활성화 | 승인 전까지 생성 금지 |

### 2.2 Mock 모드 운영 현황

- **일일 수집량**: 입찰 14,400건, 낙찰 400건
- **파일 저장**: `collected_bids_mock_*.json` 형식
- **재시도 큐**: 0건 (정상)
- **오류율**: 0% (Mock 데이터 생성)

---

## 3. REAL 전환 원칙

### 3.1 승인 전 행동 (현재 상태)

다음 행동은 **절대 금지**한다:
- ❌ PowerShell 스크립트 `$MODE = "real"` 변경
- ❌ Task Scheduler REAL 작업 생성 또는 활성화
- ❌ `collect_bids.py --source real` 수동 실행 (테스트 포함)
- ❌ API 키 실제 호출 발생시키는 모든 행위

다음 행동은 **허용**한다:
- ✅ Mock 모드 정상 동작 확인
- ✅ 문서 검토 및 수정
- ✅ REAL 전환 절차 리허설 (dry-run, 실제 실행 없음)
- ✅ .env 파일 Decoding Key 준비

### 3.2 승인 후 행동

다음 절차를 **순서대로** 수행한다:

#### 3.2.1 단계 1: API 승인 확인
```powershell
# 공공데이터포털 마이페이지 접속
# https://www.data.go.kr/uim/mypage/selectMyActivatPage.do
# 상태: "승인" 확인 (승인 대기, 반려 시 중단)
```

#### 3.2.2 단계 2: 단건 테스트
```powershell
cd C:\pubcoding\pub_project_05\python
python collect_bids.py --source real --pages 1 --run-id real_test_001
```

**판정 기준**:
- ✅ **200 응답 + 100건 수집**: 다음 단계 진행
- ❌ **401/403 응답**: 승인 미완료 또는 API 키 오류 → 중단
- ❌ **429 응답**: Rate Limit → 30초 대기 후 재시도 (정상)
- ❌ **5xx 응답**: 서버 오류 → 60초 대기 후 재시도

#### 3.2.3 단계 3: PowerShell 스크립트 전환
```powershell
# bids_scheduler.ps1 편집 (라인 23)
$MODE = "real"  # mock → real 변경

# awards_scheduler.ps1 편집 (라인 23)
$MODE = "real"  # mock → real 변경
```

#### 3.2.4 단계 4: 수동 실행 검증
```powershell
# 입찰 수집 (3분 이내 완료)
.\bids_scheduler.ps1
# 로그 확인: [SUCCESS] ✅ 수집 성공

# 낙찰 수집 (2분 이내 완료)
.\awards_scheduler.ps1
# 로그 확인: [SUCCESS] ✅ 수집 성공
```

#### 3.2.5 단계 5: Task Scheduler 활성화
```
1. 작업 스케줄러 열기
2. "SmartBidRadar - 입찰 수집 (REAL)" 작업 생성
   - 트리거: 매 30분
   - 프로그램: powershell.exe
   - 인수: -ExecutionPolicy Bypass -File "C:\...\bids_scheduler.ps1"
3. "사용" 체크
4. "지금 실행" 클릭
5. 로그 확인 (logs/scheduler_bids_YYYYMMDD.log)
```

---

## 4. 서비스 키 사용 규칙

### 4.1 Decoding Key vs Encoding Key

**절대 원칙**: `.env` 파일에는 **Decoding Key**만 저장한다.

| 구분 | Decoding Key | Encoding Key |
|------|--------------|--------------|
| **형태** | 일반 문자열 (Base64 디코딩 완료) | URL 인코딩된 문자열 (%2F, %2B 등) |
| **사용 방법** | `requests.get(url, params={'serviceKey': key})` | URL 직결 방식 (비권장) |
| **이중 인코딩** | ❌ 발생하지 않음 | ✅ 발생 (401/403 에러) |
| **적용 위치** | collect_bids.py, collect_awards.py | 사용 금지 |

### 4.2 올바른 사용 예시

```python
# ✅ 올바른 방법 (Decoding Key + params 방식)
params = {
    'serviceKey': os.getenv('DATA_PORTAL_API_KEY'),  # Decoding Key
    'numOfRows': 100,
    'pageNo': 1,
    'type': 'json'
}
response = requests.get('http://apis.data.go.kr/...', params=params)
```

### 4.3 잘못된 사용 예시

```python
# ❌ 잘못된 방법 1 (Encoding Key + params 방식)
params = {
    'serviceKey': encoding_key,  # 이미 인코딩된 키
    'numOfRows': 100
}
response = requests.get(url, params=params)  # 이중 인코딩 발생

# ❌ 잘못된 방법 2 (URL 직결)
url = f"http://apis.data.go.kr/...?serviceKey={key}&numOfRows=100"
response = requests.get(url)  # 이중 인코딩 가능성
```

### 4.4 검증 방법

```powershell
# .env 파일 확인
Get-Content .env | Select-String "DATA_PORTAL_API_KEY"

# 출력 예시 (Decoding Key, 올바름):
# DATA_PORTAL_API_KEY=w/P304CJjlu5/PsB9eYIAEW0KvxF+gq/...

# 출력 예시 (Encoding Key, 잘못됨):
# DATA_PORTAL_API_KEY=w%2FP304CJjlu5%2FPsB9eYIAEW0KvxF%2Bgq%2F...
# → %2F, %2B 등이 있으면 Encoding Key임 (재설정 필요)
```

---

## 5. 에러 처리 및 재시도 정책

### 5.1 즉시 실패 (재시도 금지)

다음 HTTP 상태 코드는 **즉시 실패**로 처리하고 재시도하지 않는다:

| 상태 코드 | 의미 | 조치 |
|----------|------|------|
| **400** | Bad Request | 파라미터 오류 → 코드 수정 필요 |
| **401** | Unauthorized | API 키 오류 또는 승인 미완료 → 승인 상태 확인 |
| **403** | Forbidden | 권한 없음 또는 활용신청 만료 → 재신청 필요 |

**로그 출력**:
```
❌ [401] 즉시 실패: {"error":"Invalid service key"}
   401/403: API 키 오류 또는 승인 미완료
   400: 파라미터 오류
```

### 5.2 재시도 대상 (지수 백오프 + 지터)

다음 HTTP 상태 코드/오류는 **재시도**한다 (최대 6회):

| 구분 | 대기 시간 (초) | 비고 |
|------|--------------|------|
| **429** (Rate Limit) | 30 → 60 → 90 → 120 → 150 → 180 | +랜덤 지터 0~10초 |
| **5xx** (Server Error) | 60 → 120 → 180 → 240 → 300 → 360 | +랜덤 지터 0~20초 |
| **Timeout** | 30 → 60 → 90 → 120 → 150 → 180 | +랜덤 지터 0~10초 |

**재시도 로직**:
```python
for attempt in range(max_retries):  # max_retries = 6
    try:
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        
        elif response.status_code in [400, 401, 403]:
            break  # 즉시 실패
        
        elif response.status_code == 429:
            wait_time = 30 * (attempt + 1) + random.uniform(0, 10)
            time.sleep(wait_time)
        
        elif response.status_code >= 500:
            wait_time = 60 * (attempt + 1) + random.uniform(0, 20)
            time.sleep(wait_time)
    
    except requests.Timeout:
        wait_time = 30 * (attempt + 1) + random.uniform(0, 10)
        time.sleep(wait_time)
```

### 5.3 재시도 실패 시 처리

최대 6회 재시도 후에도 실패하면:
1. `retry_queue.json`에 저장 (operation, params, page, failed_at)
2. 로그에 `❌ 6회 재시도 실패. retry_queue에 적재.` 출력
3. 수집 계속 진행 (전체 중단하지 않음)

---

## 6. Run 상태 정의

### 6.1 상태 코드

| 상태 | 의미 | 조건 |
|------|------|------|
| **OK** | 전체 성공 | bids 성공 AND awards 성공 |
| **PARTIAL_OK** | 일부 성공 | bids 성공 OR awards 성공 (한쪽만) |
| **FAIL** | 전체 실패 | bids 실패 AND awards 실패 |

### 6.2 판정 로직

```python
def determine_run_status(bids_success: bool, awards_success: bool) -> str:
    if bids_success and awards_success:
        return "OK"
    elif bids_success or awards_success:
        return "PARTIAL_OK"
    else:
        return "FAIL"
```

### 6.3 PARTIAL_OK 허용 조건

다음 경우 PARTIAL_OK를 **정상**으로 간주한다:
- ✅ bids 성공 + awards 실패 (입찰 데이터는 확보)
- ✅ bids 실패 + awards 성공 (낙찰 데이터는 확보)

다음 경우 PARTIAL_OK를 **경고**로 간주한다:
- ⚠️ 3회 연속 PARTIAL_OK (동일한 쪽 실패 반복)
- ⚠️ 일일 PARTIAL_OK 비율 > 30%

### 6.4 Exit Code

PowerShell 스크립트는 다음 Exit Code를 반환한다:
- **0**: OK (성공)
- **1**: FAIL (실패)
- **2**: PARTIAL_OK (부분 성공, Task Scheduler는 성공으로 간주)

---

## 7. Task Scheduler REAL 전환 원칙

### 7.1 Mock 작업 (현재 활성화)

| 항목 | 설정 |
|------|------|
| **작업 이름** | SmartBidRadar - 입찰 수집 (Mock) |
| **상태** | ✅ 활성화 (사용 중) |
| **트리거** | 매 30분 (오전 6:00 시작) |
| **동작** | `powershell.exe -ExecutionPolicy Bypass -File bids_scheduler.ps1` |
| **조건** | 절전 모드 해제, AC 전원 무관 |

### 7.2 REAL 작업 (승인 전까지 비활성화)

| 항목 | 설정 |
|------|------|
| **작업 이름** | SmartBidRadar - 입찰 수집 (REAL) |
| **상태** | ❌ 미생성 (승인 전까지 생성 금지) |
| **트리거** | 매 30분 (Mock과 동일) |
| **동작** | `powershell.exe -ExecutionPolicy Bypass -File bids_scheduler.ps1` |
| **비고** | `$MODE="real"` 전제 |

### 7.3 전환 절차

#### 7.3.1 승인 전 (현재 상태)
- Mock 작업만 활성화
- REAL 작업 생성 금지
- PowerShell 스크립트 `$MODE="mock"` 유지

#### 7.3.2 승인 후 전환
1. **PowerShell 스크립트 수정** (bids/awards_scheduler.ps1)
   ```powershell
   $MODE = "real"  # mock → real 변경
   ```

2. **수동 실행 검증** (1회)
   ```powershell
   .\bids_scheduler.ps1
   # 로그 확인: Mode: real, [SUCCESS] 출력
   ```

3. **REAL 작업 생성**
   - 작업 스케줄러 → 작업 만들기
   - Mock 작업 설정 복사
   - 이름: "SmartBidRadar - 입찰 수집 (REAL)"
   - **사용** 체크

4. **Mock 작업 비활성화**
   - Mock 작업 우클릭 → "사용 안 함" 체크
   - 또는 삭제 (권장하지 않음, 롤백용)

### 7.4 동시 실행 방지

**절대 원칙**: Mock 작업과 REAL 작업을 **동시 활성화하지 않는다**.

위반 시 발생 문제:
- 파일 덮어쓰기 충돌
- API Rate Limit 초과 (일일 허용량 조기 소진)
- 로그 파일 혼재

---

## 8. 배포 정책

### 8.1 로컬 테스트 (개발 환경)

다음 배포는 **항상 허용**한다:
- ✅ Mock 모드 코드 수정 후 git commit/push
- ✅ 문서 수정 및 배포
- ✅ 프론트엔드 로컬 실행 (`npm run dev`)
- ✅ FastAPI 서버 로컬 실행 (`python api_server.py`)

### 8.2 Vercel 배포 제한

#### 8.2.1 개발 환경 (`vercel dev`)
- ✅ **허용**: 로컬 테스트, Mock 데이터 확인
- ✅ **허용**: 프론트엔드 UI/UX 개선 작업

#### 8.2.2 프리뷰 환경 (`vercel`)
- ✅ **허용**: PR 리뷰용 배포
- ⚠️ **조건부 허용**: REAL API 호출 코드 포함 시 환경 변수 미설정 확인

#### 8.2.3 프로덕션 환경 (`vercel --prod`)
**Phase 1 완료 전까지 절대 금지**

금지 이유:
- REAL API 호출 코드가 프로덕션에 배포되면 즉시 실행될 수 있음
- 승인 전 API 키 노출 위험
- 사용자 대상 서비스 전환은 Phase 2 이후

#### 8.2.4 Phase 1 완료 후 허용 조건

다음 조건이 **모두** 충족되면 `vercel --prod` 허용:
1. ✅ REAL 모드 수집 1주일 이상 안정 운영 (오류율 < 5%)
2. ✅ Firestore 데이터 1,000건 이상 축적
3. ✅ 프론트엔드 실시간 바인딩 테스트 완료
4. ✅ 운영 책임자 승인

---

## 9. 롤백 시나리오

### 9.1 롤백 트리거

다음 상황 발생 시 **즉시 롤백**한다:
- ❌ REAL 모드 첫 실행 후 401/403 에러 지속 (30분 이상)
- ❌ 429 Rate Limit 에러 시간당 10회 이상
- ❌ 5xx Server Error 연속 3회 이상
- ❌ 수집 성공률 < 50% (1시간 기준)
- ❌ 파일 저장 실패 연속 3회

### 9.2 롤백 절차 (5분 이내 완료)

#### 9.2.1 단계 1: PowerShell 스크립트 복구
```powershell
# bids_scheduler.ps1 편집 (라인 23)
$MODE = "mock"  # real → mock 복구

# awards_scheduler.ps1 편집 (라인 23)
$MODE = "mock"  # real → mock 복구
```

#### 9.2.2 단계 2: Task Scheduler 전환
```
1. 작업 스케줄러 열기
2. "SmartBidRadar - 입찰 수집 (REAL)" 우클릭 → "사용 안 함"
3. "SmartBidRadar - 입찰 수집 (Mock)" 우클릭 → "사용"
4. "지금 실행" 클릭하여 Mock 모드 정상 동작 확인
```

#### 9.2.3 단계 3: 로그 확인
```powershell
# 최근 로그 확인
Get-Content logs\scheduler_bids_$(Get-Date -Format 'yyyyMMdd').log -Tail 20

# 예상 출력:
# [INFO] Mode: mock
# [SUCCESS] ✅ 수집 성공
```

#### 9.2.4 단계 4: 원인 분석
```powershell
# 에러 로그 검색
Get-Content logs\scheduler_bids_*.log | Select-String -Pattern "\[ERROR\]"

# 주요 확인 사항:
# - 401/403: API 키 또는 승인 상태
# - 429: Rate Limit 발생 빈도
# - 5xx: 공공데이터포털 서버 상태
```

### 9.3 롤백 후 재전환 조건

다음 조건이 **모두** 충족되면 REAL 재전환 시도:
1. ✅ 원인 분석 완료 및 해결 방안 수립
2. ✅ Mock 모드 정상 운영 확인 (24시간)
3. ✅ 공공데이터포털 API 상태 정상 확인
4. ✅ 운영 책임자 승인

---

## 10. 운영 체크리스트

### 10.1 승인 전 체크리스트 (현재 상태)

| 항목 | 상태 | 확인 방법 |
|------|------|----------|
| **1. Mock 모드 정상 동작** | ✅ 완료 | `python collect_bids.py --source mock --count 50` 성공 |
| **2. PowerShell 스크립트 MODE=mock** | ✅ 완료 | `Get-Content bids_scheduler.ps1 | Select-String '$MODE'` 확인 |
| **3. Task Scheduler Mock 작업 활성화** | ✅ 완료 | 작업 스케줄러에서 "사용" 체크 확인 |
| **4. Task Scheduler REAL 작업 미생성** | ✅ 완료 | REAL 작업 존재하지 않음 확인 |
| **5. .env Decoding Key 설정** | ✅ 완료 | `Get-Content .env | Select-String 'DATA_PORTAL_API_KEY'` |
| **6. 문서 작성 완료** | ✅ 완료 | PHASE1_OPERATIONS_MANUAL.md 존재 |
| **7. 롤백 시나리오 숙지** | ✅ 완료 | 운영팀 교육 완료 |
| **8. 공공데이터포털 활용신청 제출** | ✅ 완료 | 승인 대기 중 (1-3일 소요) |

### 10.2 승인 직후 체크리스트 (전환 시 실행)

| 순서 | 항목 | 실행 명령 | 성공 기준 | 실패 시 조치 |
|------|------|----------|----------|-------------|
| **1** | 승인 상태 확인 | 공공데이터포털 마이페이지 접속 | 상태: "승인" | 승인 대기 또는 반려 시 중단 |
| **2** | .env Decoding Key 재검증 | `Get-Content .env \| Select-String 'DATA_PORTAL_API_KEY'` | %2F, %2B 없음 | Decoding Key로 재설정 |
| **3** | 단건 테스트 (pages=1) | `python collect_bids.py --source real --pages 1 --run-id real_test` | 200 응답 + 100건 수집 | 401/403: 승인 재확인, 429: 대기 후 재시도 |
| **4** | PowerShell MODE 전환 | `$MODE = "real"` (bids/awards) | 파일 저장 확인 | 원복 후 단건 테스트 재실행 |
| **5** | 수동 실행 검증 | `.\bids_scheduler.ps1` | [SUCCESS] 로그 출력 | 로그 확인 후 원인 분석 |
| **6** | Task Scheduler 생성 | REAL 작업 생성 (Mock 복사) | "사용" 체크 확인 | 설정 재확인 |
| **7** | Task 수동 실행 | "지금 실행" 클릭 | 로그 파일 생성 및 [SUCCESS] | 롤백 (MODE=mock) |
| **8** | 1시간 모니터링 | 로그 실시간 확인 | 오류율 < 5% | 오류율 > 20% 시 롤백 |
| **9** | 품질 검증 | `python data_quality.py --source real --input ...` | PASS 또는 CONDITIONAL PASS | FAIL 시 원인 분석 및 재수집 |
| **10** | Mock 작업 비활성화 | Mock 작업 "사용 안 함" 체크 | REAL만 활성화 상태 | Mock/REAL 동시 활성화 금지 |

### 10.3 일일 모니터링 체크리스트 (REAL 전환 후)

**매일 오전 9시 실행**:

| 항목 | 확인 명령 | 정상 기준 | 이상 시 조치 |
|------|----------|----------|-------------|
| **1. 수집 성공률** | 로그 파일 `[SUCCESS]` 개수 | > 95% | < 90% 시 원인 분석 |
| **2. 에러 로그** | `Select-String -Pattern "\[ERROR\]"` | 0건 또는 < 5건 | 연속 3회 동일 에러 시 조치 |
| **3. 파일 생성** | `Get-ChildItem collected_bids_real_*.json` | 48개/일 (입찰) | 누락 시 수동 실행 |
| **4. 파일 크기** | 평균 50~150KB (입찰) | 정상 범위 내 | 0KB 또는 > 1MB 시 확인 |
| **5. API Rate Limit** | 로그 `[429]` 개수 | < 5회/일 | > 20회 시 주기 완화 검토 |
| **6. Task 실행 상태** | 작업 스케줄러 마지막 실행 | 30분 이내 | 중단 시 재시작 |
| **7. 디스크 용량** | `Get-PSDrive C` | > 10GB | < 5GB 시 로그 정리 |

---

## 11. 문서 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2026-01-01 | 최초 작성 (Phase 1 REAL 전환 준비 완료) | 운영팀 |

---

**승인**: ________________ (운영 책임자)  
**검토**: ________________ (기술 책임자)  
**작성**: ________________ (배포 담당자)

---

**다음 문서**: PHASE1_COMMIT_GUIDE.md (변경 이력 및 커밋 가이드)  
**관련 문서**: Step3B_SCHEDULER_GUIDE.md (Task Scheduler 운영 가이드)
