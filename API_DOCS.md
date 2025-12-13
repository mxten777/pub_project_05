# API 문서

## Frontend API

### Firestore 데이터 구조

#### Bids Collection
입찰 공고 데이터

```typescript
interface Bid {
  id: string              // 입찰공고번호
  title: string           // 공고명
  agency: string          // 발주기관
  category: string        // 업종 (건설, 용역, 물품, 소프트웨어)
  region: string          // 지역
  budget: number          // 추정가격 (원)
  deadline: string        // 마감일 (ISO 8601)
  createdAt: string       // 생성일
  updatedAt?: string      // 수정일
  status: 'active' | 'closed' | 'modified'
  description?: string    // 공고 상세
  bidMethod?: string      // 입찰방식
  estimatedPrice?: number // 추정가
  announcementDate?: string
}
```

## Backend API (Python)

### 1. 데이터 수집 (collect_bids.py)

#### BidDataCollector

**메서드**

```python
fetch_bid_announcements(days_back: int = 7) -> List[Dict]
```
- 최근 N일간의 입찰 공고 수집
- 나라장터 API 호출

```python
transform_bid_data(raw_data: List[Dict]) -> List[Dict]
```
- API 원본 데이터를 Firestore 형식으로 변환

```python
save_to_firestore(bids: List[Dict]) -> int
```
- Firestore에 배치로 저장

### 2. 인사이트 분석 (analyze_insights.py)

#### BidAnalyzer

**메서드**

```python
analyze_by_agency() -> List[Dict]
analyze_by_category() -> List[Dict]
analyze_by_region() -> List[Dict]
```
- 기관별/업종별/지역별 통계 생성

**반환 형식**

```python
{
  'type': 'agency' | 'category' | 'region',
  'name': str,
  'totalBids': int,
  'averageBudget': float,
  'averageWinRate': float,
  'averageCompetition': float,
  'period': str,
  'trend': float
}
```

### 3. ML 예측 (ml_prediction.py)

#### BidPredictionModel

**메서드**

```python
predict(input_data: dict) -> dict
```

**입력**
```python
{
  'agency': str,
  'category': str,
  'region': str,
  'budget': float,
  'bidMethod': str,
  'biddersCount': int
}
```

**출력**
```python
{
  'predictedRate': float,      # 예상 낙찰률 (%)
  'rangeMin': float,            # 신뢰구간 최소값
  'rangeMax': float,            # 신뢰구간 최대값
  'recommendedBid': float,      # 권장 투찰가 (원)
  'confidence': float,          # 신뢰도 (%)
  'factors': {
    'agency': float,
    'category': float,
    'budget': float,
    'historical': float
  }
}
```

### 4. 문서 생성 (document_generator.py)

#### DocumentGenerator

**메서드**

```python
generate_proposal(bid_info: dict, company_info: dict) -> str
```
- 제안요약서 생성

```python
generate_analysis_report(bid_info: dict, analysis_data: dict) -> str
```
- 분석 보고서 생성

```python
generate_checklist(bid_info: dict) -> str
```
- 입찰 체크리스트 생성

```python
export_to_word(content: str, filename: str)
export_to_pdf(content: str, filename: str)
```
- Word/PDF로 내보내기

## 공공데이터포털 API

### 나라장터 입찰공고 조회

**Endpoint**
```
GET http://apis.data.go.kr/1230000/BidPublicInfoService04/getBidPblancListInfoServc01
```

**Parameters**
- `serviceKey`: API 인증키
- `numOfRows`: 한 페이지 결과 수
- `pageNo`: 페이지 번호
- `inqryDiv`: 조회구분 (1: 물품, 2: 용역, 3: 공사)
- `inqryBgnDt`: 조회 시작일 (YYYYMMDD)
- `inqryEndDt`: 조회 종료일 (YYYYMMDD)
- `type`: 응답 형식 (json, xml)

**Response**
```json
{
  "response": {
    "body": {
      "items": [
        {
          "bidNtceNo": "공고번호",
          "bidNtceNm": "공고명",
          "ntceInsttNm": "공고기관",
          "asignBdgtAmt": "예산금액",
          "presmptPrce": "추정가격",
          "bidClseDt": "입찰마감일시",
          "bidNtceDt": "공고일시",
          "bidMethdNm": "입찰방법"
        }
      ]
    }
  }
}
```

## Firebase Cloud Functions (향후 확장)

### 예정된 Functions

```typescript
// 신규 공고 알림
exports.notifyNewBids = functions.firestore
  .document('bids/{bidId}')
  .onCreate(async (snap, context) => {
    // FCM 푸시 알림 전송
  })

// 마감임박 알림
exports.notifyDeadline = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    // 마감 24시간 전 공고 확인 및 알림
  })

// AI 문서 생성 (서버사이드)
exports.generateDocument = functions.https
  .onCall(async (data, context) => {
    // OpenAI API 호출
    // 문서 생성 및 저장
  })
```

## 인증 & 보안

### Firebase Authentication

```typescript
// 로그인
const userCredential = await signInWithEmailAndPassword(auth, email, password)

// 회원가입
const userCredential = await createUserWithEmailAndPassword(auth, email, password)

// 로그아웃
await signOut(auth)
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bids/{bidId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Rate Limits

- **나라장터 API**: 일 1,000건 (무료), 10,000건 (유료)
- **OpenAI API**: 사용량 기반 과금
- **Firestore**: 
  - 읽기: 50,000건/일 (무료)
  - 쓰기: 20,000건/일 (무료)

## 에러 처리

### 공통 에러 코드

```typescript
{
  "code": "ERROR_CODE",
  "message": "에러 메시지",
  "details": {}
}
```

**에러 코드**
- `INVALID_API_KEY`: API 키 오류
- `RATE_LIMIT_EXCEEDED`: 호출 한도 초과
- `DATA_NOT_FOUND`: 데이터 없음
- `PERMISSION_DENIED`: 권한 없음
- `INTERNAL_ERROR`: 서버 오류
