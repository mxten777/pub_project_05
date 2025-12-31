# Phase 1 REAL 전환 준비 완료 보고서

> **작성일**: 2026-01-01  
> **상태**: READY (승인 대기)  
> **목적**: 공공데이터포털 승인 즉시 REAL 모드 전환 가능

---

## 1. 변경 요약

### 1.1 serviceKey 사용 규칙 명문화
**원칙**: requests params 방식 + **Decoding Key 필수**

```python
# ✅ 올바른 사용 (Decoding Key)
params = {
    'serviceKey': self.api_key,  # .env의 DATA_PORTAL_API_KEY (Decoded)
    'numOfRows': 100,
    'type': 'json'
}
response = requests.get(url, params=params)

# ❌ 잘못된 사용 (Encoding Key + 직결 방식)
url = f"http://api.data.go.kr/service?serviceKey={encoding_key}&..."
# → 이중 인코딩 발생, 401/403 에러
```

**적용 위치**:
- `collect_bids.py`: 라인 124 (params 방식)
- `collect_awards.py`: 라인 105 (params 방식)
- `.env` 파일: Decoding Key 저장 확인 필요

---

### 1.2 HTTP 에러 처리 표준화

#### 재시도 불가 (즉시 FAIL)
- **401 Unauthorized**: API 키 오류, 승인 미완료
- **403 Forbidden**: 권한 없음, 활용신청 만료
- **400 Bad Request**: 파라미터 오류

#### 재시도 가능 (지수 백오프 + 지터)
- **429 Too Many Requests**: 30초 대기 → 60초 → 90초 (최대 6회)
- **5xx Server Error**: 60초 대기 → 120초 → 180초
- **Timeout**: 30초 대기 → 60초 → 90초

**적용 위치**:
- `collect_bids.py`: `_api_call_with_retry()` 메서드 강화
- `collect_awards.py`: `_api_call_with_retry()` 메서드 강화

---

### 1.3 Run 상태 모델

#### 상태 정의
```python
class RunStatus:
    OK = "OK"                      # 모든 작업 성공
    PARTIAL_OK = "PARTIAL_OK"      # 일부 성공 (bids 성공, awards 실패 등)
    FAIL = "FAIL"                  # 전체 실패
```

#### 판정 로직
```python
if bids_success and awards_success:
    status = "OK"
elif bids_success or awards_success:
    status = "PARTIAL_OK"
else:
    status = "FAIL"
```

**적용 위치**:
- `api_server.py`: `CollectResponse` 모델 확장
- PowerShell 스크립트: 상태 코드 반영

---

### 1.4 파일 경로 분리

#### Mock 모드
```
./collected_bids_mock_<run_id>.json
./collected_awards_mock_<run_id>.json
./logs/scheduler_bids_<date>.log
```

#### Real 모드
```
./real/collected_bids_real_<run_id>.json
./real/collected_awards_real_<run_id>.json
./real/logs/scheduler_bids_<date>.log
```

**적용 위치**:
- `collect_bids.py`: `save_to_json()` 메서드
- `collect_awards.py`: `save_to_json()` 메서드
- PowerShell 스크립트: 파일 경로 확인 로직

---

## 2. 안전 전환 체크리스트

### Phase 1-A: 사전 검증 (현재 단계)
- [x] serviceKey 규칙 문서화
- [x] HTTP 에러 처리 표준화
- [x] Run 상태 모델 정의
- [x] 파일 경로 분리 설계
- [x] 재시도 로직 강화 (지수 백오프)
- [x] Mock 모드 테스트 (200/60건 성공)

### Phase 1-B: REAL 승인 대기 (BLOCKED)
- [ ] 공공데이터포털 활용신청 승인 확인
- [ ] .env 파일 Decoding Key 재검증
- [ ] REAL 모드 단건 테스트 (pages=1)
- [ ] 401/403 에러 발생 시 즉시 중단 확인
- [ ] 429 에러 시 재시도 동작 확인

### Phase 1-C: REAL 전환 (승인 후 실행)
- [ ] bids_scheduler.ps1: `$MODE = "real"` 변경
- [ ] awards_scheduler.ps1: `$MODE = "real"` 변경
- [ ] Task Scheduler: REAL 작업 활성화
- [ ] 첫 실행 모니터링 (로그 확인)
- [ ] data_quality.py 검증 (PASS 기준 확인)

---

## 3. 커밋 가능 여부

### ✅ COMMIT 가능
**이유**:
1. REAL API 호출 없이 준비 상태만 구축
2. 기존 Mock 모드 동작 영향 없음
3. 코드 안정성 향상 (재시도, 에러 처리)
4. 문서화 완료 (운영 가이드)

### ⚠️ 주의사항
- **REAL 모드 활성화는 별도 커밋** (승인 후)
- **Task Scheduler 설정 변경 금지** (현재는 Mock 유지)
- **.env 파일은 gitignore 유지** (API 키 노출 금지)

---

## 4. 권장 커밋 메시지

```
feat: Phase 1 REAL 전환 준비 완료 (안정성 강화)

- serviceKey 사용 규칙 명문화 (Decoding Key 필수)
- HTTP 에러 처리 표준화 (401/403 즉시 실패, 429/5xx 재시도)
- 재시도 로직 강화 (지수 백오프 + 지터, 최대 6회)
- Run 상태 모델 정의 (OK/PARTIAL_OK/FAIL)
- 파일 경로 분리 설계 (mock/real 디렉터리)
- PHASE1_REAL_READINESS.md 문서 작성

승인 대기 중: 공공데이터포털 활용신청 승인 후 REAL 전환 예정
기존 Mock 모드 동작 영향 없음
```

---

## 5. 롤백 시나리오

### 만약 REAL 전환 후 문제 발생 시
```powershell
# 1. PowerShell 스크립트 즉시 Mock 복귀
$MODE = "mock"  # bids_scheduler.ps1, awards_scheduler.ps1

# 2. Task Scheduler REAL 작업 비활성화
Disable-ScheduledTask -TaskName "SmartBidRadar - 입찰 수집 (REAL)"

# 3. 로그 확인
Get-Content logs\scheduler_bids_YYYYMMDD.log | Select-String -Pattern "\[ERROR\]"

# 4. 파일 정리 (필요 시)
Remove-Item real\collected_*_real_*.json
```

---

## 6. 다음 단계

### Step 4: Firestore 연동 (데이터 영속화)
- [ ] Firebase Admin SDK 설정
- [ ] `save_to_firestore()` 메서드 구현
- [ ] 중복 방지 로직 (upsert)
- [ ] 프론트엔드 실시간 바인딩

### Step 5: 알림 시스템
- [ ] Slack/Email 알림 연동
- [ ] 수집 실패 시 자동 알림
- [ ] 일일 리포트 자동 발송

---

**작성자**: Smart Bid Radar Backend Team  
**검토자**: 시니어 백엔드 엔지니어  
**최종 업데이트**: 2026-01-01
