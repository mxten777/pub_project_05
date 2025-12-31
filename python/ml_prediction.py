"""
AI 예측 모델 (MVP v1.1 Baseline 버전)
입찰 공고에 대한 예상 낙찰률 예측

⚠️ MVP 제한사항:
- Baseline 알고리즘만 구현 (XGBoost/LightGBM 미사용)
- 통계 기반 예측 (기관/업종/지역 평균 가중치 적용)
- 히스토리 데이터가 부족할 경우 낮은 신뢰도 반환
"""

import os
from datetime import datetime
from typing import Dict, List, Optional
import statistics
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

# Firebase 초기화 (중복 방지)
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate('python/serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
    except FileNotFoundError:
        print("⚠️ serviceAccountKey.json 파일이 없습니다. Mock 모드로만 실행 가능합니다.")

db = firestore.client() if firebase_admin._apps else None


class BaselinePredictionModel:
    """
    Baseline 예측 모델
    
    알고리즘:
    - 기관별 평균 낙찰률 (40% 가중치)
    - 업종별 평균 낙찰률 (30% 가중치)
    - 지역별 평균 낙찰률 (20% 가중치)
    - 예산 규모 보정 (10% 가중치)
    """
    
    # 기본값 (히스토리 데이터 없을 때)
    DEFAULT_RATE = 87.5
    DEFAULT_CONFIDENCE = 0.4
    
    # 가중치
    WEIGHTS = {
        'agency': 0.40,
        'category': 0.30,
        'region': 0.20,
        'budget': 0.10
    }
    
    def __init__(self, mock_mode: bool = True):
        """
        Args:
            mock_mode: True면 샘플 히스토리 사용, False면 실제 Firestore 조회
        """
        self.mock_mode = mock_mode
        self.history_cache = {}
        
    def predict(self, bid_data: Dict) -> Dict:
        """
        입찰 공고에 대한 낙찰률 예측
        
        Args:
            bid_data: {
                'bid_id': str,
                'agency': str,
                'category': str,
                'region': str,
                'budget': float
            }
        
        Returns:
            예측 결과 딕셔너리
        """
        print(f"\n🔮 예측 시작: {bid_data.get('bid_id', 'N/A')}")
        
        # 1. 히스토리 데이터 수집
        history = self._get_history_data(bid_data)
        
        # 2. 각 요소별 평균 낙찰률 계산
        agency_rate = history.get('agency_avg', self.DEFAULT_RATE)
        category_rate = history.get('category_avg', self.DEFAULT_RATE)
        region_rate = history.get('region_avg', self.DEFAULT_RATE)
        budget_factor = self._calculate_budget_factor(bid_data.get('budget', 0))
        
        # 3. 가중 평균 계산
        predicted_rate = (
            agency_rate * self.WEIGHTS['agency'] +
            category_rate * self.WEIGHTS['category'] +
            region_rate * self.WEIGHTS['region'] +
            budget_factor * self.WEIGHTS['budget']
        )
        
        # 4. 신뢰도 계산
        confidence = self._calculate_confidence(history.get('total_count', 0))
        
        # 5. 신뢰 구간 계산 (±3%p)
        range_width = 3.0 * (1 - confidence)  # 신뢰도 낮을수록 구간 넓어짐
        range_min = max(predicted_rate - range_width, 70.0)
        range_max = min(predicted_rate + range_width, 100.0)
        
        # 6. 투찰 전략 생성
        strategies = self._generate_strategies(predicted_rate, confidence)
        
        # 7. 결과 생성
        result = {
            'success': True,
            'prediction': {
                'bid_id': bid_data.get('bid_id', ''),
                'predicted_rate': round(predicted_rate, 2),
                'confidence': round(confidence, 2),
                'range_min': round(range_min, 2),
                'range_max': round(range_max, 2),
                'recommended_strategy': '권장 투찰률',
                'strategies': strategies,
                'factors': {
                    'agency_avg': round(agency_rate, 2),
                    'category_avg': round(category_rate, 2),
                    'region_avg': round(region_rate, 2),
                    'budget_factor': round(budget_factor, 2),
                    'competition_level': self._estimate_competition(history)
                },
                'disclaimer': '이 예측은 참고용이며, 실제 낙찰률과 다를 수 있습니다.',
                'created_at': datetime.now().isoformat()
            }
        }
        
        print(f"✅ 예측 완료: {predicted_rate:.1f}% (신뢰도: {confidence:.0%})")
        return result
    
    def _get_history_data(self, bid_data: Dict) -> Dict:
        """히스토리 데이터 조회"""
        if self.mock_mode:
            return self._generate_mock_history(bid_data)
        else:
            return self._fetch_real_history(bid_data)
    
    def _generate_mock_history(self, bid_data: Dict) -> Dict:
        """샘플 히스토리 데이터 생성"""
        import random
        
        # 기관별 특성 반영
        agency_rates = {
            '조달청': 88.2,
            '한국정보화진흥원': 86.5,
            '서울시청': 87.8,
            '경기도청': 88.5,
            '행정안전부': 87.2,
            '과학기술정보통신부': 86.0
        }
        
        # 업종별 평균
        category_rates = {
            '소프트웨어': 86.8,
            '용역': 88.5,
            '물품': 89.2,
            '건설': 87.5
        }
        
        # 지역별 평균
        region_rates = {
            '서울': 87.0,
            '경기': 88.0,
            '인천': 87.5,
            '부산': 88.5,
            '대전': 87.2,
            '대구': 88.0
        }
        
        agency = bid_data.get('agency', '')
        category = bid_data.get('category', '')
        region = bid_data.get('region', '')
        
        return {
            'agency_avg': agency_rates.get(agency, self.DEFAULT_RATE),
            'category_avg': category_rates.get(category, self.DEFAULT_RATE),
            'region_avg': region_rates.get(region, self.DEFAULT_RATE),
            'total_count': random.randint(15, 50),  # 히스토리 데이터 개수
            'avg_competition': random.uniform(3.5, 6.5)  # 평균 경쟁률
        }
    
    def _fetch_real_history(self, bid_data: Dict) -> Dict:
        """실제 Firestore에서 히스토리 조회"""
        if not db:
            print("⚠️ Firebase 연결이 없습니다. Mock 데이터를 사용합니다.")
            return self._generate_mock_history(bid_data)
        
        try:
            # 간단한 쿼리: 최근 1년간 동일 기관/업종 데이터
            history_ref = db.collection('history')
            
            # 기관별 평균
            agency_query = history_ref.where('agency', '==', bid_data.get('agency', '')).limit(30)
            agency_docs = list(agency_query.stream())
            agency_rates = [doc.to_dict().get('winnerRate', self.DEFAULT_RATE) for doc in agency_docs]
            
            # 업종별 평균
            category_query = history_ref.where('category', '==', bid_data.get('category', '')).limit(30)
            category_docs = list(category_query.stream())
            category_rates = [doc.to_dict().get('winnerRate', self.DEFAULT_RATE) for doc in category_docs]
            
            return {
                'agency_avg': statistics.mean(agency_rates) if agency_rates else self.DEFAULT_RATE,
                'category_avg': statistics.mean(category_rates) if category_rates else self.DEFAULT_RATE,
                'region_avg': self.DEFAULT_RATE,  # 간소화
                'total_count': len(agency_docs) + len(category_docs),
                'avg_competition': 4.5
            }
        except Exception as e:
            print(f"⚠️ 히스토리 조회 실패: {e}")
            return self._generate_mock_history(bid_data)
    
    def _calculate_budget_factor(self, budget: float) -> float:
        """예산 규모에 따른 보정 계수"""
        if budget < 30_000_000:  # 3천만원 미만
            return self.DEFAULT_RATE * 1.02  # 소액은 경쟁 약함
        elif budget < 100_000_000:  # 1억 미만
            return self.DEFAULT_RATE
        elif budget < 500_000_000:  # 5억 미만
            return self.DEFAULT_RATE * 0.98
        else:  # 5억 이상
            return self.DEFAULT_RATE * 0.96  # 대형은 경쟁 심화
    
    def _calculate_confidence(self, historical_count: int) -> float:
        """히스토리 데이터 개수 기반 신뢰도 계산"""
        if historical_count >= 30:
            return 0.85
        elif historical_count >= 20:
            return 0.75
        elif historical_count >= 10:
            return 0.60
        elif historical_count >= 5:
            return 0.45
        else:
            return self.DEFAULT_CONFIDENCE
    
    def _generate_strategies(self, predicted_rate: float, confidence: float) -> List[Dict]:
        """3가지 투찰 전략 생성"""
        return [
            {
                'type': 'aggressive',
                'rate': round(predicted_rate + 3.0, 1),
                'win_probability': round(0.3 * confidence, 2),
                'description': '공격적 전략 (높은 투찰률, 낮은 낙찰 확률)'
            },
            {
                'type': 'recommended',
                'rate': round(predicted_rate, 1),
                'win_probability': round(0.7 * confidence, 2),
                'description': '권장 전략 (균형잡힌 접근)'
            },
            {
                'type': 'conservative',
                'rate': round(predicted_rate - 3.0, 1),
                'win_probability': round(0.9 * confidence, 2),
                'description': '보수적 전략 (낮은 투찰률, 높은 낙찰 확률)'
            }
        ]
    
    def _estimate_competition(self, history: Dict) -> str:
        """경쟁 수준 추정"""
        avg_comp = history.get('avg_competition', 4.0)
        if avg_comp >= 6:
            return 'high'
        elif avg_comp >= 4:
            return 'medium'
        else:
            return 'low'
    
    def save_prediction(self, prediction: Dict) -> bool:
        """예측 결과를 Firestore에 저장"""
        if not db:
            print("⚠️ Firebase 연결이 없습니다. 예측 결과를 저장할 수 없습니다.")
            return False
        
        try:
            doc_id = f"{prediction['bid_id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            db.collection('predictions').document(doc_id).set(prediction)
            print(f"✅ 예측 결과 저장 완료: {doc_id}")
            return True
        except Exception as e:
            print(f"❌ 예측 결과 저장 실패: {e}")
            return False


def predict_batch(bid_list: List[Dict], save_results: bool = False) -> List[Dict]:
    """
    여러 입찰 공고에 대해 일괄 예측
    
    Args:
        bid_list: 입찰 데이터 리스트
        save_results: True면 결과를 Firestore에 저장
    
    Returns:
        예측 결과 리스트
    """
    model = BaselinePredictionModel(mock_mode=True)
    results = []
    
    print("\n" + "="*60)
    print(f"🔮 일괄 예측 시작 ({len(bid_list)}건)")
    print("="*60)
    
    for i, bid_data in enumerate(bid_list, 1):
        print(f"\n[{i}/{len(bid_list)}] 예측 중...")
        result = model.predict(bid_data)
        results.append(result)
        
        if save_results:
            model.save_prediction(result['prediction'])
    
    print("\n" + "="*60)
    print(f"✨ 일괄 예측 완료: {len(results)}건")
    print("="*60 + "\n")
    
    return results


if __name__ == "__main__":
    """
    실행 방법:
    
    1. 단일 예측 (Mock 모드):
       python ml_prediction.py
    
    2. 단일 예측 + DB 저장:
       python ml_prediction.py --save
    """
    import sys
    
    save_results = '--save' in sys.argv
    
    # 샘플 입찰 데이터
    sample_bid = {
        'bid_id': '20250001-12345',
        'agency': '조달청',
        'category': '소프트웨어',
        'region': '서울',
        'budget': 75000000
    }
    
    print("\n" + "="*60)
    print("🤖 Smart Bid Radar - AI 예측 시스템 (Baseline)")
    print("="*60)
    print(f"\n📋 입찰 정보:")
    print(f"   - 공고번호: {sample_bid['bid_id']}")
    print(f"   - 발주기관: {sample_bid['agency']}")
    print(f"   - 업종: {sample_bid['category']}")
    print(f"   - 지역: {sample_bid['region']}")
    print(f"   - 예산: {sample_bid['budget']:,}원")
    
    # 예측 실행
    model = BaselinePredictionModel(mock_mode=True)
    result = model.predict(sample_bid)
    
    # 결과 출력
    pred = result['prediction']
    print(f"\n🎯 예측 결과:")
    print(f"   - 예상 낙찰률: {pred['predicted_rate']}%")
    print(f"   - 신뢰 구간: {pred['range_min']}% ~ {pred['range_max']}%")
    print(f"   - 신뢰도: {pred['confidence']*100:.0f}%")
    
    print(f"\n💡 투찰 전략:")
    for strategy in pred['strategies']:
        print(f"   - {strategy['description']}: {strategy['rate']}% (낙찰확률 {strategy['win_probability']*100:.0f}%)")
    
    print(f"\n📊 영향 요인:")
    for key, value in pred['factors'].items():
        print(f"   - {key}: {value}")
    
    print(f"\n⚠️ {pred['disclaimer']}")
    
    # 저장
    if save_results:
        model.save_prediction(pred)
    
    print("\n" + "="*60)
    print("✨ 예측 완료")
    print("="*60 + "\n")
