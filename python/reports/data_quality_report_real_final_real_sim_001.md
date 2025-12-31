# 데이터 품질 리포트 (Data Quality Report)

**생성일시**: 2025-12-31 23:15:34

## 📊 요약 (Executive Summary)

- **총 레코드 수**: 250건
- **유효 레코드 수**: 250건 (중복 제외)
- **최종 판정**: **PASS** (4/4 기준 통과)
- **판정 근거**: 모든 품질 기준 충족

### 주요 품질 지표
- 완전성 점수: **99.99/100**
- 파싱 건전성 점수: **100.00/100**
- 중복률: **0.00%**
- 핵심 필드 누락률: **0.00%**
---

## ✅ PASS 기준표 (Quality Criteria)

| 항목 | 기준 | 현재 값 | 상태 |
|------|------|---------|------|
| 핵심 필드 누락률 | < 1% | 0.00% | ✅ PASS |
| deadline 파싱 오류율 | < 1% | 0.00% | ✅ PASS |
| budget 파싱 오류율 | < 2% | 0.00% | ✅ PASS |
| 중복 레코드율 | < 3% | 0.00% | ✅ PASS |
---

## 📋 필드별 누락률/오류율

### 필수 필드 누락 현황

| 필드 | 누락 건수 | 누락률 (%) | 상태 |
|------|----------|-----------|------|
| id | 0 | 0.00% | ✅ |
| title | 0 | 0.00% | ✅ |
| agency | 0 | 0.00% | ✅ |
| category | 0 | 0.00% | ✅ |
| region | 0 | 0.00% | ✅ |
| budget | 1 | 0.40% | ✅ |
| deadline | 0 | 0.00% | ✅ |
| status | 0 | 0.00% | ✅ |
| createdAt | 0 | 0.00% | ✅ |

**필수 필드 불완전 레코드 비율**: 0.40%

### 타입/파싱 오류 현황

| 필드 | 오류 건수 | 오류율 (%) | 상태 |
|------|----------|-----------|------|
| budget | 0 | 0.00% | ✅ |
| deadline | 0 | 0.00% | ✅ |
| status | 0 | 0.00% | ✅ |

---

## 🔍 중복 및 이상치 분석

### 중복 ID
- **중복 ID 개수**: 0개
- **중복 레코드 수**: 0건
- **중복률**: 0.00%

### 이상치 감지

| 항목 | 건수 | 비율 (%) | 설명 |
|------|------|---------|------|
| 음수/0원 예산 | 0 | 0.00% | budget <= 0 |
| 너무 짧은 제목 | 1 | 0.40% | title 길이 < 5 |
| 너무 긴 제목 | 0 | 0.00% | title 길이 > 200 |
| 과거 마감일 | 0 | 0.00% | deadline < 현재 |

---

## 💡 권고 사항 (Phase 1 대응)

✅ 현재 데이터 품질은 양호합니다. Phase 1 실제 API 연동 시 지속 모니터링 필요

---

## 🎯 최종 판정

**판정**: `PASS`

**판정 근거**:
- 모든 품질 기준 충족
- 통과 기준: 4/4 (누락률<1%, deadline파싱<1%, budget파싱<2%, 중복률<3%)
- ✅ 현재 데이터는 Phase 1 실제 API 연동에 사용 가능한 수준입니다.

---

## 📦 샘플 데이터 (Sample Records)

### 샘플 1
```json
{
  "id": "20251200001",
  "title": "지역 플랫폼 사업",
  "agency": "교육부",
  "category": "건설",
  "region": "세종",
  "budget": 104000000,
  "estimatedPrice": 107812194.19361699,
  "deadline": "2026-01-10T23:15:16.436868",
  "announcementDate": "2025-12-27T23:15:16.436868",
  "bidMethod": "일반경쟁입찰",
  "status": "active",
  "createdAt": "2025-12-31T23:15:16.436962",
  "source": "mock",
  "detailUrl": "https://www.g2b.go.kr:8081/ep/invitation/publish/bidPublishDtl.do?bidno=20251200001"
}
```

### 샘플 2
```json
{
  "id": "20251200002",
  "title": "지역 구축 사업",
  "agency": "서울시청",
  "category": "기타",
  "region": "세종",
  "budget": 599000000,
  "estimatedPrice": 586305561.8709081,
  "deadline": "2026-02-06T23:15:16.436868",
  "announcementDate": "2025-12-30T23:15:16.436868",
  "bidMethod": "일반경쟁입찰",
  "status": "active",
  "createdAt": "2025-12-31T23:15:16.436998",
  "source": "mock",
  "detailUrl": "https://www.g2b.go.kr:8081/ep/invitation/publish/bidPublishDtl.do?bidno=20251200002"
}
```

### 샘플 3
```json
{
  "id": "20251200003",
  "title": "제목없음",
  "agency": "경기도청",
  "category": "용역",
  "region": "대전",
  "budget": 151000000,
  "estimatedPrice": 147955949.31627885,
  "deadline": "2026-01-18T23:15:16.436868",
  "announcementDate": "2025-12-26T23:15:16.436868",
  "bidMethod": "제한경쟁입찰",
  "status": "active",
  "createdAt": "2025-12-31T23:15:16.437027",
  "source": "mock",
  "detailUrl": "https://www.g2b.go.kr:8081/ep/invitation/publish/bidPublishDtl.do?bidno=20251200003"
}
```


---

**리포트 생성 도구**: Data Quality Checker v1.0  
**생성 시각**: 2025-12-31T23:15:34.159370
