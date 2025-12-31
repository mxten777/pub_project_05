#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Quality Report Generator
데이터 품질(정합성) 검증 및 리포트 생성

Usage:
    python data_quality.py --source mock
    python data_quality.py --source real --input collected_bids.json
    python data_quality.py --source mock --count 200 --sample 5
    python data_quality.py --source real --input collected_bids.json --run-id demo001
"""

import json
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional
import os
import sys

# Mock 데이터 생성 함수 (collect_bids.py와 유사)
def generate_mock_data(count: int = 20) -> List[Dict[str, Any]]:
    """Mock 입찰 데이터 생성"""
    agencies = ['서울특별시청', '경기도청', '인천광역시청', '부산광역시청', '대전광역시청']
    categories = ['소프트웨어', '건설', '용역', '물품', '기타']
    regions = ['서울', '경기', '인천', '부산', '대전']
    statuses = ['active', 'closed', 'modified']
    
    data = []
    base_date = datetime(2024, 12, 1)
    
    for i in range(count):
        # 의도적으로 일부 레코드에 문제 삽입 (테스트용)
        record = {
            'id': str(i + 1),
            'title': f'2024년 스마트시티 통합플랫폼 구축사업 {i+1}',
            'agency': agencies[i % len(agencies)],
            'category': categories[i % len(categories)],
            'region': regions[i % len(regions)],
            'budget': 500000000 + (i * 10000000),
            'deadline': '2024-12-31T23:59:59',
            'status': statuses[i % len(statuses)],
            'createdAt': base_date.isoformat(),
        }
        
        # 의도적 품질 문제 삽입 (일부 레코드만)
        if i == 5:
            record['title'] = ''  # 빈 제목
        if i == 7:
            record['budget'] = -1000  # 음수 예산
        if i == 9:
            record['deadline'] = 'invalid-date'  # 잘못된 날짜
        if i == 11:
            record['status'] = 'unknown'  # 잘못된 상태
        if i == 13:
            del record['agency']  # 필드 누락
        if i == 15:
            record['id'] = '5'  # 중복 ID
        if i == 17:
            record['title'] = 'abc'  # 너무 짧은 제목
        if i == 18:
            record['updatedAt'] = datetime.now().isoformat()  # 갱신 시간 추가
        
        data.append(record)
    
    return data


class DataQualityChecker:
    """데이터 품질 검증기"""
    
    def __init__(self, records: List[Dict[str, Any]]):
        self.records = records
        self.total_count = len(records)
        self.results = {
            'total_records': self.total_count,
            'valid_records': 0,
            'field_stats': {},
            'type_errors': {},
            'duplicates': {},
            'anomalies': {},
            'summary': {},
            'judgment': ''
        }
    
    def check_all(self) -> Dict[str, Any]:
        """전체 품질 검증 실행"""
        print("📊 데이터 품질 검증 시작...")
        
        self.check_missing_fields()
        self.check_type_errors()
        self.check_duplicates()
        self.check_anomalies()
        self.calculate_scores()
        self.make_judgment()
        
        print("✅ 데이터 품질 검증 완료")
        return self.results
    
    def check_missing_fields(self):
        """필수 필드 누락 검증"""
        required_fields = ['id', 'title', 'agency', 'category', 'region', 
                          'budget', 'deadline', 'status', 'createdAt']
        
        field_stats = {}
        records_with_missing = 0
        
        for field in required_fields:
            missing_count = 0
            for record in self.records:
                value = record.get(field)
                if value is None or value == '':
                    missing_count += 1
            
            missing_rate = (missing_count / self.total_count * 100) if self.total_count > 0 else 0
            field_stats[field] = {
                'missing_count': missing_count,
                'missing_rate': round(missing_rate, 2)
            }
        
        # 필수 필드가 하나라도 누락된 레코드 카운트
        for record in self.records:
            has_missing = any(
                record.get(field) is None or record.get(field) == ''
                for field in required_fields
            )
            if has_missing:
                records_with_missing += 1
        
        self.results['field_stats'] = field_stats
        self.results['records_with_missing_rate'] = round(
            (records_with_missing / self.total_count * 100), 2
        ) if self.total_count > 0 else 0
    
    def check_type_errors(self):
        """타입/파싱 오류 검증"""
        budget_errors = 0
        deadline_errors = 0
        status_errors = 0
        allowed_statuses = ['active', 'closed', 'modified']
        
        for record in self.records:
            # Budget 숫자 검증
            try:
                budget = record.get('budget')
                if budget is not None:
                    float(budget)
            except (ValueError, TypeError):
                budget_errors += 1
            
            # Deadline 날짜 검증
            deadline = record.get('deadline')
            if deadline:
                try:
                    # ISO 형식 또는 YYYY-MM-DD 형식 파싱 시도
                    if 'T' in deadline:
                        datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                    else:
                        datetime.strptime(deadline, '%Y-%m-%d')
                except (ValueError, AttributeError):
                    deadline_errors += 1
            
            # Status 값 검증
            status = record.get('status')
            if status and status not in allowed_statuses:
                status_errors += 1
        
        self.results['type_errors'] = {
            'budget': {
                'error_count': budget_errors,
                'error_rate': round((budget_errors / self.total_count * 100), 2)
            },
            'deadline': {
                'error_count': deadline_errors,
                'error_rate': round((deadline_errors / self.total_count * 100), 2)
            },
            'status': {
                'error_count': status_errors,
                'error_rate': round((status_errors / self.total_count * 100), 2)
            }
        }
    
    def check_duplicates(self):
        """중복 ID 검증 (최신 레코드만 유효로 판단)"""
        id_map = {}
        
        for record in self.records:
            record_id = record.get('id')
            if not record_id:
                continue
            
            if record_id not in id_map:
                id_map[record_id] = []
            id_map[record_id].append(record)
        
        duplicates = {k: v for k, v in id_map.items() if len(v) > 1}
        duplicate_count = sum(len(v) - 1 for v in duplicates.values())
        
        # 최신 레코드만 유효로 처리
        valid_count = self.total_count - duplicate_count
        
        self.results['duplicates'] = {
            'duplicate_ids': list(duplicates.keys()),
            'duplicate_count': duplicate_count,
            'duplicate_rate': round((duplicate_count / self.total_count * 100), 2) if self.total_count > 0 else 0
        }
        self.results['valid_records'] = valid_count
    
    def check_anomalies(self):
        """값 범위/이상치 검증"""
        negative_budget_count = 0
        short_title_count = 0
        long_title_count = 0
        past_deadline_count = 0
        now = datetime.now()
        
        for record in self.records:
            # Budget <= 0
            budget = record.get('budget')
            if budget is not None:
                try:
                    if float(budget) <= 0:
                        negative_budget_count += 1
                except (ValueError, TypeError):
                    pass
            
            # Title 길이
            title = record.get('title', '')
            if len(title) < 5 and len(title) > 0:
                short_title_count += 1
            elif len(title) > 200:
                long_title_count += 1
            
            # Deadline이 과거인지 확인
            deadline = record.get('deadline')
            if deadline:
                try:
                    if 'T' in deadline:
                        deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                    else:
                        deadline_dt = datetime.strptime(deadline, '%Y-%m-%d')
                    
                    if deadline_dt < now:
                        past_deadline_count += 1
                except (ValueError, AttributeError):
                    pass
        
        self.results['anomalies'] = {
            'negative_budget': {
                'count': negative_budget_count,
                'rate': round((negative_budget_count / self.total_count * 100), 2)
            },
            'short_title': {
                'count': short_title_count,
                'rate': round((short_title_count / self.total_count * 100), 2)
            },
            'long_title': {
                'count': long_title_count,
                'rate': round((long_title_count / self.total_count * 100), 2)
            },
            'past_deadline': {
                'count': past_deadline_count,
                'rate': round((past_deadline_count / self.total_count * 100), 2)
            }
        }
    
    def calculate_scores(self):
        """점수 계산"""
        # 완전성 점수 (100 - 가중 누락률)
        critical_fields = ['id', 'title', 'agency']
        critical_missing_rate = sum(
            self.results['field_stats'][f]['missing_rate'] 
            for f in critical_fields
        ) / len(critical_fields)
        
        all_missing_rate = sum(
            stat['missing_rate'] 
            for stat in self.results['field_stats'].values()
        ) / len(self.results['field_stats'])
        
        completeness_score = max(0, 100 - (critical_missing_rate * 2 + all_missing_rate) / 3)
        
        # 파싱 건전성 점수 (100 - 가중 오류율)
        type_error_rate = sum(
            err['error_rate'] 
            for err in self.results['type_errors'].values()
        ) / len(self.results['type_errors'])
        
        parsing_score = max(0, 100 - type_error_rate * 1.5)
        
        self.results['summary'] = {
            'completeness_score': round(completeness_score, 2),
            'parsing_score': round(parsing_score, 2),
            'duplicate_rate': self.results['duplicates']['duplicate_rate'],
            'critical_missing_rate': round(critical_missing_rate, 2),
            'type_error_rate': round(type_error_rate, 2)
        }
    
    def make_judgment(self):
        """최종 판정"""
        summary = self.results['summary']
        
        # PASS 기준
        pass_criteria = [
            summary['critical_missing_rate'] < 1,  # 핵심 필드 누락률 < 1%
            self.results['type_errors']['deadline']['error_rate'] < 1,  # deadline 파싱 < 1%
            self.results['type_errors']['budget']['error_rate'] < 2,  # budget 파싱 < 2%
            summary['duplicate_rate'] < 3  # 중복률 < 3%
        ]
        
        passed_count = sum(pass_criteria)
        
        if passed_count == 4:
            judgment = 'PASS'
            reason = '모든 품질 기준 충족'
        elif passed_count >= 2:
            judgment = 'CONDITIONAL PASS'
            reason = f'{4 - passed_count}개 기준 미충족, 데이터 정제 후 사용 가능'
        else:
            judgment = 'FAIL'
            reason = f'{4 - passed_count}개 기준 미충족, 데이터 정제 필수'
        
        # 치명적 문제 체크
        if summary['critical_missing_rate'] > 10:
            judgment = 'FAIL'
            reason = '핵심 필드(id/title/agency) 누락률이 높음 - 데이터 수집 재실행 필요'
        
        self.results['judgment'] = judgment
        self.results['judgment_reason'] = reason
        self.results['pass_criteria_met'] = f'{passed_count}/4'


def generate_json_report(results: Dict[str, Any], output_path: str):
    """JSON 리포트 생성"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"📄 JSON 리포트 생성: {output_path}")


def generate_markdown_report(results: Dict[str, Any], output_path: str, sample_records: Optional[List[Dict]] = None):
    """Markdown 리포트 생성"""
    summary = results['summary']
    
    md_content = f"""# 데이터 품질 리포트 (Data Quality Report)

**생성일시**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📊 요약 (Executive Summary)

- **총 레코드 수**: {results['total_records']:,}건
- **유효 레코드 수**: {results['valid_records']:,}건 (중복 제외)
- **최종 판정**: **{results['judgment']}** ({results['pass_criteria_met']} 기준 통과)
- **판정 근거**: {results['judgment_reason']}

### 주요 품질 지표
- 완전성 점수: **{summary['completeness_score']:.2f}/100**
- 파싱 건전성 점수: **{summary['parsing_score']:.2f}/100**
- 중복률: **{summary['duplicate_rate']:.2f}%**
- 핵심 필드 누락률: **{summary['critical_missing_rate']:.2f}%**
---

## ✅ PASS 기준표 (Quality Criteria)

| 항목 | 기준 | 현재 값 | 상태 |
|------|------|---------|------|
| 핵심 필드 누락률 | < 1% | {summary['critical_missing_rate']:.2f}% | {'✅ PASS' if summary['critical_missing_rate'] < 1 else '❌ FAIL'} |
| deadline 파싱 오류율 | < 1% | {results['type_errors']['deadline']['error_rate']:.2f}% | {'✅ PASS' if results['type_errors']['deadline']['error_rate'] < 1 else '❌ FAIL'} |
| budget 파싱 오류율 | < 2% | {results['type_errors']['budget']['error_rate']:.2f}% | {'✅ PASS' if results['type_errors']['budget']['error_rate'] < 2 else '❌ FAIL'} |
| 중복 레코드율 | < 3% | {summary['duplicate_rate']:.2f}% | {'✅ PASS' if summary['duplicate_rate'] < 3 else '❌ FAIL'} |
---

## 📋 필드별 누락률/오류율

### 필수 필드 누락 현황

| 필드 | 누락 건수 | 누락률 (%) | 상태 |
|------|----------|-----------|------|
"""
    
    for field, stats in results['field_stats'].items():
        status = '✅' if stats['missing_rate'] < 1 else '⚠️' if stats['missing_rate'] < 5 else '❌'
        md_content += f"| {field} | {stats['missing_count']} | {stats['missing_rate']:.2f}% | {status} |\n"
    
    md_content += f"""
**필수 필드 불완전 레코드 비율**: {results['records_with_missing_rate']:.2f}%

### 타입/파싱 오류 현황

| 필드 | 오류 건수 | 오류율 (%) | 상태 |
|------|----------|-----------|------|
"""
    
    for field, stats in results['type_errors'].items():
        status = '✅' if stats['error_rate'] < 1 else '⚠️' if stats['error_rate'] < 5 else '❌'
        md_content += f"| {field} | {stats['error_count']} | {stats['error_rate']:.2f}% | {status} |\n"
    
    md_content += f"""
---

## 🔍 중복 및 이상치 분석

### 중복 ID
- **중복 ID 개수**: {len(results['duplicates']['duplicate_ids'])}개
- **중복 레코드 수**: {results['duplicates']['duplicate_count']}건
- **중복률**: {results['duplicates']['duplicate_rate']:.2f}%

"""
    
    if results['duplicates']['duplicate_ids']:
        md_content += f"**중복 ID 목록**: {', '.join(results['duplicates']['duplicate_ids'][:10])}"
        if len(results['duplicates']['duplicate_ids']) > 10:
            md_content += f" ... (외 {len(results['duplicates']['duplicate_ids']) - 10}개)"
        md_content += "\n\n"
    
    md_content += f"""### 이상치 감지

| 항목 | 건수 | 비율 (%) | 설명 |
|------|------|---------|------|
| 음수/0원 예산 | {results['anomalies']['negative_budget']['count']} | {results['anomalies']['negative_budget']['rate']:.2f}% | budget <= 0 |
| 너무 짧은 제목 | {results['anomalies']['short_title']['count']} | {results['anomalies']['short_title']['rate']:.2f}% | title 길이 < 5 |
| 너무 긴 제목 | {results['anomalies']['long_title']['count']} | {results['anomalies']['long_title']['rate']:.2f}% | title 길이 > 200 |
| 과거 마감일 | {results['anomalies']['past_deadline']['count']} | {results['anomalies']['past_deadline']['rate']:.2f}% | deadline < 현재 |

---

## 💡 권고 사항 (Phase 1 대응)

"""
    
    recommendations = []
    
    if summary['critical_missing_rate'] > 1:
        recommendations.append("1. **긴급**: API 응답 파싱 로직 점검 - 핵심 필드(id/title/agency) 누락 발생")
    
    if results['type_errors']['deadline']['error_rate'] > 1:
        recommendations.append("2. **긴급**: deadline 필드 날짜 형식 통일 필요 (ISO 8601 권장)")
    
    if results['type_errors']['budget']['error_rate'] > 2:
        recommendations.append("3. **중요**: budget 필드 숫자 변환 로직 강화 필요")
    
    if results['duplicates']['duplicate_rate'] > 3:
        recommendations.append("4. **중요**: 중복 ID 제거 로직 구현 - updatedAt 기준 최신 레코드만 유지")
    
    if results['anomalies']['negative_budget']['rate'] > 5:
        recommendations.append("5. **점검**: 음수/0원 예산 데이터 원인 분석 - API 응답 또는 파싱 문제 가능성")
    
    if not recommendations:
        recommendations.append("✅ 현재 데이터 품질은 양호합니다. Phase 1 실제 API 연동 시 지속 모니터링 필요")
    
    for rec in recommendations[:5]:
        md_content += f"{rec}\n"
    
    md_content += f"""
---

## 🎯 최종 판정

**판정**: `{results['judgment']}`

**판정 근거**:
- {results['judgment_reason']}
- 통과 기준: {results['pass_criteria_met']} (누락률<1%, deadline파싱<1%, budget파싱<2%, 중복률<3%)
"""
    
    if results['judgment'] == 'PASS':
        md_content += "- ✅ 현재 데이터는 Phase 1 실제 API 연동에 사용 가능한 수준입니다.\n"
    elif results['judgment'] == 'CONDITIONAL PASS':
        md_content += "- ⚠️ 일부 품질 이슈가 있으나, 정제 후 사용 가능합니다. 위 권고사항을 참고하세요.\n"
    else:
        md_content += "- ❌ 데이터 품질이 낮습니다. 데이터 수집 로직을 재점검하고 다시 실행하세요.\n"
    
    # 샘플 데이터 추가
    if sample_records:
        md_content += "\n---\n\n## 📦 샘플 데이터 (Sample Records)\n\n"
        for i, record in enumerate(sample_records[:5], 1):
            md_content += f"### 샘플 {i}\n```json\n{json.dumps(record, ensure_ascii=False, indent=2)}\n```\n\n"
    
    md_content += f"""
---

**리포트 생성 도구**: Data Quality Checker v1.0  
**생성 시각**: {datetime.now().isoformat()}
"""
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"📝 Markdown 리포트 생성: {output_path}")


def main():
    parser = argparse.ArgumentParser(description='데이터 품질 검증 및 리포트 생성')
    parser.add_argument('--source', choices=['mock', 'real'], required=True,
                       help='데이터 소스: mock (샘플 생성) 또는 real (파일 로드)')
    parser.add_argument('--input', type=str,
                       help='실제 데이터 파일 경로 (source=real 시 필수)')
    parser.add_argument('--output-dir', type=str, default='./reports',
                       help='리포트 출력 디렉토리 (기본: ./reports)')
    parser.add_argument('--sample', type=int, default=5,
                       help='Markdown에 포함할 샘플 레코드 수 (기본: 5)')
    parser.add_argument('--run-id', type=str,
                       help='실행 ID (없으면 timestamp 자동 생성, 파일명에 포함)')
    parser.add_argument('--count', type=int, default=20,
                       help='Mock 모드 생성 레코드 수 (기본: 20)')
    
    args = parser.parse_args()
    
    # 출력 디렉토리 생성
    os.makedirs(args.output_dir, exist_ok=True)
    
    # 데이터 로드
    if args.source == 'mock':
        print(f"🔧 Mock 데이터 생성 중 ({args.count}건)...")
        records = generate_mock_data(args.count)
        print(f"✅ Mock 데이터 {len(records)}건 생성 완료")
    else:
        if not args.input:
            print("❌ 오류: --source real 사용 시 --input 파일 경로가 필요합니다")
            sys.exit(1)
        
        print(f"📂 파일 로드 중: {args.input}")
        try:
            with open(args.input, 'r', encoding='utf-8') as f:
                records = json.load(f)
            print(f"✅ {len(records)}건 로드 완료")
        except FileNotFoundError:
            print(f"❌ 오류: 파일을 찾을 수 없습니다: {args.input}")
            sys.exit(1)
        except json.JSONDecodeError:
            print(f"❌ 오류: JSON 파싱 실패: {args.input}")
            sys.exit(1)
    
    # 품질 검증
    checker = DataQualityChecker(records)
    results = checker.check_all()
    
    # 리포트 생성 (run-id 기반 파일명)
    run_id = args.run_id if args.run_id else datetime.now().strftime('%Y%m%d_%H%M%S')
    json_path = os.path.join(args.output_dir, f'data_quality_report_{args.source}_{run_id}.json')
    md_path = os.path.join(args.output_dir, f'data_quality_report_{args.source}_{run_id}.md')
    
    generate_json_report(results, json_path)
    generate_markdown_report(results, md_path, records[:args.sample] if args.sample > 0 else None)
    
    # 결과 출력
    print("\n" + "="*60)
    print(f"📊 데이터 품질 검증 완료")
    print("="*60)
    print(f"총 레코드: {results['total_records']}건")
    print(f"유효 레코드: {results['valid_records']}건")
    print(f"최종 판정: {results['judgment']} ({results['pass_criteria_met']})")
    print(f"완전성 점수: {results['summary']['completeness_score']:.2f}/100")
    print(f"파싱 점수: {results['summary']['parsing_score']:.2f}/100")
    print("="*60)
    print(f"\n✅ 리포트 파일:")
    print(f"  - JSON: {json_path}")
    print(f"  - Markdown: {md_path}")
    print("\n💡 Markdown 리포트를 확인하여 상세 분석 결과를 확인하세요.\n")


if __name__ == '__main__':
    main()
