"""
Smart Bid Radar - FastAPI Server (Step 3-A)

Step 2 수집 스크립트를 API로 감싼 서버
collect_bids.py와 collect_awards.py를 수정하지 않고 호출만 함
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional
import subprocess
import json
import os
import time
import uuid
from datetime import datetime
from pathlib import Path
import logging

# 로깅 설정
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(name)s | %(levelname)s | %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Bid Radar API",
    description="나라장터 입찰/낙찰 데이터 수집 API (Step 3-A)",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Models ====================

class CollectRequest(BaseModel):
    mode: Literal["mock", "real"] = Field(..., description="수집 모드 (mock 또는 real)")
    run_id: Optional[str] = Field(None, description="실행 ID (미지정시 자동 생성)")
    pages: int = Field(3, ge=1, le=10, description="수집 페이지 수 (1-10)")
    count: Optional[int] = Field(None, ge=1, le=1000, description="Mock 모드시 레코드 수")
    force: bool = Field(False, description="기존 파일 덮어쓰기 여부")

class CollectResponse(BaseModel):
    status: Literal["completed", "failed"]
    run_id: str
    trace_id: str
    fetched_items: int
    stored_items: int
    errors_count: int
    duration_sec: float
    raw_file_path: Optional[str] = None
    error_message: Optional[str] = None

class RunStatusResponse(BaseModel):
    run_id: str
    exists: bool
    file_path: Optional[str] = None
    file_size_bytes: Optional[int] = None
    record_count: Optional[int] = None
    last_modified: Optional[str] = None
    status: Optional[str] = None

class AwardsCollectRequest(CollectRequest):
    bids_file: Optional[str] = Field(None, description="입찰 데이터 파일 경로 (조인키 매칭용)")

# ==================== Helper Functions ====================

def generate_trace_id() -> str:
    """고유 trace_id 생성"""
    return f"trace_{uuid.uuid4().hex[:12]}"

def generate_run_id(prefix: str) -> str:
    """run_id 자동 생성"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{prefix}_{timestamp}"

def get_raw_file_path(source: str, run_id: str, data_type: str) -> str:
    """raw 파일 경로 생성"""
    return f"collected_{data_type}_{source}_{run_id}.json"

def read_raw_file(file_path: str) -> Optional[dict]:
    """raw 파일 읽기"""
    if not os.path.exists(file_path):
        return None
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return {
                "record_count": len(data) if isinstance(data, list) else 0,
                "file_size_bytes": os.path.getsize(file_path),
                "last_modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
            }
    except Exception as e:
        logger.error(f"파일 읽기 실패: {file_path} - {e}")
        return None

def execute_collect_script(
    script_name: str,
    mode: str,
    run_id: str,
    pages: int,
    count: Optional[int] = None,
    bids_file: Optional[str] = None
) -> dict:
    """
    Step 2 수집 스크립트 실행 (Python import 방식)
    
    Args:
        script_name: "collect_bids.py" 또는 "collect_awards.py"
        mode: "mock" 또는 "real"
        run_id: 실행 ID
        pages: 페이지 수
        count: Mock 모드 레코드 수
        bids_file: collect_awards.py용 입찰 파일 경로
    
    Returns:
        실행 결과 딕셔너리
    """
    start_time = time.time()
    
    try:
        # Import collect_bids 모듈
        if script_name == "collect_bids.py":
            from collect_bids import BidDataCollector
            
            collector = BidDataCollector(source=mode)
            
            # Mock/Real 모드에 따라 수집
            if mode == "mock":
                bids = collector.collect(count=count or 200)
            else:
                bids = collector.collect(pages=pages)
            
            # 파일 저장
            collector.save_to_json(bids, run_id)
            
            fetched_items = len(bids)
            success = True
            error_message = None
            
        elif script_name == "collect_awards.py":
            from collect_awards import AwardDataCollector
            
            collector = AwardDataCollector(source=mode)
            
            # Mock/Real 모드에 따라 수집
            if mode == "mock":
                awards = collector.collect(count=count or 60)
            else:
                awards = collector.collect(pages=pages)
            
            # 파일 저장
            collector.save_to_json(awards, run_id)
            
            fetched_items = len(awards)
            success = True
            error_message = None
        
        else:
            raise ValueError(f"Unknown script: {script_name}")
        
        duration_sec = time.time() - start_time
        
        return {
            "success": success,
            "fetched_items": fetched_items,
            "stored_items": fetched_items,
            "errors_count": 0,
            "duration_sec": round(duration_sec, 2),
            "error_message": error_message
        }
        
    except Exception as e:
        duration_sec = time.time() - start_time
        logger.error(f"스크립트 실행 실패: {script_name} - {e}")
        return {
            "success": False,
            "fetched_items": 0,
            "stored_items": 0,
            "errors_count": 1,
            "duration_sec": round(duration_sec, 2),
            "error_message": str(e)
        }

# ==================== API Endpoints ====================

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/v1/collect/bids", response_model=CollectResponse)
async def collect_bids(request: CollectRequest):
    """
    입찰 공고 데이터 수집 API
    
    Step 2의 collect_bids.py를 호출하여 데이터 수집
    """
    trace_id = generate_trace_id()
    run_id = request.run_id or generate_run_id("api_bids")
    
    logger.info(f"[{trace_id}] 입찰 수집 시작 | run_id={run_id}, mode={request.mode}, pages={request.pages}")
    
    try:
        # collect_bids.py 실행
        result = execute_collect_script(
            script_name="collect_bids.py",
            mode=request.mode,
            run_id=run_id,
            pages=request.pages,
            count=request.count
        )
        
        # raw 파일 경로
        raw_file_path = get_raw_file_path(request.mode, run_id, "bids")
        
        # 응답 구성
        response = CollectResponse(
            status="completed" if result["success"] else "failed",
            run_id=run_id,
            trace_id=trace_id,
            fetched_items=result["fetched_items"],
            stored_items=result["stored_items"],
            errors_count=result["errors_count"],
            duration_sec=result["duration_sec"],
            raw_file_path=raw_file_path if result["success"] else None,
            error_message=result.get("error_message")
        )
        
        logger.info(
            f"[{trace_id}] 입찰 수집 완료 | status={response.status}, "
            f"fetched={response.fetched_items}, duration={response.duration_sec}s"
        )
        
        return response
        
    except Exception as e:
        logger.error(f"[{trace_id}] 입찰 수집 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/collect/awards", response_model=CollectResponse)
async def collect_awards(request: AwardsCollectRequest):
    """
    낙찰 정보 데이터 수집 API
    
    Step 2의 collect_awards.py를 호출하여 데이터 수집
    """
    trace_id = generate_trace_id()
    run_id = request.run_id or generate_run_id("api_awards")
    
    logger.info(f"[{trace_id}] 낙찰 수집 시작 | run_id={run_id}, mode={request.mode}, pages={request.pages}")
    
    try:
        # collect_awards.py 실행
        result = execute_collect_script(
            script_name="collect_awards.py",
            mode=request.mode,
            run_id=run_id,
            pages=request.pages,
            count=request.count,
            bids_file=request.bids_file
        )
        
        # raw 파일 경로
        raw_file_path = get_raw_file_path(request.mode, run_id, "awards")
        
        # 응답 구성
        response = CollectResponse(
            status="completed" if result["success"] else "failed",
            run_id=run_id,
            trace_id=trace_id,
            fetched_items=result["fetched_items"],
            stored_items=result["stored_items"],
            errors_count=result["errors_count"],
            duration_sec=result["duration_sec"],
            raw_file_path=raw_file_path if result["success"] else None,
            error_message=result.get("error_message")
        )
        
        logger.info(
            f"[{trace_id}] 낙찰 수집 완료 | status={response.status}, "
            f"fetched={response.fetched_items}, duration={response.duration_sec}s"
        )
        
        return response
        
    except Exception as e:
        logger.error(f"[{trace_id}] 낙찰 수집 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/runs/{run_id}", response_model=RunStatusResponse)
async def get_run_status(run_id: str, data_type: Literal["bids", "awards"] = "bids"):
    """
    실행 상태 조회 API
    
    run_id로 수집된 데이터 파일 정보 조회
    """
    logger.info(f"상태 조회 요청 | run_id={run_id}, data_type={data_type}")
    
    # 파일 경로 추론 (mock/real 둘 다 시도)
    mock_path = get_raw_file_path("mock", run_id, data_type)
    real_path = get_raw_file_path("real", run_id, data_type)
    
    file_path = None
    file_info = None
    
    if os.path.exists(mock_path):
        file_path = mock_path
        file_info = read_raw_file(mock_path)
    elif os.path.exists(real_path):
        file_path = real_path
        file_info = read_raw_file(real_path)
    
    if file_info:
        return RunStatusResponse(
            run_id=run_id,
            exists=True,
            file_path=file_path,
            file_size_bytes=file_info["file_size_bytes"],
            record_count=file_info["record_count"],
            last_modified=file_info["last_modified"],
            status="completed"
        )
    else:
        return RunStatusResponse(
            run_id=run_id,
            exists=False,
            status="not_found"
        )

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "Smart Bid Radar API",
        "version": "1.0.0",
        "step": "3-A (FastAPI 서버화)",
        "endpoints": {
            "health": "/health",
            "collect_bids": "POST /v1/collect/bids",
            "collect_awards": "POST /v1/collect/awards",
            "run_status": "GET /v1/runs/{run_id}"
        },
        "docs": "/docs"
    }

# ==================== Main ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
