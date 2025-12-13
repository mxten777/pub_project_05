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
│   ├── collect_bids.py      # 입찰 데이터 수집
│   ├── analyze_insights.py  # 인사이트 분석
│   ├── ml_prediction.py     # ML 예측 모델
│   ├── document_generator.py # 문서 자동 생성
│   ├── scheduler.py         # 스케줄러
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

### 🔴 긴급 (1주 이내)
- [x] **Firebase Authentication 구현** ✅
  - [x] 이메일/비밀번호 로그인
  - [x] Google OAuth
  - [x] 로그인/회원가입 페이지  
  - [x] Protected Routes
  
- [x] **입찰 상세 페이지 완성** ✅
  - [x] BidDetail.tsx 프리미엄 컴포넌트 구현
  - [x] 4개 탭 (개요/참가조건/첨부파일/유사이력)
  - [x] 첨부파일 다운로드 UI
  - [x] 즐겨찾기 기능
  - [x] 공유하기 & 인쇄 기능
  - [x] 관련 입찰 정보 추천

- [x] **Prediction 페이지 개선** ✅
  - [x] AI 투찰가 시뮬레이터
  - [x] 신뢰 구간 시각화
  - [x] 낙찰률 계산기

- [x] **Documents 페이지 개선** ✅
  - [x] 템플릿 선택 인터페이스
  - [x] 자동 문서 생성
  - [x] 다운로드 기능

- [ ] **실제 API 연동** (추후)
  - [ ] 나라장터 공공데이터 API 연동
  - [ ] 환경변수 설정 (.env)
  - [ ] API 요청 에러 핸들링
  - [ ] 로딩 스피너 개선

### 🟡 중요 (2주 이내)
- [x] **검색 & 필터 고도화** ✅
  - [x] 키워드 검색 실제 구현
  - [x] 다중 필터 조합
  - [x] 검색 결과 하이라이트
  - [x] 정렬 기능

- [ ] **Python 백엔드 실행**
  - [ ] Python 가상환경 설정
  - [ ] 데이터 수집 스크립트 실행
  - [ ] Firebase Admin SDK 연동
  - [ ] 스케줄러 설정

- [x] **차트 데이터 실시간 연동** ✅
  - [x] 4가지 차트 타입 구현
  - [x] 날짜 범위 필터
  - [x] 데이터 내보내기 (CSV, JSON)
  - [x] 프로그레스 바 & 애니메이션

- [ ] **AI 예측 모델 구현**
  - [ ] Python ML 모델 학습
  - [ ] 예측 API 엔드포인트
  - [ ] 프론트엔드 연동
  - [ ] 신뢰도 시각화

### 🟢 개선 (1개월 이내)
- [ ] **문서 생성 고도화**
  - [ ] OpenAI API 연동
  - [ ] PDF/Word 다운로드
  - [ ] 템플릿 커스터마이징
  - [ ] 히스토리 저장

- [ ] **알림 시스템**
  - [ ] 신규 공고 알림
  - [ ] 마감 임박 알림
  - [ ] 이메일 알림
  - [ ] 브라우저 푸시 알림

- [x] **설정 페이지 완성** ✅
  - [x] 사용자 프로필 편집
  - [x] 알림 설정
  - [x] 관심 키워드 관리
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
