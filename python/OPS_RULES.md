# 운영 규칙 문서 (Operations Rules)

**프로젝트**: Smart Bid Radar - 나라장터 데이터 수집 파이프라인  
**버전**: v1.2 (Step 2)  
**작성일**: 2025-12-31  
**목적**: API 장애/호출불가/운영시간 이슈 대응 전략 및 재시도/스킵/큐잉 규칙

---

## 1. 호출 불가(활용신청 이슈) 점검 체크리스트

### 1.1 API 키 검증
```bash
# 1. 환경 변수 확인
echo $DATA_PORTAL_API_KEY  # Linux/Mac
echo %DATA_PORTAL_API_KEY%  # Windows

# 2. API 키 유효성 테스트 (curl)
curl "http://apis.data.go.kr/1230000/BidPublicInfoService04/getBidPblancListInfoServc01?serviceKey=YOUR_KEY&numOfRows=1&pageNo=1&inqryDiv=1&inqryBgnDt=20251201&inqryEndDt=20251231&type=json"

# 3. 응답 확인
# - 정상: {"response": {"header": {"resultCode": "00", "resultMsg": "NORMAL_SERVICE_KEY"}}}
# - 오류: {"response": {"header": {"resultCode": "30", "resultMsg": "SERVICE_KEY_IS_NOT_REGISTERED_ERROR"}}}
```

### 1.2 활용신청 상태 확인
- 공공데이터포털 마이페이지 → 활용신청 내역 확인
- 상태: **승인**, **미승인**, **만료** 체크
- 승인 대기: 평균 1~3영업일 소요
- 만료 시 재신청 필요

### 1.3 트래픽 제한 확인
- 일반 인증키: 1,000회/일
- 프리미엄 인증키: 10,000회/일
- 초과 시: 401 Unauthorized 또는 429 Too Many Requests
- 대응: 다음날 00:00 이후 재시도

### 1.4 네트워크/방화벽 확인
```bash
# 1. DNS 확인
nslookup apis.data.go.kr

# 2. Ping 테스트
ping apis.data.go.kr

# 3. 방화벽 확인 (outbound 80, 443 포트 허용 필요)
telnet apis.data.go.kr 80
```

---

## 2. 장애 공지/오퍼레이션 중지 대응 전략

### 2.1 장애 유형별 대응

| 장애 유형 | HTTP 코드 | 대응 전략 | 재시도 횟수 | 큐 적재 |
|----------|-----------|----------|------------|---------|
| Rate Limit 초과 | 429 | 30초 대기 후 재시도 | 3회 | ✅ |
| 서버 일시 장애 | 500, 502, 503 | 60초 대기 후 재시도 | 3회 | ✅ |
| API 점검 중 | 503 | 120분 대기 후 재시도 | 1회 | ✅ |
| 인증 오류 | 401, 403 | 즉시 중단 (키 확인 필요) | 0회 | ❌ |
| 잘못된 요청 | 400, 404 | 즉시 중단 (파라미터 확인) | 0회 | ❌ |
| 네트워크 타임아웃 | Timeout | 30초 대기 후 재시도 | 3회 | ✅ |

### 2.2 스킵 + 큐 전략

#### 스킵 조건
- 3회 재시도 실패
- 5xx 오류 지속 (서버 점검 가능성)
- 특정 페이지만 반복 실패 (데이터 이슈)

#### 큐 적재 규칙
```json
{
  "operation": "getBidPblancListInfoServc01",
  "params": {
    "pageNo": 2,
    "inqryBgnDt": "20251201",
    "inqryEndDt": "20251231"
  },
  "page": 2,
  "failed_at": "2025-12-31T22:30:00",
  "retry_count": 3,
  "error_code": 503,
  "error_message": "Service Temporarily Unavailable"
}
```

#### 큐 재처리 로직
```python
# 다음 실행 시 retry_queue.json 확인
if os.path.exists('retry_queue.json'):
    with open('retry_queue.json', 'r') as f:
        queue_data = json.load(f)
    
    for item in queue_data['queue']:
        # 24시간 이내 실패 건만 재시도
        failed_time = datetime.fromisoformat(item['failed_at'])
        if (datetime.now() - failed_time).total_seconds() < 86400:
            retry_api_call(item)
```

---

## 3. 스케줄 권장

### 3.1 수집 주기

| 데이터 유형 | 권장 주기 | 이유 |
|-----------|---------|------|
| 입찰 공고 | 30~60분 | 신규 공고 실시간성 확보 |
| 낙찰 정보 | 6~12시간 | 개찰 후 반영 지연 (1~3일) |
| 히스토리 분석 | 일 1회 (03:00) | 대용량 집계 작업 |

### 3.2 API 점검 시간 회피
- **공공데이터포털 점검**: 매일 00:00~02:00 (추정)
- **권장 실행 시간**: 02:30 이후
- **Cron 예시**:
```bash
# 입찰 공고 수집 (매 시간 30분)
30 * * * * /path/to/venv/bin/python /path/to/collect_bids.py --source real --pages 3 >> /logs/collect_bids.log 2>&1

# 낙찰 정보 수집 (매 6시간, 02:30 시작)
30 2,8,14,20 * * * /path/to/venv/bin/python /path/to/collect_awards.py --source real --pages 2 >> /logs/collect_awards.log 2>&1

# 큐 재처리 (매일 04:00)
0 4 * * * /path/to/venv/bin/python /path/to/retry_queue_processor.py >> /logs/retry.log 2>&1
```

### 3.3 트래픽 제한 대응
- 일 1,000회 제한 → 시간당 최대 41회
- 입찰 수집 (3페이지) = 3회 API 호출
- 낙찰 수집 (2페이지) = 2회 API 호출
- **안전 여유**: 시간당 10회 이하 권장

---

## 4. 로그 필드 (표준)

### 4.1 필수 로그 필드

```python
log_entry = {
    "timestamp": "2025-12-31T22:30:15.123Z",  # ISO 8601
    "trace_id": "20251231_223015_bid_001",    # 추적 ID
    "operation": "getBidPblancListInfoServc01",
    "method": "GET",
    "url": "http://apis.data.go.kr/...",
    "params": {
        "pageNo": 2,
        "numOfRows": 100
    },
    "status_code": 200,
    "response_time_ms": 1234,
    "retry_count": 0,
    "error_message": null,
    "records_collected": 100,
    "records_normalized": 98,
    "records_skipped": 2
}
```

### 4.2 로그 레벨

| 레벨 | 용도 | 예시 |
|------|------|------|
| DEBUG | 상세 디버깅 정보 | API 요청/응답 전체 |
| INFO | 정상 작동 정보 | 페이지 수집 완료, 저장 성공 |
| WARNING | 경고 (작동 가능) | 일부 필드 누락, 재시도 중 |
| ERROR | 오류 (작동 불가) | API 호출 실패, 파싱 오류 |
| CRITICAL | 치명적 오류 | 인증 실패, 시스템 중단 |

### 4.3 로그 파일 구조
```
logs/
├── collect_bids_20251231.log     # 일별 입찰 수집 로그
├── collect_awards_20251231.log   # 일별 낙찰 수집 로그
├── error_20251231.log            # 오류 전용 로그
└── api_calls_20251231.jsonl      # API 호출 이력 (JSON Lines)
```

### 4.4 로깅 구현 예시
```python
import logging
from datetime import datetime

# 로거 설정
logger = logging.getLogger('bid_collector')
logger.setLevel(logging.INFO)

# 파일 핸들러 (일별 로그)
log_filename = f"logs/collect_bids_{datetime.now().strftime('%Y%m%d')}.log"
file_handler = logging.FileHandler(log_filename, encoding='utf-8')
file_handler.setLevel(logging.INFO)

# 포맷터
formatter = logging.Formatter(
    '%(asctime)s [%(levelname)s] [%(trace_id)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# 사용 예시
logger.info(
    f"API 호출 성공: operation={operation}, status={status_code}, records={count}",
    extra={'trace_id': trace_id}
)
```

---

## 5. 긴급 대응 프로세스

### 5.1 장애 감지
- 연속 3회 실패 → Slack/Email 알림
- 재시도 큐 100건 초과 → 관리자 알림
- 수집 중단 6시간 초과 → 긴급 점검

### 5.2 수동 복구 절차
```bash
# 1. 로그 확인
tail -f logs/collect_bids_$(date +%Y%m%d).log

# 2. 재시도 큐 확인
cat retry_queue.json | jq '.queue | length'

# 3. 수동 재실행 (특정 날짜)
python collect_bids.py --source real --pages 5 --run-id manual_$(date +%Y%m%d_%H%M%S)

# 4. 품질 검증
python data_quality.py --source real --input collected_bids_real_manual_*.json --run-id manual
```

### 5.3 모니터링 지표
- API 호출 성공률: > 95%
- 평균 응답 시간: < 3초
- 재시도 큐 누적: < 50건
- 데이터 품질: PASS 또는 CONDITIONAL PASS

---

## 6. 예외 상황 및 대응

### 6.1 공공데이터포털 점검 공지
- 공지 URL: https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15012710
- 점검 기간: 사전 공지 후 1~4시간
- 대응:
  1. 점검 시간대 스케줄 일시 중지
  2. 점검 종료 후 큐 재처리
  3. 누락 기간 데이터 별도 수집

### 6.2 API 응답 스키마 변경
- 분기별 API 버전 업데이트 가능
- 대응:
  1. 응답 필드 변경 감지 (unknown fields 로깅)
  2. normalize 로직 업데이트
  3. 하위 호환성 유지 (기존 필드 우선)

### 6.3 대용량 데이터 수집
- 1,000페이지 이상 수집 시:
  1. 날짜 범위 분할 (주 단위)
  2. 병렬 처리 (멀티 프로세스)
  3. Rate Limit 준수 (페이지 간 2초 대기)

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.2 | 2025-12-31 | Step 2 운영 규칙 초안 작성 |
| v1.1 | 2025-12-31 | Mock 모드 기본 운영 가이드 |

---

**문서 소유자**: Smart Bid Radar 개발팀  
**검토자**: AI 개발자  
**승인일**: 2025-12-31

**연락처**:
- 기술 지원: tech-support@smartbidradar.com
- 장애 신고: ops-emergency@smartbidradar.com
