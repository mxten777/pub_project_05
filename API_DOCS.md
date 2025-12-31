# API 문서 (MVP v1.1)

> **중요**: 이 문서는 MVP 데모용 API 설계를 정의합니다. 실제 API 연동 전에는 mock 데이터로 동작합니다.

## 🎯 MVP v1.1 API 엔드포인트 구조

### API 서버 구성 (향후 구현)
```
Frontend (React/Vite)
    ↓
Firebase Functions (선택사항) 또는 Python FastAPI
    ↓
Python Backend Scripts
    ↓
Firestore Database
```

---

## 📡 Backend API Endpoints (Python)

### 1. 입찰 데이터 수집 API

#### `POST /api/collect-bids`
**설명**: 나라장터 API에서 입찰 데이터를 수집하여 Firestore에 저장

**Request Body**:
```json
{
  "days_back": 7,
  "limit": 100,
  "mock_mode": true
}
```

**Response**:
```json
{
  "success": true,
  "collected_count": 45,
  "saved_count": 42,
  "execution_time": "3.2s",
  "message": "데이터 수집 완료"
}
```

---

### 2. AI 예측 API

#### `POST /api/predict`
**설명**: 입찰 공고에 대한 예상 낙찰률 예측 (Baseline 모델)

**Request Body**:
```json
{
  "bid_id": "20250001-00001",
  "agency": "조달청",
  "category": "소프트웨어",
  "budget": 50000000,
  "region": "서울"
}
```

**Response**:
```json
{
  "success": true,
  "prediction": {
    "bid_id": "20250001-00001",
    "predicted_rate": 87.5,
    "confidence": 0.72,
    "range_min": 84.2,
    "range_max": 90.8,
    "recommended_strategy": "권장 투찰률",
    "strategies": [
      {
        "type": "aggressive",
        "rate": 90.5,
        "win_probability": 0.35,
        "description": "공격적 전략"
      },
      {
        "type": "recommended",
        "rate": 87.5,
        "win_probability": 0.72,
        "description": "권장 전략"
      },
      {
        "type": "conservative",
        "rate": 84.0,
        "win_probability": 0.88,
        "description": "보수적 전략"
      }
    ],
    "factors": {
      "agency_avg": 88.2,
      "category_avg": 86.8,
      "region_avg": 87.0,
      "budget_factor": 1.02,
      "competition_level": "medium"
    },
    "disclaimer": "이 예측은 참고용이며, 실제 낙찰률과 다를 수 있습니다.",
    "created_at": "2025-12-31T10:30:00Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "insufficient_data",
  "message": "예측에 필요한 히스토리 데이터가 부족합니다."
}
```

---

### 3. 문서 자동 생성 API

#### `POST /api/generate-document`
**설명**: 입찰 공고 기반 문서 자동 생성 (제안요약서, 체크리스트)

**Request Body**:
```json
{
  "bid_id": "20250001-00001",
  "template_type": "proposal_summary",
  "options": {
    "include_prediction": true,
    "include_history": true,
    "format": "markdown"
  }
}
```

**Response**:
```json
{
  "success": true,
  "document": {
    "id": "doc_20250001_001",
    "template_type": "proposal_summary",
    "title": "제안요약서 - 국가정보화 사업 운영",
    "content": "# 제안요약서\n\n## 1. 사업 개요...",
    "metadata": {
      "bid_id": "20250001-00001",
      "generated_at": "2025-12-31T10:35:00Z",
      "word_count": 2450,
      "ai_generated": false
    },
    "download_urls": {
      "markdown": "/downloads/doc_20250001_001.md",
      "pdf": "/downloads/doc_20250001_001.pdf",
      "docx": "/downloads/doc_20250001_001.docx"
    }
  }
}
```

**Template Types**:
- `proposal_summary`: 제안요약서
- `checklist`: 입찰 참여 체크리스트
- `analysis_report`: 기관별 분석 보고서

---

### 4. 인사이트 분석 API

#### `POST /api/analyze-insights`
**설명**: 기관/업종/지역별 입찰 히스토리 분석

**Request Body**:
```json
{
  "analysis_type": "agency",
  "target_name": "조달청",
  "period_months": 12
}
```

**Response**:
```json
{
  "success": true,
  "insights": {
    "type": "agency",
    "name": "조달청",
    "period": "2024-01 ~ 2025-01",
    "total_bids": 245,
    "average_budget": 75000000,
    "average_win_rate": 88.3,
    "average_competition": 4.2,
    "trend": 1.15,
    "top_categories": [
      {"name": "소프트웨어", "count": 89},
      {"name": "용역", "count": 67}
    ],
    "monthly_trends": [
      {"month": "2024-01", "bids": 18, "avg_rate": 87.5},
      {"month": "2024-02", "bids": 22, "avg_rate": 88.1}
    ]
  }
}
```

---

## 🗄️ Firestore 데이터 구조

### Bids Collection
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

### Predictions Collection
AI 예측 결과

```typescript
interface Prediction {
  id: string
  bidId: string
  predictedRate: number
  confidence: number
  rangeMin: number
  rangeMax: number
  strategies: {
    aggressive: { rate: number, probability: number }
    recommended: { rate: number, probability: number }
    conservative: { rate: number, probability: number }
  }
  factors: {
    agencyAvg: number
    categoryAvg: number
    regionAvg: number
    budgetFactor: number
  }
  disclaimer: string
  createdAt: string
}
```

### Documents Collection
생성된 문서

```typescript
interface GeneratedDocument {
  id: string
  bidId: string
  templateType: 'proposal_summary' | 'checklist' | 'analysis_report'
  title: string
  content: string        // Markdown 형식
  wordCount: number
  aiGenerated: boolean   // OpenAI 사용 여부
  createdAt: string
  downloadUrls?: {
    markdown?: string
    pdf?: string
    docx?: string
  }
}
```

---

## 🔧 Python Backend Script 구조

### 1. 데이터 수집 (collect_bids.py)

**주요 클래스**: `BidDataCollector`

**메서드**:
```python
def fetch_bid_announcements(days_back: int = 7, mock_mode: bool = True) -> List[Dict]
    """
    나라장터 API에서 입찰 공고 수집
    mock_mode=True: 샘플 데이터 반환 (데모용)
    mock_mode=False: 실제 API 호출
    """

def transform_bid_data(raw_data: List[Dict]) -> List[Dict]
    """
    API 원본 데이터를 Firestore 형식으로 변환
    """

    """
    Firestore에 배치로 저장
    """
```

---

### 2. AI 예측 모델 (ml_prediction.py)

**주요 클래스**: `BaselinePredictionModel`

**메서드**:
```python
def predict(bid_data: Dict) -> Dict
    """
    입찰 공고에 대한 낙찰률 예측 (Baseline 알고리즘)
    
    알고리즘:
    1. 기관별 평균 낙찰률 (40% 가중치)
    2. 업종별 평균 낙찰률 (30% 가중치)
    3. 지역별 평균 낙찰률 (20% 가중치)
    4. 예산 규모 보정 (10% 가중치)
    """

def calculate_confidence(historical_count: int) -> float
    """
    히스토리 데이터 개수 기반 신뢰도 계산
    - 30건 이상: 0.8+
    - 10~30건: 0.5~0.8
    - 10건 미만: 0.3~0.5
    """

def generate_strategies(predicted_rate: float) -> List[Dict]
    """
    3가지 투찰 전략 생성 (공격적/권장/보수적)
    """
```

---

### 3. 문서 생성기 (document_generator.py)

**주요 클래스**: `DocumentGenerator`

**메서드**:
```python
def generate_proposal_summary(bid_data: Dict, prediction: Dict = None) -> str
    """
    제안요약서 생성 (Markdown 형식)
    
    섹션:
    - 사업 개요
    - 발주기관 정보
    - 주요 입찰 조건
    - 예상 경쟁률 및 투찰 전략 (예측 데이터 포함 시)
    - 체크리스트
    """

def generate_checklist(bid_data: Dict) -> str
    """
    입찰 참여 체크리스트 생성
    """

def export_to_docx(markdown_content: str, output_path: str) -> str
    """
    Markdown → Word 문서 변환
    """

def export_to_pdf(markdown_content: str, output_path: str) -> str
    """
    Markdown → PDF 변환 (reportlab 사용)
    """
```

---

### 4. 인사이트 분석 (analyze_insights.py)

**주요 클래스**: `BidAnalyzer`

**메서드**:
```python
def analyze_by_agency(period_months: int = 12) -> List[Dict]
    """기관별 통계 분석"""

def analyze_by_category(period_months: int = 12) -> List[Dict]
    """업종별 통계 분석"""

def analyze_by_region(period_months: int = 12) -> List[Dict]
    """지역별 통계 분석"""
```

---

## 🔌 Frontend-Backend 연동 구조

### MVP v1.1 단계별 전환 전략

#### Phase 1: Mock Data (현재)
```typescript
// src/lib/api.ts
export async function predictBidRate(bidId: string) {
  // Mock 데이터 반환
  return mockPrediction;
}
```

#### Phase 2: Firebase Functions (선택)
```typescript
// Firebase Functions로 Python 스크립트 호출
import { httpsCallable } from 'firebase/functions';

const predictBidRate = httpsCallable(functions, 'predictBidRate');
const result = await predictBidRate({ bidId: '20250001-00001' });
```

#### Phase 3: Direct Python API (FastAPI)
```typescript
// Python FastAPI 서버 직접 호출
const response = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  body: JSON.stringify({ bid_id: bidId })
});
```

---

## 🚨 MVP 한계 및 고지사항

### 현재 구현 범위 (MVP v1.1)

✅ **구현됨**:
- API 엔드포인트 설계 완료
- Python 스크립트 구조 정의
- Firestore 데이터 스키마 확정
- Mock 데이터 기반 프론트엔드

⚠️ **제한사항**:
- **나라장터 API**: 실제 연동 미완료 (mock 모드로 실행)
- **ML 모델**: Baseline 알고리즘만 구현 (XGBoost/LightGBM 미적용)
- **AI 문서 생성**: OpenAI API 선택사항 (템플릿 기반 기본 제공)
- **서버 배포**: 로컬 실행만 지원 (FastAPI 서버 미배포)

### 법적 고지사항

> **중요**: 본 시스템은 **의사결정 참고용 도구**이며, 자동 입찰 시스템이 아닙니다.
> 
> - 예측 결과는 통계적 참고치이며 실제 낙찰률과 다를 수 있습니다.
> - 입찰 참여 최종 결정은 사용자 책임입니다.
> - 조달 관련 법규를 준수해야 합니다.

---

## 🛣️ 로드맵 (MVP → v2.0)

### Short-term (1~2개월)
- [ ] 나라장터 실제 API 연동
- [ ] FastAPI 서버 구축 및 배포
- [ ] Firebase Functions 통합
- [ ] 실시간 알림 시스템

### Mid-term (3~6개월)
- [ ] ML 모델 고도화 (XGBoost 적용)
- [ ] OpenAI API 완전 통합
- [ ] 자동 스케줄링 (매일 데이터 수집)
- [ ] 히스토리 기반 트렌드 분석

### Long-term (6개월+)
- [ ] 엔터프라이즈 기능 (팀 협업)
- [ ] 커스텀 AI 모델 학습
- [ ] 모바일 앱 출시
- [ ] API 파트너십

---

## 📚 참고 자료

- [나라장터 공공데이터 API](https://www.data.go.kr)
- [Firebase Documentation](https://firebase.google.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Python-DOCX](https://python-docx.readthedocs.io)

---

**마지막 업데이트**: 2025-12-31  
**문서 버전**: MVP v1.1
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
