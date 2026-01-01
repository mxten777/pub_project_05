#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
나라장터 API 낙찰 데이터 수집 스크립트 (MVP v1.2 - Step 2)
공공데이터포털 조달청_나라장터 낙찰정보서비스 연동

실행 예시:
    python collect_awards.py --source mock --count 50 --run-id test001
    python collect_awards.py --source real --pages 2 --run-id prod001
"""

import os
import json
import time
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import random

# 환경 변수 로드
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️ python-dotenv not installed. Using system environment variables.")

# API 설정
# ⚠️ 중요: DATA_PORTAL_API_KEY는 Decoding Key를 사용해야 함
# - Decoding Key: requests params 방식에서 자동 인코딩됨 (권장)
# - Encoding Key: URL 직결 방식에서만 사용 (이중 인코딩 위험)
API_KEY = os.getenv('DATA_PORTAL_API_KEY', '')
BASE_URL = 'http://apis.data.go.kr/1230000/ScsbidInfoService04'


class AwardDataCollector:
    """낙찰(개찰) 데이터 수집 클래스"""
    
    def __init__(self, source: str = 'mock', fail_rate: float = 0.0, fast_retry: bool = False):
        """
        Args:
            source: 'mock' (샘플 데이터) 또는 'real' (실제 API)
            fail_rate: Mock 실패 주입 확률 (0.0~1.0, 기본: 0.0=실패 없음)
            fast_retry: 빠른 재시도 모드 (True=대기 최소화, False=실제 대기, 기본: False)
        """
        self.source = source
        self.api_key = API_KEY
        self.base_url = BASE_URL
        self.retry_queue = []
        self.fail_rate = fail_rate
        self.fast_retry = fast_retry
        
        if source == 'real' and not API_KEY:
            raise ValueError("❌ API 키가 없습니다. 환경 변수 DATA_PORTAL_API_KEY를 설정하세요.")
        
        if fail_rate < 0.0 or fail_rate > 1.0:
            raise ValueError("❌ fail_rate는 0.0~1.0 사이 값이어야 합니다.")
    
    def collect(self, count: int = 50, pages: int = 2) -> List[Dict]:
        """
        낙찰 데이터 수집
        
        Args:
            count: Mock 모드 생성 레코드 수
            pages: Real 모드 페이지 수
            
        Returns:
            수집된 낙찰 데이터 리스트
        """
        if self.source == 'mock':
            print(f"🎭 Mock 모드: {count}건 낙찰 데이터 생성 중...")
            return self._generate_mock_data(count)
        else:
            print(f"📡 Real 모드: 최대 {pages}페이지 낙찰 데이터 수집 시작...")
            return self._fetch_real_data(pages)
    
    def _generate_mock_data(self, count: int) -> List[Dict]:
        """Mock 낙찰 데이터 생성 (실패 주입 옵션 포함)"""
        # 실패 주입 시뮬레이션
        if self.fail_rate > 0 and random.random() < self.fail_rate:
            print(f"\n⚠️ Mock 실패 주입 발동! (fail_rate={self.fail_rate})")
            return self._simulate_failure()
        
        mock_awards = []
        base_date = datetime.now()
        
        for i in range(count):
            bid_id = f"{base_date.year}{str(base_date.month).zfill(2)}{str(i+1).zfill(5)}"
            openg_date = base_date - timedelta(days=random.randint(1, 30))
            
            bidders_count = random.randint(3, 15)
            winner_rate = random.uniform(85.0, 99.9)
            winner_amount = random.randint(50, 700) * 1000000
            
            mock_award = {
                'bidId': bid_id,
                'opengDate': openg_date.isoformat(),
                'biddersCount': bidders_count,
                'winnerAmount': winner_amount,
                'winnerRate': round(winner_rate, 2),
                'winnerCompany': f"(주){random.choice(['한국', '대한', '글로벌', '테크', '솔루션'])}{random.choice(['정보', '시스템', '산업', '기술'])}",
                'completedAt': datetime.now().isoformat(),
                'source': 'mock'
            }
            mock_awards.append(mock_award)
        
        print(f"✅ Mock 데이터 {len(mock_awards)}건 생성 완료")
        return mock_awards
    
    def _fetch_real_data(self, pages: int) -> List[Dict]:
        """실제 나라장터 낙찰정보 API 호출"""
        all_awards = []
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)  # 최근 30일
        
        for page in range(1, pages + 1):
            print(f"\n📄 페이지 {page}/{pages} 수집 중...")
            
            params = {
                'serviceKey': self.api_key,
                'numOfRows': 100,
                'pageNo': page,
                'inqryDiv': '1',  # 개찰일 기준
                'inqryBgnDt': start_date.strftime('%Y%m%d'),
                'inqryEndDt': end_date.strftime('%Y%m%d'),
                'type': 'json'
            }
            
            response_data = self._api_call_with_retry(
                f'{self.base_url}/getOpengInfoListServc01',
                params,
                operation='getOpengInfoListServc01',
                page=page
            )
            
            if not response_data:
                print(f"⚠️ 페이지 {page} 수집 실패. 스킵합니다.")
                continue
            
            try:
                items = response_data.get('response', {}).get('body', {}).get('items', [])
                
                if not items:
                    print(f"⚠️ 페이지 {page}에 데이터가 없습니다. 수집 종료.")
                    break
                
                # 정규화
                normalized = self._normalize_awards(items)
                all_awards.extend(normalized)
                
                print(f"✅ 페이지 {page}: {len(normalized)}건 수집 완료 (누적: {len(all_awards)}건)")
                
                # Rate Limit 방지
                if page < pages:
                    time.sleep(1)
                    
            except Exception as e:
                print(f"❌ 페이지 {page} 데이터 파싱 실패: {e}")
                continue
        
        print(f"\n✅ 총 {len(all_awards)}건 수집 완료")
        return all_awards
    
    def _api_call_with_retry(self, url: str, params: Dict, operation: str, page: int, max_retries: int = 6) -> Optional[Dict]:
        """재시도 로직 포함 API 호출 (지수 백오프 + 지터)"""
        for attempt in range(max_retries):
            try:
                import requests
                
                response = requests.get(url, params=params, timeout=30)
                
                # HTTP 상태 코드별 처리
                if response.status_code == 200:
                    return response.json()
                
                # ===== 재시도 불가 (즉시 실패) =====
                elif response.status_code in [400, 401, 403]:
                    print(f"❌ [{response.status_code}] 즉시 실패: {response.text[:200]}")
                    print(f"   401/403: API 키 오류 또는 승인 미완료")
                    print(f"   400: 파라미터 오류")
                    break  # 재시도 중단
                
                # ===== 재시도 가능 (지수 백오프) =====
                elif response.status_code == 429:
                    # Rate Limit: 30s → 60s → 90s → 120s → 150s → 180s
                    base_wait = 30
                    wait_time = base_wait * (attempt + 1) + random.uniform(0, 10)
                    print(f"⚠️ [429] Rate Limit. {wait_time:.1f}초 대기 (재시도 {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                    
                elif response.status_code >= 500:
                    # Server Error: 60s → 120s → 180s → 240s → 300s → 360s
                    base_wait = 60
                    wait_time = base_wait * (attempt + 1) + random.uniform(0, 20)
                    print(f"⚠️ [{response.status_code}] 서버 오류. {wait_time:.1f}초 대기 (재시도 {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                    
                else:
                    print(f"❌ 알 수 없는 HTTP {response.status_code}: {response.text[:200]}")
                    break
                    
            except requests.Timeout:
                # Timeout: 30s → 60s → 90s → 120s → 150s → 180s
                wait_time = 30 * (attempt + 1) + random.uniform(0, 10)
                print(f"⚠️ Timeout 오류. {wait_time:.1f}초 대기 (재시도 {attempt+1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                    
            except Exception as e:
                wait_time = 30 + random.uniform(0, 10)
                print(f"❌ 요청 실패 (재시도 {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
        
        # 재시도 실패 → 큐에 추가
        print(f"❌ {max_retries}회 재시도 실패. retry_queue에 적재.")
        self.retry_queue.append({
            'operation': operation,
            'params': params,
            'page': page,
            'failed_at': datetime.now().isoformat(),
            'retry_count': max_retries
        })
        
        return None
    
    def _normalize_awards(self, raw_items: List[Dict]) -> List[Dict]:
        """API 응답 → Firestore 스키마 변환"""
        normalized = []
        
        for item in raw_items:
            try:
                award = {
                    'bidId': item.get('bidNtceNo', '').strip(),
                    'opengDate': self._parse_date(item.get('opengDt')),
                    'biddersCount': self._parse_int(item.get('rbidCnt')),
                    'winnerAmount': self._parse_number(item.get('sucsfbidAmt')),
                    'winnerRate': self._parse_number(item.get('sucsfbidRate')),
                    'winnerCompany': item.get('sucsfbidCorpNm', '').strip() or None,
                    'completedAt': datetime.now().isoformat(),
                    'source': 'g2b_api'
                }
                
                # bidId 필수
                if not award['bidId']:
                    print(f"⚠️ 필수 필드(bidId) 누락. 스킵: {item}")
                    continue
                
                normalized.append(award)
                
            except Exception as e:
                print(f"⚠️ 레코드 변환 실패: {e} - {item}")
                continue
        
        return normalized
    
    def _parse_number(self, value) -> Optional[float]:
        """숫자 변환"""
        if value is None:
            return None
        try:
            return float(str(value).replace(',', ''))
        except:
            return None
    
    def _parse_int(self, value) -> Optional[int]:
        """정수 변환"""
        if value is None:
            return None
        try:
            return int(str(value).replace(',', ''))
        except:
            return None
    
    def _parse_date(self, value) -> Optional[str]:
        """날짜 변환"""
        if not value:
            return None
        try:
            if len(str(value)) >= 8:
                dt = datetime.strptime(str(value)[:8], '%Y%m%d')
                return dt.isoformat()
        except:
            pass
        return None
    
    def _simulate_failure(self) -> List[Dict]:
        """Mock 실패 시뮬레이션 (500/Timeout 재현)"""
        failure_type = random.choice(['500', 'timeout'])
        max_retries = 6
        
        print(f"🎭 실패 유형: {failure_type}")
        print(f"재시도 정책 발동: 최대 {max_retries}회 시도")
        if self.fast_retry:
            print(f"⚡ 빠른 재시도 모드 (실제 대기 생략)\n")
        else:
            print(f"⏳ 실제 백오프 대기 적용 (운영 환경 동일)\n")
        
        for attempt in range(max_retries):
            if failure_type == '500':
                # 서버 오류 시뮬레이션: 60s → 120s → 180s → 240s → 300s → 360s
                base_wait = 60
                wait_time = base_wait * (attempt + 1) + random.uniform(0, 20)
                print(f"⚠️ [500] 서버 오류 시뮬레이션. {wait_time:.1f}초 대기 (재시도 {attempt+1}/{max_retries})")
            else:
                # Timeout 시뮬레이션: 30s → 60s → 90s → 120s → 150s → 180s
                wait_time = 30 * (attempt + 1) + random.uniform(0, 10)
                print(f"⚠️ Timeout 시뮬레이션. {wait_time:.1f}초 대기 (재시도 {attempt+1}/{max_retries})")
            
            # 실제 대기 적용 (기본값) vs 빠른 모드 (옵션)
            if self.fast_retry:
                time.sleep(0.1)  # 빠른 모드: 최소 대기 (로깅 가독성)
            else:
                time.sleep(wait_time)  # 실제 대기 (운영 환경 동일)
        
        # 재시도 실패 → 큐에 추가
        print(f"\n❌ {max_retries}회 재시도 실패. retry_queue에 적재.")
        self.retry_queue.append({
            'operation': 'mock_failure_injection',
            'params': {'fail_rate': self.fail_rate, 'failure_type': failure_type},
            'page': 0,
            'failed_at': datetime.now().isoformat(),
            'retry_count': max_retries
        })
        
        # 빈 리스트 반환 (수집 실패)
        return []
    
    def save_to_json(self, awards: List[Dict], run_id: str, output_dir: str = './') -> str:
        """JSON 파일로 저장"""
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"collected_awards_{self.source}_{run_id}.json"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(awards, f, ensure_ascii=False, indent=2)
        
        print(f"💾 저장 완료: {filepath} ({len(awards)}건)")
        return filepath
    
    def save_retry_queue(self, output_dir: str = './'):
        """재시도 큐 저장"""
        if not self.retry_queue:
            return
        
        os.makedirs(output_dir, exist_ok=True)
        filepath = os.path.join(output_dir, 'retry_queue_awards.json')
        
        existing_queue = []
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    existing_queue = json.load(f).get('queue', [])
            except:
                pass
        
        combined_queue = existing_queue + self.retry_queue
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({'queue': combined_queue}, f, ensure_ascii=False, indent=2)
        
        print(f"📝 재시도 큐 저장: {filepath} ({len(self.retry_queue)}건 추가, 총 {len(combined_queue)}건)")
    
    def calculate_match_rate(self, awards: List[Dict], bids_file: str) -> Dict:
        """입찰 데이터와 조인키 매칭율 계산"""
        if not os.path.exists(bids_file):
            print(f"⚠️ 입찰 파일을 찾을 수 없습니다: {bids_file}")
            return {'match_rate': 0, 'matched_count': 0, 'total_awards': len(awards)}
        
        try:
            with open(bids_file, 'r', encoding='utf-8') as f:
                bids = json.load(f)
            
            bid_ids = set([b['id'] for b in bids])
            matched_awards = [a for a in awards if a['bidId'] in bid_ids]
            match_rate = len(matched_awards) / len(awards) * 100 if awards else 0
            
            return {
                'match_rate': round(match_rate, 2),
                'matched_count': len(matched_awards),
                'total_awards': len(awards),
                'total_bids': len(bids)
            }
        except Exception as e:
            print(f"⚠️ 매칭율 계산 실패: {e}")
            return {'match_rate': 0, 'matched_count': 0, 'total_awards': len(awards)}


def main():
    parser = argparse.ArgumentParser(description='나라장터 낙찰 데이터 수집')
    parser.add_argument('--source', choices=['mock', 'real'], default='mock',
                       help='데이터 소스: mock (샘플) 또는 real (실제 API)')
    parser.add_argument('--count', type=int, default=50,
                       help='Mock 모드 생성 레코드 수 (기본: 50)')
    parser.add_argument('--pages', type=int, default=2,
                       help='Real 모드 페이지 수 (기본: 2)')
    parser.add_argument('--run-id', type=str,
                       help='실행 ID (없으면 timestamp 자동 생성)')
    parser.add_argument('--output-dir', type=str, default='./',
                       help='출력 디렉토리 (기본: ./)')
    parser.add_argument('--bids-file', type=str,
                       help='입찰 데이터 파일 경로 (조인키 매칭용)')
    parser.add_argument('--fail-rate', type=float, default=0.0,
                       help='Mock 실패 주입 확률 (0.0~1.0, 기본: 0.0=실패 없음)')
    parser.add_argument('--fast-retry', action='store_true',
                       help='빠른 재시도 모드 (실제 대기 생략, 테스트용)')
    
    args = parser.parse_args()
    
    # Run ID 생성
    run_id = args.run_id if args.run_id else datetime.now().strftime('%Y%m%d_%H%M%S')
    
    print("\n" + "="*70)
    print("🏆 Smart Bid Radar - 낙찰 데이터 수집 (Step 2)")
    print("="*70)
    print(f"소스: {args.source.upper()}")
    print(f"Run ID: {run_id}")
    if args.source == 'mock':
        print(f"생성 레코드 수: {args.count}건")
        if args.fail_rate > 0:
            print(f"⚠️ 실패 주입 모드: {args.fail_rate*100:.1f}% 확률")
            if args.fast_retry:
                print(f"⚡ 빠른 재시도 모드 (실제 대기 생략)")
            else:
                print(f"⏳ 실제 백오프 대기 적용 (운영 동일)")
    else:
        print(f"수집 페이지 수: {args.pages}페이지")
    print("="*70 + "\n")
    
    # 수집 실행
    start_time = time.time()
    awards_status = "FAIL"  # 기본값
    
    try:
        collector = AwardDataCollector(source=args.source, fail_rate=args.fail_rate, fast_retry=args.fast_retry)
        
        if args.source == 'mock':
            awards = collector.collect(count=args.count)
        else:
            awards = collector.collect(pages=args.pages)
        
        if not awards:
            print("❌ 수집된 데이터가 없습니다.")
            print(f"\n📊 awards_status: FAIL")
            
            # 재시도 큐 저장 (실패 시에도)
            collector.save_retry_queue(args.output_dir)
            
            duration = time.time() - start_time
            print(f"\n⏱️ 실행 시간: {duration:.2f}초")
            print("\n⚠️ 낙찰 데이터 수집 실패. 입찰 데이터는 영향받지 않습니다.\n")
            return
        
        # JSON 저장
        filepath = collector.save_to_json(awards, run_id, args.output_dir)
        
        # 재시도 큐 저장
        collector.save_retry_queue(args.output_dir)
        
        # 조인키 매칭율 계산 (옵션)
        match_result = None
        if args.bids_file:
            print(f"\n🔗 입찰-낙찰 조인키 매칭 분석 중...")
            match_result = collector.calculate_match_rate(awards, args.bids_file)
            print(f"✅ 매칭율: {match_result['match_rate']}% ({match_result['matched_count']}/{match_result['total_awards']})")
        
        # 수집 성공
        awards_status = "OK"
        duration = time.time() - start_time
        
        # 결과 요약
        print("\n" + "="*70)
        print("📊 수집 결과 요약")
        print("="*70)
        print(f"총 레코드 수: {len(awards)}건")
        print(f"저장 파일: {filepath}")
        print(f"재시도 큐: {len(collector.retry_queue)}건")
        if match_result:
            print(f"입찰-낙찰 매칭율: {match_result['match_rate']}%")
        print(f"awards_status: {awards_status}")
        print(f"실행 시간: {duration:.2f}초")
        print("="*70 + "\n")
        
    except Exception as e:
        awards_status = "FAIL"
        duration = time.time() - start_time
        
        print(f"\n❌ 오류 발생: {e}")
        print(f"📊 awards_status: {awards_status}")
        print(f"⏱️ 실행 시간: {duration:.2f}초")
        print("\n⚠️ 낙찰 데이터 수집 실패. 입찰 데이터는 영향받지 않습니다.\n")
        
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
