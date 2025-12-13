"""
나라장터 API 데이터 수집 스크립트
공공데이터포털 API를 통해 입찰 공고 데이터를 수집하고 Firestore에 저장
"""

import os
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict
import pandas as pd
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# 환경 변수 로드
load_dotenv()

# Firebase 초기화
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# 나라장터 API 설정
API_KEY = os.getenv('DATA_PORTAL_API_KEY')
BASE_URL = 'http://apis.data.go.kr/1230000/BidPublicInfoService04'

class BidDataCollector:
    """입찰 공고 데이터 수집 클래스"""
    
    def __init__(self):
        self.api_key = API_KEY
        self.base_url = BASE_URL
        
    def fetch_bid_announcements(self, days_back: int = 7) -> List[Dict]:
        """
        최근 N일간의 입찰 공고 수집
        
        Args:
            days_back: 조회할 과거 일수
            
        Returns:
            입찰 공고 리스트
        """
        print(f"📡 최근 {days_back}일간 입찰 공고 수집 시작...")
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        params = {
            'serviceKey': self.api_key,
            'numOfRows': 100,
            'pageNo': 1,
            'inqryDiv': '1',  # 1: 물품, 2: 용역, 3: 공사
            'inqryBgnDt': start_date.strftime('%Y%m%d'),
            'inqryEndDt': end_date.strftime('%Y%m%d'),
            'type': 'json'
        }
        
        try:
            response = requests.get(f'{self.base_url}/getBidPblancListInfoServc01', params=params)
            response.raise_for_status()
            
            data = response.json()
            items = data.get('response', {}).get('body', {}).get('items', [])
            
            print(f"✅ {len(items)}건의 공고 수집 완료")
            return items
            
        except Exception as e:
            print(f"❌ API 요청 실패: {e}")
            return []
    
    def transform_bid_data(self, raw_data: List[Dict]) -> List[Dict]:
        """
        원본 API 데이터를 Firestore 저장 형식으로 변환
        
        Args:
            raw_data: API에서 받은 원본 데이터
            
        Returns:
            변환된 데이터 리스트
        """
        transformed = []
        
        for item in raw_data:
            try:
                bid = {
                    'id': item.get('bidNtceNo', ''),  # 입찰공고번호
                    'title': item.get('bidNtceNm', ''),  # 공고명
                    'agency': item.get('ntceInsttNm', ''),  # 공고기관
                    'category': self._categorize(item.get('bidNtceNm', '')),
                    'region': self._extract_region(item.get('ntceInsttNm', '')),
                    'budget': self._parse_budget(item.get('asignBdgtAmt', '0')),
                    'estimatedPrice': self._parse_budget(item.get('presmptPrce', '0')),
                    'deadline': self._parse_date(item.get('bidClseDt', '')),
                    'announcementDate': self._parse_date(item.get('bidNtceDt', '')),
                    'bidMethod': item.get('bidMethdNm', ''),
                    'status': 'active',
                    'createdAt': datetime.now().isoformat(),
                    'description': item.get('bidNtceDtlUrl', ''),
                }
                transformed.append(bid)
            except Exception as e:
                print(f"⚠️ 데이터 변환 실패: {e}")
                continue
        
        return transformed
    
    def _categorize(self, title: str) -> str:
        """공고명으로부터 업종 분류"""
        if '건설' in title or '공사' in title or '시설' in title:
            return '건설'
        elif '소프트웨어' in title or 'SW' in title or '시스템' in title or '정보화' in title:
            return '소프트웨어'
        elif '용역' in title or '서비스' in title or '컨설팅' in title:
            return '용역'
        elif '물품' in title or '구매' in title or '납품' in title:
            return '물품'
        else:
            return '기타'
    
    def _extract_region(self, agency: str) -> str:
        """기관명으로부터 지역 추출"""
        regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', 
                  '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
        
        for region in regions:
            if region in agency:
                return region
        return '기타'
    
    def _parse_budget(self, amount: str) -> float:
        """예산 문자열을 숫자로 변환"""
        try:
            return float(str(amount).replace(',', ''))
        except:
            return 0.0
    
    def _parse_date(self, date_str: str) -> str:
        """날짜 문자열 변환 (YYYYMMDD HH:MM -> ISO format)"""
        try:
            if len(date_str) >= 8:
                dt = datetime.strptime(date_str[:8], '%Y%m%d')
                return dt.isoformat()
        except:
            pass
        return datetime.now().isoformat()
    
    def save_to_firestore(self, bids: List[Dict]) -> int:
        """
        Firestore에 입찰 데이터 저장
        
        Args:
            bids: 저장할 입찰 데이터 리스트
            
        Returns:
            저장된 건수
        """
        print(f"💾 Firestore에 {len(bids)}건 저장 시작...")
        
        saved_count = 0
        batch = db.batch()
        
        for i, bid in enumerate(bids):
            try:
                doc_ref = db.collection('bids').document(bid['id'])
                batch.set(doc_ref, bid, merge=True)
                saved_count += 1
                
                # 배치는 500개씩 처리
                if (i + 1) % 500 == 0:
                    batch.commit()
                    batch = db.batch()
                    print(f"  📦 {i + 1}건 저장 완료...")
                    
            except Exception as e:
                print(f"⚠️ 저장 실패 (ID: {bid.get('id')}): {e}")
        
        # 남은 데이터 커밋
        if saved_count % 500 != 0:
            batch.commit()
        
        print(f"✅ 총 {saved_count}건 저장 완료")
        return saved_count
    
    def run(self):
        """전체 수집 프로세스 실행"""
        print("\n" + "="*50)
        print("🚀 입찰 데이터 수집 시작")
        print("="*50 + "\n")
        
        # 1. 데이터 수집
        raw_data = self.fetch_bid_announcements(days_back=30)
        
        if not raw_data:
            print("⚠️ 수집된 데이터가 없습니다.")
            return
        
        # 2. 데이터 변환
        print("\n🔄 데이터 변환 중...")
        transformed_data = self.transform_bid_data(raw_data)
        
        # 3. Firestore 저장
        saved_count = self.save_to_firestore(transformed_data)
        
        print("\n" + "="*50)
        print(f"✨ 수집 완료: {saved_count}건")
        print("="*50 + "\n")


def main():
    """메인 실행 함수"""
    collector = BidDataCollector()
    collector.run()


if __name__ == '__main__':
    main()
