# 데이터 품질 리포트 (Data Quality Report)

**생성일시**: 2025-12-31 23:10:03

## 📊 요약 (Executive Summary)

- **총 레코드 수**: 200건
- **유효 레코드 수**: 200건 (중복 제외)
- **최종 판정**: **PASS** (4/4 기준 통과)
- **판정 근거**: 모든 품질 기준 충족

### 주요 품질 지표
- 완전성 점수: **99.98/100**
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
| budget | 1 | 0.50% | ✅ |
| deadline | 0 | 0.00% | ✅ |
| status | 0 | 0.00% | ✅ |
| createdAt | 0 | 0.00% | ✅ |

**필수 필드 불완전 레코드 비율**: 0.50%

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
| 너무 짧은 제목 | 1 | 0.50% | title 길이 < 5 |
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
  "title": "공공 시스템 사업",
  "agency": "경기도청",
  "category": "건설",
  "region": "부산",
  "budget": 43000000,
  "estimatedPrice": 41741022.247902445,
  "deadline": "2026-01-19T23:09:48.279666",
  "announcementDate": "2025-12-28T23:09:48.279666",
  "bidMethod": "지명경쟁입찰",
  "status": "active",
  "createdAt": "2025-12-31T23:09:48.279781",
  "source": "mock",
  "detailUrl": "https://www.g2b.go.kr:8081/ep/invitation/publish/bidPublishDtl.do?bidno=20251200001"
}
```

### 샘플 2
```json
{
  "id": "20251200002",
  "title": "공공 시스템 사업",
  "agency": "행정안전부",
  "category": "용역",
  "region": "울산",
  "budget": 738000000,
  "estimatedPrice": 735013958.2814922,
  "deadline": "2026-01-27T23:09:48.279666",
  "announcementDate": "2025-12-27T23:09:48.279666",
  "bidMethod": "지명경쟁입찰",
  "status": "active",
  "createdAt": "2025-12-31T23:09:48.279831",
  "source": "mock",
  "detailUrl": "https://www.g2b.go.kr:8081/ep/invitation/publish/bidPublishDtl.do?bidno=20251200002"
}
```

### 샘플 3
```json
{
  "id": "20251200003",
  "title": "제목없음",
  "agency": "행정안전부",
  "category": "물품",
  "region": "경기",
  "budget": 517000000,
  "estimatedPrice": 496700391.234017,
  "deadline": "2026-02-13T23:09:48.279666",
  "announcementDate": "2025-12-26T23:09:48.279666",
  "bidMethod": "일반경쟁입찰",
  "status": "active",
  "createdAt": "2025-12-31T23:09:48.279865",
  "source": "mock",
  "detailUrl": "https://www.g2b.go.kr:8081/ep/invitation/publish/bidPublishDtl.do?bidno=20251200003"
}
```

### 샘플 4
```json
{
  "id": "20251200004",
  "title": "공공 플랫폼 사업",
  "agency": "교육부",
  "category": "물품",
  "region": "강원",
  "budget": null,
  "estimatedPrice": null,
  "deadline": "2026-01-22T23:09:48.279666",
  "announcementDate": "2025-12-27T23:09:48.279666",
  "bidMethod": "지명경쟁입찰",
  "status": "active",
  "createdAt": "2025-12-31T23:09:48.279890",
  "source": "mock",
  "detailUrl": "https://www.g2b.go.kr:8081/ep/invitation/publish/bidPublishDtl.do?bidno=20251200004"
}
```

### 샘플 5
```json
{
  "id": "20251200005",
  "title": "지역 플랫폼 사업",
  "agency": "보건복지부",
  "category": "용역",
  "region": "대구",
  "budget": 122000000,
  "estimatedPrice": 118367818.11536527,
  "deadline": "2026-02-06T23:09:48.279666",
  "announcementDate": "2025-12-30T23:09:48.279666",
  "bidMethod": "일반경쟁입찰",
  "status": "active",
  "createdAt": "2025-12-31T23:09:48.279919",
  "source": "mock",
  "detailUrl": "https://www.g2b.go.kr:8081/ep/invitation/publish/bidPublishDtl.do?bidno=20251200005"
}
```


---

**리포트 생성 도구**: Data Quality Checker v1.0  
**생성 시각**: 2025-12-31T23:10:03.427421
