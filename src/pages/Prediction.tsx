import { useState } from 'react'
import { Target, TrendingUp, AlertCircle, Sparkles, Calculator, BarChart3, Lightbulb, Zap, Award, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'

interface PredictionResult {
  predictedRate: number
  rangeMin: number
  rangeMax: number
  recommendedBid: number
  confidence: number
  factors: {
    agency: number
    category: number
    budget: number
    historical: number
  }
}

export default function Prediction() {
  const [formData, setFormData] = useState({
    agency: '',
    category: '',
    budget: '',
    bidMethod: '',
  })
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    setLoading(true)
    
    // Simulate ML prediction
    setTimeout(() => {
      const mockPrediction: PredictionResult = {
        predictedRate: 87.3,
        rangeMin: 85.1,
        rangeMax: 89.5,
        recommendedBid: parseFloat(formData.budget) * 0.873,
        confidence: 94.2,
        factors: {
          agency: 0.35,
          category: 0.25,
          budget: 0.20,
          historical: 0.20,
        }
      }
      setPrediction(mockPrediction)
      setLoading(false)
    }, 1500)
  }

  // Prepare chart data
  const trendData = [
    { month: '1월', rate: 85.2 },
    { month: '2월', rate: 86.1 },
    { month: '3월', rate: 85.8 },
    { month: '4월', rate: 87.0 },
    { month: '5월', rate: 86.5 },
    { month: '6월', rate: 87.3 },
  ]

  const radarData = prediction ? [
    { subject: '기관 특성', value: prediction.factors.agency * 100, fullMark: 100 },
    { subject: '업종 특성', value: prediction.factors.category * 100, fullMark: 100 },
    { subject: '예산 규모', value: prediction.factors.budget * 100, fullMark: 100 },
    { subject: '과거 데이터', value: prediction.factors.historical * 100, fullMark: 100 },
  ] : []

  const comparisonData = [
    { strategy: '공격적', rate: '89.5%', risk: '높음', color: 'red' },
    { strategy: '권장', rate: '87.3%', risk: '중간', color: 'green' },
    { strategy: '보수적', rate: '85.1%', risk: '낮음', color: 'blue' },
  ]

  return (
    <div className="space-y-6">
      <div className="card-premium p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">투찰가 예측</h1>
            </div>
            <p className="text-gray-600 ml-15">AI 기반 낙찰률 및 투찰가 예측</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-900">AI 예측 엔진</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card-premium p-6 sm:p-8 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-500" />
              입찰 정보 입력
            </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                발주기관
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                placeholder="예: 서울시청"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                업종
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">선택하세요</option>
                <option value="건설">건설</option>
                <option value="용역">용역</option>
                <option value="물품">물품</option>
                <option value="소프트웨어">소프트웨어</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                추정가격 (원)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="예: 100000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                입찰방식
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                value={formData.bidMethod}
                onChange={(e) => setFormData({ ...formData, bidMethod: e.target.value })}
              >
                <option value="">선택하세요</option>
                <option value="일반경쟁">일반경쟁</option>
                <option value="제한경쟁">제한경쟁</option>
                <option value="지명경쟁">지명경쟁</option>
              </select>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading || !formData.agency || !formData.budget}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI 분석 중...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>예측 시작</span>
                </>
              )}
            </button>
          </div>
        </div>
        </div>

        {prediction && (
          <div className="lg:col-span-2 space-y-6">
            {/* Main Prediction Card */}
            <div className="card-premium p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Target className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold">AI 예측 결과</h2>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span className="text-sm font-bold">신뢰도 {prediction.confidence}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <div className="text-sm text-white/80 mb-2">예상 낙찰률</div>
                    <div className="text-6xl font-bold mb-3">{prediction.predictedRate}%</div>
                    <div className="flex items-center gap-2 text-white/90">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">신뢰구간: {prediction.rangeMin}% ~ {prediction.rangeMax}%</span>
                    </div>
                  </div>
                  
                  <div className="md:border-l md:border-white/30 md:pl-8">
                    <div className="text-sm text-white/80 mb-2">권장 투찰가</div>
                    <div className="text-5xl font-bold mb-3">
                      {(prediction.recommendedBid / 100000000).toFixed(2)}억원
                    </div>
                    <div className="text-sm text-white/90">
                      추정가격 대비 {prediction.predictedRate}% 수준
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Comparison */}
            <div className="card-premium p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                투찰 전략 비교
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {comparisonData.map((item) => (
                  <div
                    key={item.strategy}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      item.strategy === '권장'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900">{item.strategy}</span>
                      {item.strategy === '권장' && (
                        <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                          추천
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{item.rate}</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.color === 'red' ? 'bg-red-500' :
                        item.color === 'green' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm text-gray-600">리스크: {item.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">예측 신뢰도</h3>
              </div>
              <div className="mb-2 flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">신뢰도</span>
                <span className="font-semibold text-gray-900">{prediction.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div
                  className="bg-green-500 h-2 sm:h-3 rounded-full transition-all"
                  style={{ width: `${prediction.confidence}%` }}
                />
              </div>
            </div>

            {/* Factors Analysis - Radar Chart */}
            <div className="card-premium p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                영향 요인 분석
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Radar
                      name="영향도"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Historical Trend */}
            <div className="card-premium p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                낙찰률 추세 (최근 6개월)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis domain={[80, 90]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRate)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Warning Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-yellow-800">
                  <p className="font-medium mb-1">예측 참고사항</p>
                  <p>본 예측은 과거 데이터 기반 참고용이며, 실제 입찰 결과와 다를 수 있습니다. 최종 투찰가 결정 시 전문가 검토를 권장합니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
