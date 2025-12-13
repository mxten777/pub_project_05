"""
스케줄러 - 정기적인 데이터 수집 및 분석 실행
"""

import schedule
import time
from datetime import datetime
from collect_bids import BidDataCollector
from analyze_insights import BidAnalyzer

def run_collection():
    """데이터 수집 작업"""
    print(f"\n⏰ [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 데이터 수집 작업 시작")
    try:
        collector = BidDataCollector()
        collector.run()
    except Exception as e:
        print(f"❌ 수집 작업 실패: {e}")

def run_analysis():
    """데이터 분석 작업"""
    print(f"\n⏰ [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 데이터 분석 작업 시작")
    try:
        analyzer = BidAnalyzer()
        analyzer.run()
    except Exception as e:
        print(f"❌ 분석 작업 실패: {e}")

def main():
    """스케줄러 메인"""
    print("="*60)
    print("🤖 스마트 입찰 인텔리전스 스케줄러 시작")
    print("="*60)
    print("\n📅 스케줄 설정:")
    print("  - 데이터 수집: 매 3시간마다")
    print("  - 데이터 분석: 매일 자정")
    print("\n" + "="*60 + "\n")
    
    # 스케줄 설정
    schedule.every(3).hours.do(run_collection)  # 3시간마다 수집
    schedule.every().day.at("00:00").do(run_analysis)  # 매일 자정 분석
    
    # 즉시 한 번 실행
    run_collection()
    run_analysis()
    
    # 스케줄 실행
    while True:
        schedule.run_pending()
        time.sleep(60)  # 1분마다 체크

if __name__ == '__main__':
    main()
