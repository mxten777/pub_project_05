"""문서 생성 테스트 스크립트"""
from document_generator import DocumentGenerator

# 샘플 입찰 데이터
sample_bid = {
    'id': '20250001-test',
    'title': '소프트웨어 개발 사업',
    'agency': '조달청',
    'category': '소프트웨어',
    'region': '서울',
    'budget': 50000000,
    'deadline': '2025-01-15T23:59:59'
}

# 문서 생성기 초기화
gen = DocumentGenerator(use_ai=False)

# 체크리스트 생성
print("\n" + "="*60)
print("📄 체크리스트 생성 테스트")
print("="*60)
doc = gen.generate_document(sample_bid, 'checklist')

print(f"\n✅ 문서 생성 완료")
print(f"   - 문서 ID: {doc['id']}")
print(f"   - 제목: {doc['title']}")
print(f"   - 글자 수: {len(doc['content'])} 글자")
print(f"   - AI 사용: {doc['metadata']['ai_generated']}")

print(f"\n📄 문서 내용 미리보기 (첫 20줄):")
print("="*60)
lines = doc['content'].split('\n')
for i, line in enumerate(lines[:20], 1):
    print(line)

print("="*60)
print(f"✨ 테스트 완료 (전체 {len(lines)}줄)")
