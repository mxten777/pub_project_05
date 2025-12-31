# API 연동 설계서 (API Integration Specification)

**프로젝트**: Smart Bid Radar - 나라장터 입찰/낙찰 정보 수집  
**버전**: v1.2 (Step 2 - Real API Integration)  
**작성일**: 2025-12-31  
**목적**: 공공데이터포털 나라장터 API 실연동 설계 및 최소 수집 파이프라인 구축

---

## 1. 연동 대상 API (고정)

### 1.1 입찰공고정보서비스
- **API 명**: 조달청_나라장터 입찰공고정보서비스 04
- **서비스 URL**: `http://apis.data.go.kr/1230000/BidPublicInfoService04`
- **오퍼레이션**:
  1. `getBidPblancListInfoServc01` (입찰공고 목록 조회)
  2. `getBidPblancDetailInfoServc01` (입찰공고 상세 조회)

### 1.2 낙찰정보서비스
- **API 명**: 조달청_나라장터 낙찰정보서비스
- **서비스 URL**: `http://apis.data.go.kr/1230000/ScsbidInfoService04`
- **오퍼레이션**:
  1. `getOpengInfoListServc01` (개찰결과 목록 조회)
  2. `getOpengInfoDetailServc01` (개찰결과 상세 조회)

---

## 2. 요청 파라미터 설계

### 2.1 입찰공고 목록 (getBidPblancListInfoServc01)

| 파라미터 | 필수 | 타입 | 설명 | 기본값 |
|---------|------|------|------|--------|
| `serviceKey` | Y | String | 공공데이터포털 발급 인증키 | - |
| `numOfRows` | Y | Integer | 한 페이지 결과 수 | 100 |
| `pageNo` | Y | Integer | 페이지 번호 | 1 |
| `inqryDiv` | Y | String | 검색 기준 (1: 공고일, 2: 입찰마감일) | 1 |
| `inqryBgnDt` | Y | String | 조회 시작일 (YYYYMMDD) | today-7 |
| `inqryEndDt` | Y | String | 조회 종료일 (YYYYMMDD) | today |
| `type` | N | String | 응답 형식 (xml/json) | json |

**페이지네이션 전략**:
- 초기: `pageNo=1`, `numOfRows=100`
- 200건 이상 수집 목표 → 최대 3페이지(pageNo=1~3) 순차 호출
- `totalCount` < (pageNo * numOfRows) 이면 종료

### 2.2 개찰결과 목록 (getOpengInfoListServc01)

| 파라미터 | 필수 | 타입 | 설명 | 기본값 |
|---------|------|------|------|--------|
| `serviceKey` | Y | String | 공공데이터포털 발급 인증키 | - |
| `numOfRows` | Y | Integer | 한 페이지 결과 수 | 100 |
| `pageNo` | Y | Integer | 페이지 번호 | 1 |
| `inqryDiv` | Y | String | 검색 기준 (1: 개찰일) | 1 |
| `inqryBgnDt` | Y | String | 조회 시작일 (YYYYMMDD) | today-30 |
| `inqryEndDt` | Y | String | 조회 종료일 (YYYYMMDD) | today |
| `type` | N | String | 응답 형식 (xml/json) | json |

---

## 3. 응답 필드 → Firestore 스키마 매핑

### 3.1 입찰공고 (bids 컬렉션)

| API 응답 필드 | Firestore 필드 | 타입 | 필수 | 변환 규칙 |
|--------------|---------------|------|------|----------|
| `bidNtceNo` | `id` | String | Y | 입찰공고번호 (PK) |
| `bidNtceNm` | `title` | String | Y | 공고명 (빈값 → "제목없음") |
| `ntceInsttNm` | `agency` | String | Y | 공고기관명 (빈값 → "기관미상") |
| `bidNtceNm` | `category` | String | Y | 업종 분류 (키워드 기반 매핑) |
| `ntceInsttNm` | `region` | String | N | 지역 추출 (기관명에서 파싱) |
| `asignBdgtAmt` | `budget` | Number | N | 배정예산 (숫자변환 실패 → null) |
| `presmptPrce` | `estimatedPrice` | Number | N | 추정가격 (숫자변환 실패 → null) |
| `bidClseDt` | `deadline` | String | N | 입찰마감일시 (ISO 8601, 파싱 실패 → null) |
| `bidNtceDt` | `announcementDate` | String | N | 공고일자 (ISO 8601, 파싱 실패 → null) |
| `bidMethdNm` | `bidMethod` | String | N | 입찰방법 (빈값 → null) |
| `bidNtceDtlUrl` | `detailUrl` | String | N | 상세 URL |
| - | `status` | String | Y | 고정값: "active" |
| - | `createdAt` | String | Y | 수집 시각 (ISO 8601) |
| - | `source` | String | Y | 고정값: "g2b_api" |

**최소 보장 필드**: `id`, `title`, `agency`, `status`, `createdAt`, `source`  
**결측 허용 필드**: `budget`, `estimatedPrice`, `deadline`, `region`, `bidMethod`

### 3.2 낙찰정보 (history 컬렉션)

| API 응답 필드 | Firestore 필드 | 타입 | 필수 | 변환 규칙 |
|--------------|---------------|------|------|----------|
| `bidNtceNo` | `bidId` | String | Y | 입찰공고번호 (조인키) |
| `opengDt` | `opengDate` | String | N | 개찰일자 (ISO 8601) |
| `rbidCnt` | `biddersCount` | Number | N | 참여업체 수 (정수) |
| `sucsfbidAmt` | `winnerAmount` | Number | N | 낙찰금액 |
| `sucsfbidRate` | `winnerRate` | Number | N | 낙찰률 (%) |
| `sucsfbidCorpNm` | `winnerCompany` | String | N | 낙찰업체명 |
| - | `completedAt` | String | Y | 수집 시각 (ISO 8601) |
| - | `source` | String | Y | 고정값: "g2b_api" |

**최소 보장 필드**: `bidId`, `completedAt`, `source`  
**결측 허용 필드**: `opengDate`, `biddersCount`, `winnerAmount`, `winnerRate`, `winnerCompany`

---

## 4. 조인키 전략

### 4.1 조인키 정의
- **Primary Key**: `bidNtceNo` (입찰공고번호)
- **Foreign Key**: 낙찰 테이블의 `bidNtceNo` → 입찰 테이블의 `bidNtceNo`

### 4.2 매칭 로직
```python
# 1. 입찰 데이터 수집 → collected_bids_real_<runid>.json
# 2. 낙찰 데이터 수집 → collected_awards_real_<runid>.json
# 3. 조인키 매칭 체크
bid_ids = set([b['id'] for b in bids])
matched_awards = [a for a in awards if a['bidId'] in bid_ids]
match_rate = len(matched_awards) / len(awards) * 100 if awards else 0
```

### 4.3 매칭율 목표
- **최소 목표**: 30% (입찰은 많지만 낙찰은 일부만)
- **정상 범위**: 30~60%
- **높은 매칭**: 60% 이상 (낙찰 중심 조회 시)

---

## 5. 제한사항 및 결측 허용 정책

### 5.1 API 제한사항
1. **호출 횟수 제한**:
   - 일반 인증키: 1,000회/일
   - 프리미엄 인증키: 10,000회/일
   - **대응**: 수집 주기를 30~60분으로 제한

2. **응답 크기 제한**:
   - 최대 1,000건/요청
   - **대응**: numOfRows=100으로 제한, 페이지네이션 활용

3. **운영 시간**:
   - API 점검: 매일 00:00~02:00 (추정)
   - **대응**: 스케줄러는 02:00 이후 실행

### 5.2 결측 허용 정책

| 필드 | 결측 허용 | 기본값 | 품질 게이트 영향 |
|------|----------|-------|----------------|
| `id` | **불허** | - | FAIL 처리 |
| `title` | **불허** | "제목없음" | FAIL 처리 |
| `agency` | **불허** | "기관미상" | FAIL 처리 |
| `status` | **불허** | "active" | FAIL 처리 |
| `createdAt` | **불허** | 수집시각 | FAIL 처리 |
| `budget` | 허용 | null | 파싱 오류율 < 2% |
| `deadline` | 허용 | null | 파싱 오류율 < 1% |
| `region` | 허용 | "기타" | - |
| `category` | 허용 | "기타" | - |

### 5.3 데이터 정규화 규칙
```python
def normalize_bid(raw_item):
    """API 응답 → Firestore 스키마 변환"""
    return {
        'id': raw_item.get('bidNtceNo', '').strip() or None,  # 빈값 불허
        'title': raw_item.get('bidNtceNm', '').strip() or "제목없음",
        'agency': raw_item.get('ntceInsttNm', '').strip() or "기관미상",
        'budget': parse_number(raw_item.get('asignBdgtAmt')),  # 실패 → null
        'deadline': parse_date(raw_item.get('bidClseDt')),  # 실패 → null
        'status': 'active',
        'createdAt': datetime.now().isoformat(),
        'source': 'g2b_api'
    }

def parse_number(value):
    """숫자 변환 (실패 시 null)"""
    try:
        return float(str(value).replace(',', ''))
    except:
        return None  # 0으로 만들지 않음!

def parse_date(value):
    """날짜 변환 (실패 시 null)"""
    try:
        if len(value) >= 8:
            return datetime.strptime(value[:8], '%Y%m%d').isoformat()
    except:
        return None
```

---

## 6. 오류 처리 전략

### 6.1 HTTP 상태 코드 대응

| 상태 코드 | 의미 | 대응 전략 |
|----------|------|----------|
| 200 | 성공 | 정상 처리 |
| 429 | Rate Limit 초과 | 30초 대기 후 재시도 (최대 3회) |
| 500, 502, 503 | 서버 오류 | 60초 대기 후 재시도 (최대 3회) |
| 401, 403 | 인증 오류 | 즉시 중단, 로그 기록 |
| 기타 4xx | 요청 오류 | 즉시 중단, 로그 기록 |

### 6.2 재시도 로직
```python
import time
from typing import Optional

def api_call_with_retry(url, params, max_retries=3):
    """재시도 로직 포함 API 호출"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                wait_time = 30 * (attempt + 1)  # 30, 60, 90초
                print(f"⚠️ Rate Limit 초과. {wait_time}초 대기 중...")
                time.sleep(wait_time)
            elif response.status_code >= 500:
                wait_time = 60
                print(f"⚠️ 서버 오류 ({response.status_code}). {wait_time}초 대기 중...")
                time.sleep(wait_time)
            else:
                print(f"❌ API 오류: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ 요청 실패: {e}")
            if attempt < max_retries - 1:
                time.sleep(30)
    
    print(f"❌ {max_retries}회 재시도 실패. 건너뜀.")
    return None
```

### 6.3 큐잉 전략
- 재시도 실패 시 `retry_queue.json`에 적재
- 다음 실행 시 큐 우선 처리
- 큐 포맷:
```json
{
  "queue": [
    {
      "operation": "getBidPblancListInfoServc01",
      "params": {"pageNo": 2, "inqryBgnDt": "20251201"},
      "failed_at": "2025-12-31T22:00:00",
      "retry_count": 3
    }
  ]
}
```

---

## 7. 품질 게이트 기준

### 7.1 수집 후 검증 명령어
```bash
python data_quality.py --source real --input collected_bids_real_<runid>.json --run-id <runid>
```

### 7.2 합격 기준
- **PASS**: 핵심 필드 누락률 < 1%, 파싱 오류율 < 2%, 중복률 < 3%
- **CONDITIONAL PASS**: 1~2개 기준 미충족 (정제 후 사용 가능)
- **FAIL**: 3개 이상 기준 미충족 → 수집 로직 재점검 필요

### 7.3 예상 시나리오
- **Mock 200건**: PASS (의도적 오류 0.5% 미만)
- **Real 200건 (초기)**: CONDITIONAL PASS (budget/deadline null 다수)
- **Real 1,000건 (안정화 후)**: PASS

---

## 8. 실행 명령어 예시

### 8.1 입찰 데이터 수집
```bash
# Mock 모드 (테스트)
python collect_bids.py --source mock --count 200 --run-id test001

# Real 모드 (실연동)
python collect_bids.py --source real --pages 3 --run-id prod001
```

### 8.2 낙찰 데이터 수집
```bash
# Mock 모드
python collect_awards.py --source mock --count 50 --run-id test001

# Real 모드
python collect_awards.py --source real --pages 2 --run-id prod001
```

### 8.3 품질 검증
```bash
python data_quality.py --source real --input collected_bids_real_prod001.json --run-id prod001
python data_quality.py --source real --input collected_awards_real_prod001.json --run-id prod001
```

---

## 9. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.2 | 2025-12-31 | 실연동 설계 완료 (Step 2) |
| v1.1 | 2025-12-31 | Mock 모드 기본 설계 (MVP v1.1) |
| v1.0 | 2025-12-25 | 초기 API 문서 작성 |

---

**문서 소유자**: Smart Bid Radar 개발팀  
**검토자**: AI 개발자  
**승인일**: 2025-12-31
