# Step 3-A: FastAPI 서버 API 문서

> **목표**: Step 2 수집 스크립트를 FastAPI로 감싸 HTTP API로 제공

## 📋 개요

- **서버**: FastAPI + Uvicorn
- **포트**: 8003
- **원칙**: Step 2 코드는 수정하지 않고 subprocess로 호출
- **모드**: Mock/Real 전환 지원

---

## 🚀 서버 실행

### 1. 의존성 설치

```bash
cd python
pip install -r requirements_api.txt
```

### 2. 서버 기동

```bash
# 방법 1: Python 직접 실행
python api_server.py

# 방법 2: Uvicorn 명령어
uvicorn api_server:app --host 0.0.0.0 --port 8003 --reload

# 백그라운드 실행 (Windows)
Start-Process python -ArgumentList "api_server.py" -WindowStyle Hidden
```

### 3. 헬스 체크

```bash
curl http://localhost:8003/health
```

**응답 예시:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-31T23:59:59"
}
```

---

## 📡 API 엔드포인트

### 1. 루트 (서비스 정보)

**GET /**

```bash
curl http://localhost:8003/
```

**응답:**
```json
{
  "service": "Smart Bid Radar API",
  "version": "1.0.0",
  "step": "3-A (FastAPI 서버화)",
  "endpoints": {
    "health": "/health",
    "collect_bids": "POST /v1/collect/bids",
    "collect_awards": "POST /v1/collect/awards",
    "run_status": "GET /v1/runs/{run_id}"
  },
  "docs": "/docs"
}
```

---

### 2. 입찰 공고 수집

**POST /v1/collect/bids**

#### 요청 (JSON Body)

```json
{
  "mode": "mock",           // "mock" 또는 "real"
  "run_id": "test001",      // 선택사항 (미지정시 자동 생성)
  "pages": 3,               // 페이지 수 (1-10)
  "count": 200,             // Mock 모드시 레코드 수
  "force": false            // 기존 파일 덮어쓰기 여부
}
```

#### 응답 (JSON)

```json
{
  "status": "completed",                    // "completed" 또는 "failed"
  "run_id": "test001",
  "trace_id": "trace_a1b2c3d4e5f6",
  "fetched_items": 200,
  "stored_items": 200,
  "errors_count": 0,
  "duration_sec": 0.45,
  "raw_file_path": "collected_bids_mock_test001.json",
  "error_message": null
}
```

#### cURL 예제

**Mock 모드 (200건)**:
```bash
curl -X POST http://localhost:8003/v1/collect/bids \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "mock",
    "run_id": "api_test_001",
    "pages": 3,
    "count": 200
  }'
```

**Real 모드 (3페이지, 최대 300건)**:
```bash
curl -X POST http://localhost:8003/v1/collect/bids \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "real",
    "run_id": "prod_001",
    "pages": 3
  }'
```

---

### 3. 낙찰 정보 수집

**POST /v1/collect/awards**

#### 요청 (JSON Body)

```json
{
  "mode": "mock",
  "run_id": "test002",
  "pages": 2,
  "count": 60,
  "bids_file": "collected_bids_mock_test001.json"  // 조인키 매칭용
}
```

#### 응답 (JSON)

```json
{
  "status": "completed",
  "run_id": "test002",
  "trace_id": "trace_f6e5d4c3b2a1",
  "fetched_items": 60,
  "stored_items": 60,
  "errors_count": 0,
  "duration_sec": 0.32,
  "raw_file_path": "collected_awards_mock_test002.json",
  "error_message": null
}
```

#### cURL 예제

```bash
curl -X POST http://localhost:8003/v1/collect/awards \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "mock",
    "run_id": "api_test_002",
    "pages": 2,
    "count": 60,
    "bids_file": "collected_bids_mock_api_test_001.json"
  }'
```

---

### 4. 실행 상태 조회

**GET /v1/runs/{run_id}**

#### 쿼리 파라미터

- `data_type` (선택): "bids" 또는 "awards" (기본값: "bids")

#### 응답 (JSON) - 파일 존재 시

```json
{
  "run_id": "test001",
  "exists": true,
  "file_path": "collected_bids_mock_test001.json",
  "file_size_bytes": 144008,
  "record_count": 200,
  "last_modified": "2025-12-31T23:50:00",
  "status": "completed"
}
```

#### 응답 (JSON) - 파일 없음

```json
{
  "run_id": "test999",
  "exists": false,
  "status": "not_found"
}
```

#### cURL 예제

```bash
# 입찰 데이터 조회
curl http://localhost:8003/v1/runs/api_test_001?data_type=bids

# 낙찰 데이터 조회
curl http://localhost:8003/v1/runs/api_test_002?data_type=awards
```

---

## 🔄 Mock ↔ Real 전환 방법

### Mock 모드 (API 승인 전 테스트)

```json
{
  "mode": "mock",
  "count": 200,    // Mock 전용 파라미터
  "pages": 3       // Mock에서는 무시됨
}
```

- 즉시 실행 가능
- 샘플 데이터 생성 (count 개수만큼)
- 품질 이슈 0.5% 미만

### Real 모드 (API 승인 후)

```json
{
  "mode": "real",
  "pages": 3       // 실제 페이지 수 (100건/페이지)
}
```

- 공공데이터포털 활용신청 승인 필요
- 환경 변수 `DATA_PORTAL_API_KEY` 설정 필수
- 재시도/큐잉 메커니즘 자동 동작

---

## 📊 로깅

### 로그 파일 위치

```
python/logs/api_server_YYYYMMDD.log
```

### 로그 필드

| 필드 | 설명 | 예시 |
|------|------|------|
| timestamp | 시각 | 2025-12-31 23:59:59 |
| trace_id | 고유 추적 ID | trace_a1b2c3d4e5f6 |
| run_id | 실행 ID | api_test_001 |
| endpoint | API 엔드포인트 | /v1/collect/bids |
| operation | 작업 구분 | collect_bids |
| status | 상태 | completed/failed |

### 로그 예시

```
2025-12-31 23:59:00 | api_server | INFO | [trace_a1b2c3d4e5f6] 입찰 수집 시작 | run_id=api_test_001, mode=mock, pages=3
2025-12-31 23:59:01 | api_server | INFO | [trace_a1b2c3d4e5f6] 입찰 수집 완료 | status=completed, fetched=200, duration=0.45s
```

---

## 🧪 테스트 시나리오

### 시나리오 1: Mock 모드 전체 흐름

```bash
# 1. 서버 기동
python api_server.py

# 2. 헬스 체크
curl http://localhost:8003/health

# 3. 입찰 수집 (Mock 200건)
curl -X POST http://localhost:8003/v1/collect/bids \
  -H "Content-Type: application/json" \
  -d '{"mode":"mock","run_id":"flow_test_001","count":200}'

# 4. 낙찰 수집 (Mock 60건)
curl -X POST http://localhost:8003/v1/collect/awards \
  -H "Content-Type: application/json" \
  -d '{"mode":"mock","run_id":"flow_test_002","count":60,"bids_file":"collected_bids_mock_flow_test_001.json"}'

# 5. 상태 조회
curl http://localhost:8003/v1/runs/flow_test_001?data_type=bids
curl http://localhost:8003/v1/runs/flow_test_002?data_type=awards

# 6. raw 파일 확인
Get-Item collected_bids_mock_flow_test_001.json
Get-Item collected_awards_mock_flow_test_002.json
```

### 시나리오 2: 중복 방지 확인

```bash
# 동일 run_id로 2회 실행
curl -X POST http://localhost:8003/v1/collect/bids \
  -H "Content-Type: application/json" \
  -d '{"mode":"mock","run_id":"dup_test","count":100}'

curl -X POST http://localhost:8003/v1/collect/bids \
  -H "Content-Type: application/json" \
  -d '{"mode":"mock","run_id":"dup_test","count":100}'

# 파일 크기 비교 (레코드 수 동일 확인)
Get-Item collected_bids_mock_dup_test.json | Select-Object Length
```

### 시나리오 3: 에러 핸들링

```bash
# 존재하지 않는 run_id 조회
curl http://localhost:8003/v1/runs/nonexistent

# 잘못된 mode 값
curl -X POST http://localhost:8003/v1/collect/bids \
  -H "Content-Type: application/json" \
  -d '{"mode":"invalid","count":100}'
# 기대: 400 Bad Request (Pydantic validation error)
```

---

## 🔐 보안 고려사항

### 현재 (Step 3-A)

- ⚠️ 인증/인가 없음 (개발용)
- ⚠️ Rate limiting 없음
- ✅ CORS 허용 (모든 오리진)

### 향후 개선 (Step 3-B 이후)

- [ ] JWT 기반 인증
- [ ] API Key 인증
- [ ] Rate limiting (IP 기반)
- [ ] Request validation 강화
- [ ] HTTPS 적용

---

## 🐛 트러블슈팅

### 1. 서버가 시작되지 않음

```bash
# 포트 충돌 확인
netstat -ano | findstr :8003

# 프로세스 종료 (Windows)
taskkill /PID <PID> /F
```

### 2. 스크립트 실행 실패 (FileNotFoundError)

```bash
# 현재 디렉토리 확인
pwd

# python 디렉토리에서 실행 필수
cd c:\pubcoding\pub_project_05\python
python api_server.py
```

### 3. 로그 파일 없음

```bash
# logs 디렉토리 수동 생성
mkdir logs

# 재시작
python api_server.py
```

### 4. collect_bids.py 호출 실패

```bash
# Step 2 스크립트 직접 테스트
python collect_bids.py --source mock --count 50 --run-id direct_test

# 정상 동작 확인 후 API 재시도
```

---

## 📈 성능 지표

### Mock 모드

- 입찰 200건: ~0.3-0.5초
- 낙찰 60건: ~0.2-0.3초
- 동시 요청: 테스트 안 됨 (Step 3-A는 순차 처리)

### Real 모드 (예상)

- 입찰 100건/페이지: ~5-10초/페이지
- 낙찰 100건/페이지: ~5-10초/페이지
- 재시도 포함 시: 최대 3분

---

## 📚 Swagger UI

FastAPI 자동 문서:

```
http://localhost:8003/docs
```

- 모든 API 인터랙티브 테스트 가능
- Request/Response 스키마 확인
- Try it out 버튼으로 즉시 실행

---

## ✅ 완료 조건 체크리스트

- [x] FastAPI 서버 구현 (api_server.py)
- [x] requirements_api.txt 작성
- [x] /health 엔드포인트
- [x] POST /v1/collect/bids
- [x] POST /v1/collect/awards
- [x] GET /v1/runs/{run_id}
- [x] 로깅 구현
- [x] Step 3-A 문서 작성

**다음 단계**: 서버 실행 및 Mock 모드 검증

```bash
cd python
pip install -r requirements_api.txt
python api_server.py
```

그 후 다른 터미널에서:

```bash
curl -X POST http://localhost:8003/v1/collect/bids -H "Content-Type: application/json" -d '{"mode":"mock","run_id":"step3_verify","count":100}'
```
