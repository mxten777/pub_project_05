# Smart Bid Radar - MVP v1.1 실행 가이드

> **작성일**: 2025-12-31  
> **버전**: MVP v1.1 (데모 & 고객 검증용)

## 📋 목차

1. [MVP v1.1 개요](#mvp-v11-개요)
2. [시스템 요구사항](#시스템-요구사항)
3. [프론트엔드 실행](#프론트엔드-실행)
4. [Python 백엔드 테스트](#python-백엔드-테스트)
5. [주요 기능 데모](#주요-기능-데모)
6. [문제 해결](#문제-해결)

---

## MVP v1.1 개요

### ✅ 구현 완료 기능
- **프론트엔드**: React + TypeScript + Firebase Auth (6개 페이지)
- **Python 백엔드**: 데모 수준 구현 (3개 스크립트)
- **AI 예측 모델**: Baseline 알고리즘 (통계 기반)
- **문서 자동 생성**: 템플릿 기반 (Markdown 출력)
- **API 설계**: 4개 엔드포인트 문서화 완료

### ⚠️ 제한사항
- 나라장터 API: Mock 모드로 실행 (실제 연동 미완료)
- ML 모델: Baseline만 구현 (XGBoost/LightGBM 미적용)
- 서버 배포: 로컬 실행만 지원
- 데이터: 샘플 데이터로 동작

---

## 시스템 요구사항

### 필수 항목
- **Node.js**: 18.x 이상
- **Python**: 3.9 이상
- **Git**: 최신 버전
- **브라우저**: Chrome, Edge, Firefox 최신 버전

### 선택 항목
- **Firebase 계정**: Authentication 테스트용
- **나라장터 API 키**: 실제 API 연동 시 필요
- **OpenAI API 키**: AI 문서 생성 고도화 시 필요

---

## 프론트엔드 실행

### 1. 저장소 클론 (최초 1회)

```bash
git clone https://github.com/your-repo/pub_project_05.git
cd pub_project_05
```

### 2. 패키지 설치

```bash
npm install
```

설치 시간: 약 2~3분 소요

### 3. 환경 변수 설정 (선택사항)

Firebase Authentication을 사용하려면 `.env` 파일 생성:

```bash
# .env 파일
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> **Note**: 환경 변수가 없어도 Mock 데이터로 정상 작동합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

실행 로그 예시:
```
  VITE v5.0.0  ready in 823 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5. 브라우저 접속

**URL**: http://localhost:5173

#### 로그인 (Mock 모드)
- **이메일**: demo@smartbidradar.com
- **비밀번호**: demo1234

또는 "회원가입" 버튼을 클릭하여 새 계정 생성

### 6. 주요 페이지 확인

| 페이지 | URL | 주요 기능 |
|--------|-----|-----------|
| 대시보드 | `/` | KPI 카드, 최근 공고, 빠른 작업 |
| 입찰 레이더 | `/bids` | 검색, 필터, 정렬, 상세 페이지 |
| 분석 | `/analytics` | 4가지 차트 타입, 데이터 내보내기 |
| 예측 | `/prediction` | AI 투찰가 시뮬레이터, 전략 비교 |
| 문서 | `/documents` | 템플릿 선택, 자동 생성, 다운로드 |
| 설정 | `/settings` | 프로필, 알림, 키워드, 구독 |

---

## Python 백엔드 테스트

### 1. Python 가상환경 설정 (최초 1회)

```bash
cd python
python -m venv venv
```

### 2. 가상환경 활성화

**Windows**:
```bash
venv\Scripts\activate
```

**Mac/Linux**:
```bash
source venv/bin/activate
```

활성화 확인: 프롬프트 앞에 `(venv)` 표시됨

### 3. 패키지 설치

```bash
pip install -r requirements.txt
```

설치 시간: 약 1~2분 소요

### 4. 스크립트 실행 테스트

#### 4-1. 입찰 데이터 수집 (Mock 모드)

```bash
python collect_bids.py
```

**예상 출력**:
```
============================================================
📦 Smart Bid Radar - 데이터 수집 스크립트
============================================================
실행 모드: Mock (샘플 데이터)
DB 저장: No
============================================================

🎭 Mock 모드: 샘플 데이터 20건 생성 중...
✅ Mock 데이터 20건 생성 완료

📊 수집 결과:
   - 총 건수: 20건
   - 샘플 데이터 (첫 3건):
     1. 국가 정보화 구축 사업 - 조달청
     2. 지역 시스템 구축 사업 - 한국정보화진흥원
     3. 공공 플랫폼 구축 사업 - 서울시청

💡 Firestore 저장을 건너뜁니다. (save_to_db=False)
   저장하려면 run(save_to_db=True)로 실행하세요.

============================================================
✨ 수집 프로세스 완료
============================================================
```

#### 4-2. AI 예측 테스트

```bash
python ml_prediction.py
```

**예상 출력**:
```
============================================================
🤖 Smart Bid Radar - AI 예측 시스템 (Baseline)
============================================================

📋 입찰 정보:
   - 공고번호: 20250001-12345
   - 발주기관: 조달청
   - 업종: 소프트웨어
   - 지역: 서울
   - 예산: 75,000,000원

🔮 예측 시작: 20250001-12345
✅ 예측 완료: 87.6% (신뢰도: 75%)

🎯 예측 결과:
   - 예상 낙찰률: 87.62%
   - 신뢰 구간: 86.87% ~ 88.37%
   - 신뢰도: 75%

💡 투찰 전략:
   - 공격적 전략 (높은 투찰률, 낮은 낙찰 확률): 90.6% (낙찰확률 23%)
   - 권장 전략 (균형잡힌 접근): 87.6% (낙찰확률 53%)
   - 보수적 전략 (낮은 투찰률, 높은 낙찰 확률): 84.6% (낙찰확률 68%)

📊 영향 요인:
   - agency_avg: 88.2
   - category_avg: 86.8
   - region_avg: 87.0
   - budget_factor: 89.25
   - competition_level: medium

⚠️ 이 예측은 참고용이며, 실제 낙찰률과 다를 수 있습니다.

============================================================
✨ 예측 완료
============================================================
```

#### 4-3. 명령줄 옵션

**Firestore에 저장** (Firebase 설정 필요):
```bash
python collect_bids.py --save
python ml_prediction.py --save
```

**실제 API 모드** (나라장터 API 키 필요):
```bash
python collect_bids.py --real --save
```

### 5. 가상환경 종료

```bash
deactivate
```

---

## 주요 기능 데모

### 1. 입찰 레이더 (실시간 검색 & 필터)

1. 브라우저에서 http://localhost:5173/bids 접속
2. **검색창**에 "정보화" 입력 → 검색어 하이라이트 확인
3. **필터**:
   - 업종: 소프트웨어 선택
   - 지역: 서울 선택
   - 예산 범위: 50백만원 ~ 100백만원
4. **정렬**: 마감일순 → 예산순 전환
5. **초기화** 버튼으로 필터 리셋
6. 입찰 카드 클릭 → 상세 페이지 이동
7. 상세 페이지에서 **4개 탭** 확인 (개요/참가조건/첨부파일/유사이력)

### 2. AI 예측 시뮬레이터

1. http://localhost:5173/prediction 접속
2. **입찰 공고 선택** (드롭다운)
3. **예측 실행** 버튼 클릭
4. 결과 확인:
   - 예상 낙찰률 (가운데 큰 숫자)
   - 신뢰 구간 (그라데이션 카드)
   - 3가지 투찰 전략 (표)
   - 영향 요인 (Radar 차트)
   - 낙찰률 추세 (Area 차트)

### 3. 문서 자동 생성

1. http://localhost:5173/documents 접속
2. **입찰 공고 선택**
3. **템플릿 선택**:
   - 제안요약서
   - 입찰 참여 체크리스트
   - 기관별 분석 보고서
4. **생성하기** 버튼 클릭
5. 생성된 문서 확인 (Markdown 형식)
6. **다운로드** 버튼:
   - TXT: 즉시 다운로드
   - Word/PDF: 향후 구현 예정

### 4. 분석 대시보드

1. http://localhost:5173/analytics 접속
2. **차트 타입 전환**: Bar → Line → Pie → Area
3. **날짜 범위 필터**: 7일 → 30일 → 90일
4. **데이터 내보내기**:
   - CSV: 엑셀로 열기 가능
   - JSON: API 연동 테스트용

---

## 문제 해결

### Q1. 프론트엔드 실행 시 "EADDRINUSE" 에러

**원인**: 포트 5173이 이미 사용 중

**해결**:
```bash
# 다른 터미널에서 실행 중인 프로세스 종료
# 또는
npm run dev -- --port 5174
```

### Q2. Python 가상환경 활성화 실패 (Windows)

**원인**: PowerShell 실행 정책 제한

**해결**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q3. Firebase Auth 로그인 실패

**원인**: 환경 변수 미설정 또는 Firebase 프로젝트 미생성

**해결**:
1. Mock 모드에서는 환경 변수 없이도 작동 (회원가입 버튼 사용)
2. 실제 Firebase 사용 시 `.env` 파일 설정 필요

### Q4. Python 패키지 설치 실패

**원인**: Python 버전 또는 네트워크 문제

**해결**:
```bash
# Python 버전 확인 (3.9 이상 필요)
python --version

# pip 업그레이드
python -m pip install --upgrade pip

# 재시도
pip install -r requirements.txt
```

### Q5. 차트가 표시되지 않음

**원인**: Recharts 라이브러리 미설치

**해결**:
```bash
npm install recharts
npm run dev
```

---

## 다음 단계

### Phase 1: 실제 API 연동 준비

1. **공공데이터포털 계정 생성**
   - https://www.data.go.kr 회원가입
   - "나라장터 전자조달 입찰정보" API 신청
   - API 키 발급 (승인 1~2일 소요)

2. **Firebase 프로젝트 생성**
   - https://console.firebase.google.com
   - 새 프로젝트 생성
   - Authentication 활성화 (이메일/비밀번호, Google)
   - Firestore Database 생성
   - 서비스 계정 키 다운로드 → `python/serviceAccountKey.json`

3. **환경 변수 설정**
   ```bash
   # python/.env
   DATA_PORTAL_API_KEY=your_actual_api_key_here
   
   # 프론트엔드 .env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   # ... 기타 Firebase 설정
   ```

4. **실제 API 테스트**
   ```bash
   python collect_bids.py --real --save
   ```

### Phase 2: 추가 개발

- API 설계 문서 참조: [API_DOCS.md](API_DOCS.md)
- 로드맵 참조: [README.md](README.md#로드맵)
- 이슈 리포트: GitHub Issues

---

## 📞 지원

- **문서**: [README.md](README.md), [API_DOCS.md](API_DOCS.md)
- **버그 리포트**: GitHub Issues
- **문의**: [이메일 주소]

---

**작성**: Smart Bid Radar 개발팀  
**마지막 업데이트**: 2025-12-31  
**문서 버전**: MVP v1.1
