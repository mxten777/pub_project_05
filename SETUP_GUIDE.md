# 스마트 입찰·조달 인텔리전스 플랫폼 - 설치 가이드

## 🚀 빠른 시작

### 1단계: 저장소 클론 및 프론트엔드 설정

```bash
# 디렉토리 이동
cd c:\pubcoding\pub_project_05

# 패키지 설치
npm install

# 환경 변수 설정
copy .env.example .env
```

### 2단계: Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. Firestore Database 활성화
4. Authentication 설정 (Email/Password 활성화)
5. 프로젝트 설정에서 웹 앱 추가
6. Firebase 설정 정보를 `.env` 파일에 입력

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3단계: 공공데이터포털 API 키 발급

1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. "나라장터 입찰공고 목록 조회" API 신청
3. 승인 후 API 키 복사

### 4단계: 프론트엔드 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 열기
# http://localhost:5173
```

### 5단계: Python 백엔드 설정

```bash
# Python 디렉토리로 이동
cd python

# 가상환경 생성 (Windows)
python -m venv venv
venv\Scripts\activate

# 또는 Mac/Linux
python3 -m venv venv
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt
pip install -r ml_requirements.txt
pip install -r document_requirements.txt
```

### 6단계: Firebase 서비스 계정 키 설정

1. Firebase Console > 프로젝트 설정 > 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. `python/serviceAccountKey.json`으로 저장

### 7단계: Python 환경 변수 설정

```bash
cd python
copy .env.example .env
```

`.env` 파일 수정:
```env
DATA_PORTAL_API_KEY=your_data_portal_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
OPENAI_API_KEY=your_openai_api_key  # 선택사항
```

### 8단계: 데이터 수집 및 분석 실행

```bash
# 입찰 데이터 수집
python collect_bids.py

# 인사이트 분석
python analyze_insights.py

# ML 모델 학습
python ml_prediction.py

# 문서 생성 테스트
python document_generator.py
```

### 9단계: 자동 스케줄러 실행 (선택사항)

```bash
# 백그라운드에서 계속 실행
python scheduler.py
```

## 🔍 문제 해결

### Firebase 연결 오류
- `.env` 파일의 Firebase 설정 확인
- Firebase Console에서 웹 앱이 등록되었는지 확인

### Python 패키지 설치 오류
- Python 버전 확인 (3.9 이상 필요)
- pip 업그레이드: `python -m pip install --upgrade pip`

### API 호출 오류
- 공공데이터포털 API 키 승인 상태 확인
- API 호출 제한 확인 (일일 호출 횟수)

### ML 모델 학습 오류
- 학습 데이터가 충분한지 확인
- Mock 데이터로 테스트 진행

## 📚 다음 단계

1. **프론트엔드 커스터마이징**
   - `src/components/` 컴포넌트 수정
   - Tailwind CSS로 스타일 변경

2. **백엔드 확장**
   - 데이터 수집 로직 개선
   - ML 모델 정확도 향상

3. **배포**
   - 프론트엔드: Vercel 배포
   - 백엔드: Cloud Functions 또는 서버 배포

## 💡 추가 리소스

- [Firebase 문서](https://firebase.google.com/docs)
- [Vite 문서](https://vitejs.dev/)
- [React 문서](https://react.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/)
- [공공데이터포털](https://www.data.go.kr/)
