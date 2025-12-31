# 스마트 입찰·조달 인텔리전스 플랫폼 (Smart Bid Radar)

> 나라장터 기반 AI 입찰 예측 및 문서 자동화 플랫폼 MVP

## 📋 프로젝트 개요

**스마트 입찰·조달 인텔리전스 플랫폼**은 공공데이터포털의 나라장터 API를 활용하여 입찰 정보를 자동 수집·분석하고, AI 기반 낙찰률 예측 및 문서 자동 생성 기능을 제공하는 SaaS 플랫폼입니다.

### 🎯 핵심 가치

- **정보 자동화** - 입찰·낙찰·계약 정보 자동 수집 및 구조화
- **데이터 인사이트** - 업종/기관/지역 기반 히스토리 분석
- **AI 예측 모델** - 예상 낙찰률 및 투찰가 예측
- **문서 자동 생성** - 보고서/제안서/요약서 자동화

## 🚀 주요 기능

### 1️⃣ 실시간 입찰 레이더
- 업종/지역/예산/키워드 기반 고급 필터
- 신규 공고·마감임박·변경공고 알림
- 공고 자동 요약 및 핵심 조건 분석
- 사용자별 관심 리스트 저장

### 2️⃣ 입찰 히스토리 분석 대시보드
- 기관별/업종별/지역별 발주 트렌드
- 경쟁률·낙찰률·평균 예산 등 KPI 제공
- 기관 성향 분석 (낙찰률 패턴)

### 3️⃣ AI 기반 예상투찰가 예측
- XGBoost·LightGBM 기반 ML 모델
- 예상 낙찰률 범위 (신뢰구간) 제공
- 기관·업종 특성 기반 권장 투찰 전략

### 4️⃣ AI 문서 자동 생성기
- 제안요약서 자동 생성
- 입찰 참여 체크리스트
- 기관별 분석 보고서
- PPT, Word, PDF 변환 지원

## 🛠 기술 스택

### Frontend (Vibe 코딩 표준)
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **State**: Zustand
- **Auth/DB**: Firebase (Auth, Firestore)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Deploy**: Vercel

### Backend (Python)
- **Data Collection**: Requests, Pandas, BeautifulSoup
- **ML**: XGBoost, LightGBM, Scikit-learn
- **AI**: OpenAI API, LangChain
- **Database**: Firebase Admin SDK, Firestore
- **Automation**: Schedule, Python-dotenv
- **Documents**: python-docx, reportlab

## 📁 프로젝트 구조

```
pub_project_05/
├── src/                      # 프론트엔드 소스
│   ├── components/          # React 컴포넌트
│   │   └── Layout.tsx       # 레이아웃 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Dashboard.tsx    # 대시보드
│   │   ├── BidRadar.tsx     # 입찰 레이더
│   │   ├── BidDetail.tsx    # 입찰 상세
│   │   ├── Analytics.tsx    # 분석 대시보드
│   │   ├── Prediction.tsx   # 투찰가 예측
│   │   ├── Documents.tsx    # 문서 자동화
│   │   └── Settings.tsx     # 설정
│   ├── lib/                 # 라이브러리
│   │   └── firebase.ts      # Firebase 설정
│   ├── store/               # 상태 관리
│   │   └── bidStore.ts      # 입찰 데이터 스토어
│   ├── types/               # TypeScript 타입
│   │   └── index.ts         # 타입 정의
│   ├── App.tsx              # 메인 앱
│   ├── main.tsx             # 진입점
│   └── index.css            # 글로벌 스타일
│
├── python/                   # 백엔드 Python 스크립트
│   ├── collect_bids.py      # 입찰 데이터 수집 (Step 2 실연동 완료)
│   ├── collect_awards.py    # 낙찰 데이터 수집 (Step 2 신규)
│   ├── data_quality.py      # 데이터 품질 검증 (Step 2 강화)
│   ├── analyze_insights.py  # 인사이트 분석
│   ├── ml_prediction.py     # ML 예측 모델
│   ├── document_generator.py # 문서 자동 생성
│   ├── scheduler.py         # 스케줄러
│   ├── API_INTEGRATION_SPEC.md # API 연동 설계서 (Step 2)
│   ├── OPS_RULES.md         # 운영 규칙 문서 (Step 2)
│   ├── requirements.txt     # Python 패키지
│   ├── ml_requirements.txt  # ML 패키지
│   └── document_requirements.txt # 문서 생성 패키지
│
├── firebase.json            # Firebase 설정
├── firestore.rules          # Firestore 보안 규칙
├── firestore.indexes.json   # Firestore 인덱스
├── package.json             # NPM 패키지
├── tsconfig.json            # TypeScript 설정
├── tailwind.config.js       # Tailwind 설정
├── vite.config.ts           # Vite 설정
└── README.md                # 이 문서
```

## 🔧 설치 및 실행

### 1. 사전 요구사항

- Node.js 18+ 
- Python 3.9+
- Firebase 프로젝트
- 공공데이터포털 API 키
- OpenAI API 키 (선택사항)

### 2. 프론트엔드 설정

```bash
# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 Firebase 설정 입력

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

### 3. Python 백엔드 설정

```bash
cd python

# 가상환경 생성
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# 패키지 설치
pip install -r requirements.txt
pip install -r ml_requirements.txt
pip install -r document_requirements.txt

# 환경 변수 설정
cp .env.example .env
# API 키 입력

# Firebase 서비스 계정 키 설정
# Firebase Console에서 서비스 계정 키 다운로드
# serviceAccountKey.json으로 저장

# 데이터 수집 실행
python collect_bids.py

# 인사이트 분석 실행
python analyze_insights.py

# ML 모델 학습
python ml_prediction.py

# 스케줄러 실행 (지속적인 데이터 수집)
python scheduler.py
```

### 4. Firebase 설정

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 프로젝트 초기화
firebase init

# Firestore 배포
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## 🗄️ 데이터베이스 스키마

### Firestore Collections

#### `bids/` - 입찰 공고
```typescript
{
  id: string           // 입찰공고번호
  title: string        // 공고명
  agency: string       // 발주기관
  category: string     // 업종
  region: string       // 지역
  budget: number       // 추정가격
  deadline: string     // 마감일
  status: 'active' | 'closed' | 'modified'
  createdAt: string
  updatedAt?: string
}
```

#### `history/` - 낙찰 이력
```typescript
{
  id: string
  bidId: string        // 입찰공고번호
  biddersCount: number // 참여 업체 수
  rates: number[]      // 투찰률 목록
  winnerRate: number   // 낙찰률
  winnerCompany?: string
  completedAt: string
}
```

#### `insights/` - 분석 데이터
```typescript
{
  id: string
  type: 'agency' | 'category' | 'region'
  name: string
  totalBids: number
  averageBudget: number
  averageWinRate: number
  averageCompetition: number
  period: string
  trend: number
}
```

#### `predictions/` - 예측 결과
```typescript
{
  id: string
  bidId: string
  predictedRate: number
  rangeMin: number
  rangeMax: number
  recommendedBid: number
  confidence: number
  createdAt: string
}
```

## 🎨 UI/UX 특징

### 프리미엄 디자인 시스템
- 💎 **글래스모피즘**: 반투명 배경과 블러 효과로 고급스러운 UI
- 🌈 **그라데이션**: Indigo-Purple-Pink 색상 시스템
- ✨ **부드러운 애니메이션**: 300ms 트랜지션으로 자연스러운 인터랙션
- 🎯 **스마트 호버**: Scale, Shadow 효과로 인터랙티브한 UX
- 💫 **프리미엄 카드**: 입체감 있는 그림자와 라운드 처리

### 반응형 & 성능
- 📱 **완벽한 반응형**: 모바일/태블릿/데스크톱 최적화
- ⚡ **즉시 로딩**: Mock 데이터로 0초 로딩
- 🔥 **Vite 기반**: 빠른 HMR과 번들 최적화
- 🎨 **Tailwind CSS**: 일관된 디자인 토큰
- 📐 **Inter 폰트**: 가독성 높은 시스템 폰트

## 🔐 보안

- Firebase Authentication으로 사용자 인증
- Firestore Security Rules로 데이터 접근 제어
- 환경 변수로 API 키 보호
- HTTPS 통신

## � 현재 구현 상태 (MVP v1.0)

### ✅ 완료된 기능
- [x] 프리미엄 UI/UX 디자인 시스템
- [x] 6개 주요 페이지 구현 (Dashboard, BidRadar, Analytics, Prediction, Documents, Settings)
- [x] **Firebase Authentication 완료** ✨
  - [x] 이메일/비밀번호 로그인
  - [x] Google OAuth 로그인
  - [x] 로그인/회원가입 페이지
  - [x] Protected Routes
  - [x] 사용자 프로필 표시
  - [x] 로그아웃 기능
- [x] Firebase 연동 (Firestore, Auth)
- [x] Mock 데이터로 즉시 로딩
- [x] 완벽한 반응형 레이아웃
- [x] 입찰 정보 필터링
- [x] 차트 시각화 (Recharts)
- [x] TypeScript 타입 안전성
- [x] Zustand 상태 관리
- [x] **입찰 상세 페이지 완성** ✅
  - [x] 4개 탭 구현 (개요/참가조건/첨부파일/유사이력)
  - [x] 즐겨찾기 기능
  - [x] 공유하기 & 인쇄
  - [x] 관련 입찰 추천
- [x] **Baikal 로고 적용** ✅
- [x] **검색 & 필터 고도화** ✅
  - [x] 정렬 기능 (최신순/마감일순/예산순)
  - [x] 검색어 하이라이트
  - [x] 예산 범위 필터
  - [x] 필터 초기화 버튼
- [x] **설정 페이지 완성** ✅
  - [x] 사용자 프로필 편집
  - [x] 알림 설정 (토글 스위치)
  - [x] 관심 키워드 관리
  - [x] 구독 플랜 정보
  - [x] API 키 관리
- [x] **차트 데이터 개선** ✅
  - [x] 4가지 차트 타입 (Bar, Line, Pie, Area)
  - [x] 날짜 범위 필터
  - [x] CSV/JSON 데이터 내보내기
  - [x] 프로그레스 바 시각화
  - [x] 차트 애니메이션
- [x] **Dashboard 페이지 개선** ✅
  - [x] 8개 KPI 카드 (신규공고, 진행중, 예산, 정확도, 즐겨찾기, 알림, 성공률, 참여율)
  - [x] 미니 트렌드 차트 (각 카드에 Sparkline)
  - [x] 빠른 작업 버튼 (검색, 예측, 서류, 설정)
  - [x] 최근 공고 위젯 (카테고리 태그, D-day 배지)
  - [x] 완벽한 반응형 그리드 레이아웃
- [x] **Prediction 페이지 개선** ✅
  - [x] AI 투찰가 시뮬레이터 (3-column 레이아웃)
  - [x] 신뢰 구간 시각화 (그라데이션 카드)
  - [x] 투찰 전략 비교 (공격적/권장/보수적)
  - [x] 영향 요인 Radar 차트
  - [x] 낙찰률 추세 Area 차트
- [x] **Documents 페이지 개선** ✅
  - [x] 3가지 템플릿 선택 (제안요약서/분석보고서/체크리스트)
  - [x] 문서 자동 생성 (AI 시뮬레이션)
  - [x] 다운로드 기능 (Word/PDF/TXT)
  - [x] 복사/공유/인쇄 버튼

## 🚧 다음 단계 작업 (우선순위)

### ✅ MVP v1.1 완료 항목 (2025-12-31)

#### Python 백엔드 (Step 2 실연동 완료)
- [x] **collect_bids.py**: Mock/Real API 모드 지원 ✅
  - Mock/Real 모드 완전 분리 (--source 옵션)
  - 페이지네이션 지원 (최대 3페이지/300건)
  - 재시도 로직 구현 (429/5xx → 30~60초 대기, 최대 3회)
  - 정규화(normalize) 단계 강화 (필수 필드 보장, null 허용)
  - retry_queue.json 자동 생성
  
- [x] **collect_awards.py**: 낙찰 데이터 수집 (Step 2 신규) ✅
  - 낙찰정보서비스 (ScsbidInfoService04) 연동
  - 입찰-낙찰 조인키 매칭율 계산 (bidNtceNo 기반)
  - Mock 60건 → Real 200건 수집 가능
  - 재시도/큐잉 메커니즘 포함

- [x] **data_quality.py**: 데이터 품질 검증 (Step 2 강화) ✅
  - 5개 검증 카테고리 (필수 필드/타입/중복/이상치/점수)
  - PASS/CONDITIONAL PASS/FAIL 판정 로직
  - JSON + Markdown 리포트 생성
  - --run-id 옵션으로 덮어쓰기 방지
  - PASS 기준표 4개 항목 (누락률<1%, deadline파싱<1%, budget파싱<2%, 중복률<3%)
  
- [x] **ml_prediction.py**: Baseline 예측 모델
  - 통계 기반 알고리즘 (기관/업종/지역/예산 가중치)
  - 신뢰도 계산 및 신뢰 구간 제공
  - 3가지 투찰 전략 생성 (공격적/권장/보수적)
  - XGBoost/LightGBM 미사용 (향후 고도화 예정)
  
- [x] **document_generator.py**: 템플릿 기반 문서 생성
  - 3가지 템플릿: 제안요약서, 체크리스트, 분석보고서
  - Markdown 형식 출력
  - OpenAI API 선택적 지원 (템플릿 기본)
  - Word/PDF 변환 구조 포함

- [x] **API_INTEGRATION_SPEC.md**: API 연동 설계서 (Step 2) ✅
  - 입찰공고정보서비스 + 낙찰정보서비스 오퍼레이션 정의
  - 요청 파라미터 및 응답 필드 → Firestore 스키마 매핑
  - 조인키 전략 (bidNtceNo 기반, 매칭율 30~100%)
  - 제한사항 및 결측 허용 정책

- [x] **OPS_RULES.md**: 운영 규칙 문서 (Step 2) ✅
  - 호출 불가 점검 체크리스트 (API 키/활용신청/트래픽)
  - 재시도/스킵/큐잉 전략 (429/5xx 대응)
  - 스케줄 권장 (입찰 30~60분, 낙찰 6~12시간)
  - 로그 필드 표준 (timestamp, trace_id, operation, status_code, retry_count)

#### 프론트엔드
- [x] Firebase Authentication 완료
- [x] 6개 주요 페이지 구현
- [x] Mock 데이터 기반 즉시 로딩
- [x] 완벽한 반응형 UI/UX

---

## 🚨 MVP v1.1 한계 및 고지사항

### ⚠️ 현재 제한사항

#### 1. **나라장터 API 연동**
- **상태**: ⏳ **활용신청 승인 대기 중** (Phase 1 BLOCKED)
- **현재**: Mock 모드로 샘플 데이터 생성 (Step 2 완료)
- **진행**: API 키 발급 완료, 공공데이터포털 승인 대기 (1-3일 소요)
- **기술적 준비**: collect_bids.py 실연동 코드 완성, 재시도/큐잉 메커니즘 구현 완료
- **전환 방법**: 승인 후 `python collect_bids.py --source real --pages 3 --run-id prod001`

#### 2. **AI 예측 모델**
- **상태**: Baseline 알고리즘만 구현
- **현재**: 통계 기반 가중 평균 (기관 40%, 업종 30%, 지역 20%, 예산 10%)
- **미구현**: XGBoost, LightGBM 고급 ML 모델
- **정확도**: 신뢰도 40~85% (히스토리 데이터 개수에 따라 변동)
- **한계**: 학습 데이터 부족 시 낮은 정확도

#### 3. **문서 자동 생성**
- **상태**: 템플릿 기반 생성 (OpenAI 선택사항)
- **현재**: Markdown 형식 출력
- **미구현**: OpenAI API 완전 통합, 고급 PDF/Word 변환
- **제약**: 정형화된 템플릿만 지원, 커스터마이징 제한적

#### 4. **서버 배포**
- **상태**: 로컬 실행만 가능
- **미구현**: FastAPI 서버, Firebase Functions, 도메인 연결
- **현재**: Python 스크립트 직접 실행 방식
- **제약**: 프론트엔드와 실시간 연동 불가

#### 5. **데이터베이스**
- **상태**: Firestore 스키마 정의 완료
- **현재**: Mock 데이터로 프론트엔드 동작
- **제약**: 실제 히스토리 데이터 축적 필요
- **최소 요구**: 안정적인 예측을 위해 각 기관/업종별 30건 이상 필요

---

### 📋 법적 고지사항

> **⚠️ 중요**: 본 시스템은 **의사결정 참고용 도구**이며, 자동 입찰 시스템이 아닙니다.

#### 면책 조항
1. **예측 결과의 한계**
   - AI 예측은 통계적 참고치이며, 실제 낙찰률과 다를 수 있습니다.
   - 과거 데이터 기반 추정이므로 미래를 보장하지 않습니다.
   - 입찰 결과에 대한 법적 책임을 지지 않습니다.

2. **사용자 책임**
   - 입찰 참여 최종 결정은 사용자 책임입니다.
   - 본 시스템의 예측을 맹신하지 마시기 바랍니다.
   - 조달 관련 법규 및 윤리를 준수해야 합니다.

3. **금지 사항**
   - 담합, 부정 입찰 등 불법 행위 금지
   - 시스템 오남용 시 법적 처벌 대상
   - 예측 결과의 무단 재배포 금지

#### MVP 데모 용도
- 본 버전은 **개념 증명(POC) 및 고객 데모용**입니다.
- 실제 입찰 의사결정에 사용 전 충분한 검증이 필요합니다.
- 유료 서비스 전환 시 추가 고도화 및 법률 검토가 필수입니다.

---

## 🛣️ 로드맵 (MVP v1.1 → v2.0)

### 🔴 Phase 1: 실제 API 연동 (1~2개월)
**목표**: Mock 데이터에서 실제 데이터로 전환

> ⏳ **현재 상태: BLOCKED (External Approval Pending)**  
> 공공데이터포털 활용신청 승인 대기 중 (예상 1-3일)  
> 기술적 준비 완료 - Step 2 설계/구현/품질검증 PASS ✅

- [⏳] **나라장터 API 완전 연동** (승인 대기)
  - [x] 공공데이터포털 API 키 발급 ✅
  - [x] 실제 API 호출 코드 작성 (collect_bids.py) ✅
  - [x] 에러 핸들링 및 재시도 로직 ✅
  - [ ] 승인 후 실제 데이터 수집 테스트
  - [ ] 일일 자동 수집 스케줄러 설정

- [ ] **Firestore 실시간 연동**
  - [ ] 프론트엔드 실시간 데이터 바인딩
  - [ ] 히스토리 데이터 축적 (최소 1,000건)
  - [ ] 인덱스 최적화

- [ ] **Python 서버 배포**
  - [ ] FastAPI 서버 구축
  - [ ] 또는 Firebase Functions 활용
  - [ ] RESTful API 엔드포인트 배포
  - [ ] CORS 및 보안 설정

### 🟡 Phase 2: ML 모델 고도화 (3~4개월)
**목표**: Baseline → 고급 ML 모델 전환

- [ ] **학습 데이터 확보**
  - [ ] 최소 5,000건 이상 낙찰 이력 수집
  - [ ] 데이터 정제 및 라벨링
  - [ ] Train/Validation/Test 분할

- [ ] **XGBoost/LightGBM 적용**
  - [ ] 피처 엔지니어링
  - [ ] 하이퍼파라미터 튜닝
  - [ ] 교차 검증
  - [ ] 모델 성능 평가 (R² > 0.7 목표)

- [ ] **예측 정확도 향상**
  - [ ] 앙상블 모델 구축
  - [ ] 신뢰 구간 정밀화
  - [ ] A/B 테스트로 검증

### 🟢 Phase 3: AI 문서 생성 고도화 (4~6개월)
**목표**: 템플릿 → AI 기반 동적 생성

- [ ] **OpenAI API 완전 통합**
  - [ ] GPT-4 기반 제안서 생성
  - [ ] 프롬프트 엔지니어링
  - [ ] 비용 최적화 (토큰 관리)

- [ ] **문서 변환 고도화**
  - [ ] 고품질 PDF 생성
  - [ ] Word 템플릿 커스터마이징
  - [ ] PPT 자동 생성

- [ ] **문서 히스토리 관리**
  - [ ] 생성 이력 저장
  - [ ] 버전 관리
  - [ ] 재사용 및 편집 기능

### 🔵 Phase 4: 엔터프라이즈 기능 (6개월+)
**목표**: B2B SaaS 플랫폼으로 전환

- [ ] **팀 협업 기능**
  - [ ] 멀티 유저 지원
  - [ ] 역할 기반 권한 관리 (RBAC)
  - [ ] 조직 관리 (워크스페이스)
  - [ ] 활동 로그 및 감사 추적

- [ ] **알림 시스템**
  - [ ] 신규 공고 실시간 알림
  - [ ] 마감 임박 알림 (D-3, D-1)
  - [ ] 이메일 알림
  - [ ] 브라우저 푸시 알림
  - [ ] Slack/Teams 연동

- [ ] **고급 분석 대시보드**
  - [ ] 경쟁사 벤치마킹
  - [ ] 낙찰 패턴 심층 분석
  - [ ] 예산 트렌드 예측
  - [ ] 커스텀 리포트 생성

- [ ] **배포 및 운영**
  - [ ] Vercel/Netlify 프론트엔드 배포
  - [ ] AWS/GCP 백엔드 배포
  - [ ] 도메인 연결 및 SSL
  - [ ] Sentry 에러 추적
  - [ ] Google Analytics 분석
  - [ ] 성능 모니터링 (Lighthouse)

---

### 🎯 버전별 목표 정리

| 버전 | 완료 시점 | 핵심 목표 | 예상 정확도 |
|------|----------|-----------|------------|
| **MVP v1.0** | ✅ 2025-12-25 | 프리미엄 UI/UX, Mock 데이터 | N/A (데모용) |
| **MVP v1.1** | ✅ 2025-12-31 | Python 백엔드 데모, API 설계 | 40~60% |
| **MVP v1.2 (Step 2)** | ✅ 2025-12-31 | API 실연동 설계, 데이터 품질 검증 | PASS (99.99%) |
| **MVP v1.3 (Step 3-A)** | ✅ 2026-01-01 | FastAPI 서버화, Mock 기준 검증 | PASS (서버 OK) |
| **MVP v1.4 (Step 3-B)** | ✅ 2026-01-01 | Windows Task Scheduler 자동화 | PASS (무인 수집 260건) |
| **Phase 1 REAL 준비** | ✅ 2026-01-01 | 에러 처리 표준화, 재시도 강화, 전환 가이드 | READY (승인 대기) |
| **v1.5 (Phase 1 전환)** | 2026-02 | 실제 API 연동, 데이터 축적 | 60~70% |
| **v2.0** | 2026-06 | ML 고도화, AI 문서 생성 | 75~85% |
| **v3.0** | 2026-12 | 엔터프라이즈 기능, 유료 전환 | 85%+ |

---

### 🔴 긴급 (Phase 1 시작 전 준비사항)

#### MVP v1.1 완료 항목
- [x] Firebase Authentication 구현 ✅
- [x] 입찰 상세 페이지 완성 ✅
- [x] Prediction 페이지 개선 ✅
- [x] Documents 페이지 개선 ✅
- [x] **Python 백엔드 스크립트 작성 완료** ✅
- [x] **API 설계 문서 작성** ✅
- [x] **MVP 한계 및 로드맵 명시** ✅
- [x] **Step 2: API 실연동 설계 + 최소 수집 파이프라인** ✅
  - [x] collect_bids.py 실연동 모드 완성 (페이지네이션/재시도/정규화)
  - [x] collect_awards.py 신규 생성 (낙찰 데이터 수집)
  - [x] data_quality.py 품질 검증 강화 (PASS 기준 4개)
  - [x] API_INTEGRATION_SPEC.md 작성 (입찰/낙찰 오퍼레이션 설계)
  - [x] OPS_RULES.md 작성 (재시도/스킵/큐잉/로그 표준)
  - [x] Mock 250건 수집 → PASS (완전성 99.99%, 파싱 100%)
  - [x] 중복 방지 확인 (파일 덮어쓰기, Firestore Upsert)
- [x] **Step 3-A: FastAPI 서버화 (Mock 기준)** ✅ **PASS (2026-01-01)**
  - [x] api_server.py 구현 (FastAPI + Uvicorn, 포트 8004)
  - [x] POST /v1/collect/bids (입찰 수집 API)
  - [x] POST /v1/collect/awards (낙찰 수집 API)
  - [x] GET /v1/runs/{run_id} (상태 조회 API)
  - [x] Step 2 코드 subprocess 호출 (수정 없음)
  - [x] Mock 모드 검증 완료 (100건 수집, 0.07초)
  - [x] 서버 기동 검증 (/health 즉시 응답)
  - [x] 블로킹 이슈 완전 해결 (백그라운드 실행)
  - [x] docs/step3_api.md 작성 (API 문서)

- [x] **Step 3-B: Windows Task Scheduler 자동화** ✅ **PASS (2026-01-01)**
  - [x] bids_scheduler.ps1 작성 (입찰 수집 자동화, 30분 주기)
  - [x] awards_scheduler.ps1 작성 (낙찰 수집 자동화, 6시간 주기)
  - [x] 재시도 로직 구현 (최대 2회, 30~60초 대기)
  - [x] 로그 파일 자동 생성 (logs/scheduler_*.log)
  - [x] run_id 자동 생성 (auto_bids_YYYYMMDD_HHMMSS)
  - [x] 서버 Health Check 포함
  - [x] Task Scheduler 설정 가이드 작성
  - [x] Step3B_SCHEDULER_GUIDE.md 작성 (운영 가이드)
  - [x] **최종 검증 완료** ✅
    - bids 수집: 200건/200건 (0 errors, 0.07초)
    - awards 수집: 60건/60건 (0 errors, 0.04초)
    - 최신 bids 파일 자동 선택: PASS
    - 서버 통신 (/health, /v1/collect/*): PASS
    - 파일 생성 (115KB, 17KB) 및 run_id 추적: PASS

#### Phase 1 준비 체크리스트
- [x] 공공데이터포털 계정 생성 및 API 키 발급 ✅
- [⏳] **공공데이터포털 활용신청 승인 대기** (BLOCKED - External Approval)
- [x] Python 가상환경 설정 및 패키지 설치 ✅
  ```bash
  cd python
  python -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  ```
- [x] 환경 변수 설정 (.env 파일 작성) ✅
- [x] **Phase 1 REAL 전환 준비 완료** ✅ (2026-01-01)
  - [x] serviceKey 사용 규칙 명문화 (Decoding Key 필수)
  - [x] HTTP 에러 처리 표준화 (401/403 즉시 실패, 429/5xx 재시도)
  - [x] 재시도 로직 강화 (지수 백오프 + 지터, 최대 6회)
  - [x] Run 상태 모델 정의 (OK/PARTIAL_OK/FAIL)
  - [x] PowerShell 스크립트 REAL 모드 주석 추가
  - [x] PHASE1_REAL_READINESS.md 문서 작성
- [ ] Firebase 프로젝트 Production 모드 전환
- [ ] Firebase serviceAccountKey.json 발급 및 설정
- [ ] 데이터 수집 테스트 실행 (승인 후)
  ```bash
  python collect_bids.py --source real --pages 3 --run-id prod001
  ```

---

### 🟡 중요 (Phase 1: 실제 API 연동)
  - [ ] 나라장터 공공데이터 API 연동
  - [ ] 환경변수 설정 (.env)
  - [ ] API 요청 에러 핸들링
  - [ ] 로딩 스피너 개선

### 🟡 중요 (Phase 1: 실제 API 연동 - 1~2개월)
- [x] **검색 & 필터 고도화** ✅
- [x] **차트 데이터 연동** ✅
- [x] **설정 페이지 완성** ✅

- [ ] **나라장터 API 실제 연동**
  - [ ] API 호출 및 데이터 파싱
  - [ ] 에러 핸들링 구현
  - [ ] 일일 자동 수집 (scheduler.py)

- [ ] **Python 백엔드 실행**
  - [ ] Python 가상환경 설정
  - [ ] 데이터 수집 스크립트 실행
  - [ ] Firebase Admin SDK 연동
  - [ ] 스케줄러 설정

- [ ] **Firestore 히스토리 데이터 축적**
  - [ ] 최소 1,000건 낙찰 이력 수집
  - [ ] 데이터 정제 및 검증

- [ ] **FastAPI 서버 구축**
  - [ ] 4개 API 엔드포인트 구현
  - [ ] 프론트엔드 연동 테스트

### 🟢 개선 (Phase 2: ML 고도화 - 3~6개월)
- [ ] **AI 예측 모델 고도화**
  - [ ] 학습 데이터 5,000건 이상 확보
  - [ ] XGBoost/LightGBM 적용
  - [ ] 모델 성능 평가 (R² > 0.7)

- [ ] **문서 생성 고도화**
- [ ] **문서 생성 고도화**
  - [ ] OpenAI API 완전 통합
  - [ ] 고품질 PDF/Word 변환
  - [ ] 템플릿 커스터마이징
  - [ ] 문서 히스토리 관리

- [ ] **알림 시스템 구축**
  - [ ] 신규 공고 실시간 알림
  - [ ] 마감 임박 알림 (D-3, D-1)
  - [ ] 이메일 알림
  - [ ] 브라우저 푸시 알림

### 🔵 장기 계획 (Phase 3-4: 엔터프라이즈 - 6개월+)
- [ ] **팀 협업 기능**
  - [ ] 멀티 유저 지원
  - [ ] 역할 기반 권한 관리
  - [ ] 조직 관리 (워크스페이스)
  - [ ] 활동 로그

- [ ] **고급 분석 대시보드**
  - [ ] 경쟁사 벤치마킹
  - [ ] 낙찰 패턴 심층 분석
  - [ ] 예산 트렌드 예측
  - [ ] 커스텀 리포트

- [ ] **배포 & 운영**
  - [ ] Vercel/AWS 배포
  - [ ] 도메인 연결
  - [ ] Sentry 에러 추적
  - [ ] Google Analytics
  - [ ] 성능 모니터링

- [ ] **테스트 & 최적화**
  - [ ] Unit 테스트 (Jest, Vitest)
  - [ ] E2E 테스트 (Playwright)
  - [ ] 성능 최적화
  - [ ] SEO 최적화

---

## 🚀 빠른 시작 가이드 (MVP v1.1)

### 1. 프론트엔드 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### 2. Python 백엔드 테스트 (데모 모드)

```bash
cd python

# 가상환경 생성 (최초 1회)
python -m venv venv

# 가상환경 활성화
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# 패키지 설치
pip install -r requirements.txt

# 데이터 수집 테스트 (Mock 모드, Step 2 강화)
python collect_bids.py --source mock --count 200 --run-id test001

# 낙찰 데이터 수집 (Step 2 신규)
python collect_awards.py --source mock --count 60 --run-id test001 --bids-file collected_bids_mock_test001.json

# 데이터 품질 검증 (Step 2 강화)
python data_quality.py --source real --input collected_bids_mock_test001.json --run-id test001

# AI 예측 테스트 (Mock 모드)
python ml_prediction.py

# 실행 결과 확인 및 샘플 데이터 출력 확인
```

### 3. Firebase 설정 (선택사항)

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firestore 규칙 배포
firebase deploy --only firestore:rules

# (향후) Python 백엔드와 연동 시 serviceAccountKey.json 필요
```

### 4. 환경 변수 설정

```bash
# 프론트엔드 (.env)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... 기타 Firebase 설정

# Python 백엔드 (python/.env)
DATA_PORTAL_API_KEY=your_narara_api_key
OPENAI_API_KEY=your_openai_key  # 선택사항
```

---

## 💼 타겟 고객
  - [x] 구독 플랜 관리

- [ ] **테스트 & 최적화**
  - [ ] Unit 테스트 (Jest, Vitest)
  - [ ] E2E 테스트 (Playwright)
  - [ ] 성능 최적화
  - [ ] SEO 최적화

### 🔵 장기 계획 (2-3개월)
- [ ] **엔터프라이즈 기능**
  - [ ] 팀 협업 (멀티 유저)
  - [ ] 역할 기반 권한 관리
  - [ ] 조직 관리
  - [ ] 활동 로그

- [ ] **고급 분석**
  - [ ] 경쟁사 벤치마킹
  - [ ] 낙찰 패턴 분석
  - [ ] 예산 트렌드 예측
  - [ ] 커스텀 리포트

- [ ] **배포 & 운영**
  - [ ] Vercel 배포
  - [ ] 도메인 연결
  - [ ] 모니터링 (Sentry)
  - [ ] 분석 (Google Analytics)
  - [ ] 에러 추적
  - [ ] 성능 모니터링

## 💼 타겟 고객

- 🏭 제조업체 (금속, 사출, 물류 등)
- 💻 SI·솔루션 개발사
- 📊 조달 전문 컨설팅 업체
- 📝 행정사 사무소
- 🏛️ 지자체·공공기관
- 🔬 연구소 및 정책분석 기관

## 📊 사업 모델

| 플랜 | 가격 | 주요 기능 |
|------|------|----------|
| **Starter** | 월 29,000원 | 실시간 입찰 레이더, 기본 검색/필터 |
| **Pro** | 월 99,000원 | + 히스토리 대시보드, 보고서 자동 생성 |
| **Elite** | 월 299,000원 | + 예상 투찰가 예측, 전략 리포트 |
| **Enterprise** | 협의 | + 온프레미스, 커스터마이징, 전담 지원 |

## 🤝 기여하기

이 프로젝트는 MVP 단계입니다. 기여를 환영합니다!

## 📄 라이선스

MIT License

## 📞 문의

프로젝트 관련 문의: [이메일 주소]

---

**Built with ❤️ using Vite, React, TypeScript, Tailwind CSS, and Python**
