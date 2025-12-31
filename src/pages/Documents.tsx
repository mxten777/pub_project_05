import { useState } from 'react'
import { FileText, Download, Sparkles, File, CheckSquare, BarChart, Copy, Share2, Printer, FileCheck } from 'lucide-react'

export default function Documents() {
  const [generating, setGenerating] = useState(false)
  const [documentType, setDocumentType] = useState<'proposal' | 'report' | 'checklist'>('proposal')
  const [formData, setFormData] = useState({
    bidTitle: '',
    companyName: '',
    companyInfo: '',
  })
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    
    // Simulate document generation
    setTimeout(() => {
      let mockDoc = ''
      
      if (documentType === 'proposal') {
        mockDoc = `
[제안요약서]

1. 사업 개요
   - 사업명: ${formData.bidTitle}
   - 제안사: ${formData.companyName}

2. 제안 내용
   ${formData.companyInfo}

3. 사업 수행 방안
   - 본 사업은 효율적이고 체계적인 수행 계획을 바탕으로 진행됩니다.
   - 최신 기술과 검증된 방법론을 활용하여 목표를 달성합니다.

4. 기대 효과
   - 효율성 증대
   - 비용 절감
   - 품질 향상

5. 결론
   저희 ${formData.companyName}는(은) 본 사업을 성공적으로 수행할 역량과 
   의지를 갖추고 있습니다.
        `
      } else if (documentType === 'report') {
        mockDoc = `
[기관별 분석 보고서]

분석 대상: ${formData.bidTitle}

1. 발주 기관 분석
   - 연간 발주 규모: 약 150건
   - 평균 낙찰률: 87.3%
   - 선호 업체 특성: 중견기업, 실적 중시

2. 경쟁 환경 분석
   - 평균 경쟁률: 5.2:1
   - 주요 경쟁사: 3~4개 업체
   - 시장 점유율: 상위 3사가 60% 차지

3. 입찰 전략 제안
   - 권장 투찰률: 86.5% ~ 88.0%
   - 강조 포인트: 기술력, 실적, 가격 경쟁력
   - 리스크 요인: 과도한 저가 입찰 주의

4. 성공 확률 평가
   - 예상 성공률: 72%
   - 신뢰 수준: 높음
        `
      } else {
        mockDoc = `
[입찰 참여 체크리스트]

□ 서류 준비
  ☑ 사업자등록증
  ☑ 법인등기부등본
  ☑ 재무제표
  ☑ 실적증명서
  ☐ 기술인력 보유 현황

□ 자격 요건
  ☑ 업종 적합성
  ☑ 면허/등록 여부
  ☐ 실적 요건 충족
  ☐ 기술등급 확인

□ 제출 서류
  ☐ 입찰서
  ☐ 입찰보증금
  ☐ 제안서
  ☐ 가격 명세서

□ 최종 점검
  ☐ 마감일시 확인
  ☐ 제출 방법 확인
  ☐ 담당자 연락처 확보
        `
      }
      
      setGeneratedDoc(mockDoc)
      setGenerating(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="card-premium p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">문서 자동화</h1>
            </div>
            <p className="text-gray-600 ml-15">AI 기반 입찰 문서 자동 생성</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50">
            <FileCheck className="w-5 h-5 text-pink-600" />
            <span className="text-sm font-bold text-pink-900">자동 생성</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => setDocumentType('proposal')}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 group ${
            documentType === 'proposal'
              ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 scale-105 shadow-xl'
              : 'card-premium hover:scale-105 hover:border-indigo-200'
          }`}
          data-testid="doc-template-proposal"
        >
          <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center transition-all ${
            documentType === 'proposal' 
              ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-indigo-100 group-hover:to-purple-100'
          }`}>
            <File className={`h-7 w-7 ${
              documentType === 'proposal' ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'
            }`} />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">제안요약서</h3>
          <p className="text-sm text-gray-600">입찰용 제안서 초안 생성</p>
        </button>

        <button
          onClick={() => setDocumentType('report')}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 group ${
            documentType === 'report'
              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-105 shadow-xl'
              : 'card-premium hover:scale-105 hover:border-purple-200'
          }`}
          data-testid="doc-template-report"
        >
          <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center transition-all ${
            documentType === 'report' 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-pink-100'
          }`}>
            <BarChart className={`h-7 w-7 ${
              documentType === 'report' ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'
            }`} />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">분석 보고서</h3>
          <p className="text-sm text-gray-600">기관별 분석 리포트</p>
        </button>

        <button
          onClick={() => setDocumentType('checklist')}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 group ${
            documentType === 'checklist'
              ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 scale-105 shadow-xl'
              : 'card-premium hover:scale-105 hover:border-pink-200'
          }`}
          data-testid="doc-template-checklist"
        >
          <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center transition-all ${
            documentType === 'checklist' 
              ? 'bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/50' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-pink-100 group-hover:to-rose-100'
          }`}>
            <CheckSquare className={`h-7 w-7 ${
              documentType === 'checklist' ? 'text-white' : 'text-gray-500 group-hover:text-pink-600'
            }`} />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">체크리스트</h3>
          <p className="text-sm text-gray-600">입찰 준비 확인 사항</p>
        </button>
      </div>

      <div className="space-y-6">
        <div className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            정보 입력
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                입찰 공고명
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all"
                value={formData.bidTitle}
                onChange={(e) => setFormData({ ...formData, bidTitle: e.target.value })}
                placeholder="예: 2024년 정보시스템 구축 사업"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                회사명
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="예: (주)테크솔루션"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                회사 소개 / 특장점
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all"
                value={formData.companyInfo}
                onChange={(e) => setFormData({ ...formData, companyInfo: e.target.value })}
                placeholder="회사의 주요 실적, 기술력, 강점 등을 입력하세요"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !formData.bidTitle}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:from-pink-700 hover:to-rose-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 group"
              data-testid="doc-generate"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>AI 문서 생성</span>
                </>
              )}
            </button>
          </div>
        </div>

        {generatedDoc && (
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                생성된 문서
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                  <Copy className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                  <Printer className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 max-h-[500px] overflow-y-auto border border-gray-200 shadow-inner">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {generatedDoc}
              </pre>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300" data-testid="doc-download-word">
                <Download className="h-5 w-5" />
                Word
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300" data-testid="doc-download-pdf">
                <Download className="h-5 w-5" />
                PDF
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300" data-testid="doc-download-txt">
                <Download className="h-5 w-5" />
                TXT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
