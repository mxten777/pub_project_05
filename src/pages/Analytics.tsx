import { useState, useEffect } from 'react'
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Insight } from '@/types'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { TrendingUp, Building, MapPin, Tag, Download, Calendar, FileText } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#06b6d4']

const getMockInsights = (): Insight[] => [
  { id: '1', type: 'agency', name: '서울특별시청', totalBids: 245, averageBudget: 350000000, averageWinRate: 88.2, averageCompetition: 5.4, period: '2024', trend: 12.5 },
  { id: '2', type: 'agency', name: '경기도청', totalBids: 189, averageBudget: 280000000, averageWinRate: 86.5, averageCompetition: 6.1, period: '2024', trend: 8.3 },
  { id: '3', type: 'agency', name: '인천광역시청', totalBids: 132, averageBudget: 420000000, averageWinRate: 87.8, averageCompetition: 4.9, period: '2024', trend: 15.2 },
  { id: '4', type: 'category', name: '소프트웨어', totalBids: 458, averageBudget: 320000000, averageWinRate: 87.5, averageCompetition: 5.8, period: '2024', trend: 18.7 },
  { id: '5', type: 'category', name: '건설', totalBids: 612, averageBudget: 890000000, averageWinRate: 85.2, averageCompetition: 7.2, period: '2024', trend: 5.4 },
  { id: '6', type: 'category', name: '용역', totalBids: 385, averageBudget: 180000000, averageWinRate: 88.9, averageCompetition: 4.5, period: '2024', trend: 11.3 },
  { id: '7', type: 'region', name: '서울', totalBids: 523, averageBudget: 410000000, averageWinRate: 87.8, averageCompetition: 6.3, period: '2024', trend: 14.2 },
  { id: '8', type: 'region', name: '경기', totalBids: 445, averageBudget: 320000000, averageWinRate: 86.4, averageCompetition: 5.9, period: '2024', trend: 9.8 },
  { id: '9', type: 'region', name: '부산', totalBids: 198, averageBudget: 280000000, averageWinRate: 88.1, averageCompetition: 5.2, period: '2024', trend: 7.5 }
]

export default function Analytics() {
  const [insights, setInsights] = useState<Insight[]>(getMockInsights())
  const [viewType, setViewType] = useState<'agency' | 'category' | 'region'>('agency')
  const [dateRange, setDateRange] = useState('2024')
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    // Firebase 데이터는 백그라운드에서 로드
    if (db) {
      loadInsights()
    }
  }, [])

  const loadInsights = async () => {
    if (!db) return
    
    try {
      const insightsQuery = query(collection(db, 'insights'))
      const snapshot = await getDocs(insightsQuery)
      const insightsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Insight))
      
      if (insightsData.length > 0) {
        setInsights(insightsData)
      }
    } catch (error) {
      console.error('Error loading insights:', error)
    }
  }

  const filteredInsights = insights.filter(i => i.type === viewType)

  const chartData = filteredInsights.slice(0, 10).map(insight => ({
    name: insight.name,
    입찰건수: insight.totalBids,
    평균예산: Math.round(insight.averageBudget / 100000000),
    낙찰률: insight.averageWinRate,
  }))

  const pieData = filteredInsights.slice(0, 6).map(insight => ({
    name: insight.name,
    value: insight.totalBids
  }))

  const exportToCSV = () => {
    const headers = ['이름', '총 입찰', '평균 예산', '평균 낙찰률', '평균 경쟁률', '트렌드']
    const rows = filteredInsights.map(i => [
      i.name,
      i.totalBids,
      i.averageBudget,
      i.averageWinRate,
      i.averageCompetition,
      i.trend
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analytics_${viewType}_${Date.now()}.csv`
    link.click()
    setShowExportMenu(false)
  }

  const exportToJSON = () => {
    const json = JSON.stringify(filteredInsights, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analytics_${viewType}_${Date.now()}.json`
    link.click()
    setShowExportMenu(false)
  }

  return (
    <div className="space-y-6">
      <div className="card-premium p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">분석 대시보드</h1>
            <p className="text-gray-600">입찰 히스토리 및 트렌드 분석</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="pl-10 pr-8 py-2.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white hover:border-indigo-300 transition-all appearance-none cursor-pointer"
              >
                <option value="2024">2024년</option>
                <option value="2023">2023년</option>
                <option value="2022">2022년</option>
                <option value="all">전체</option>
              </select>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">내보내기</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 card-premium p-2 shadow-xl z-10">
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4 text-indigo-600" />
                    CSV 파일
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4 text-purple-600" />
                    JSON 파일
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setViewType('agency')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            viewType === 'agency'
              ? 'gradient-primary text-white shadow-lg shadow-indigo-500/50 scale-105'
              : 'card-premium text-gray-700 hover:scale-105'
          }`}
        >
          <Building className="h-4 w-4" />
          기관별
        </button>
        <button
          onClick={() => setViewType('category')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            viewType === 'category'
              ? 'gradient-primary text-white shadow-lg shadow-indigo-500/50 scale-105'
              : 'card-premium text-gray-700 hover:scale-105'
          }`}
        >
          <Tag className="h-4 w-4" />
          업종별
        </button>
        <button
          onClick={() => setViewType('region')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            viewType === 'region'
              ? 'gradient-primary text-white shadow-lg shadow-indigo-500/50 scale-105'
              : 'card-premium text-gray-700 hover:scale-105'
          }`}
        >
          <MapPin className="h-4 w-4" />
          지역별
        </button>
      </div>

      {filteredInsights.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <p className="text-gray-500">분석 데이터가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">입찰 건수 추이</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: '2px solid #e0e7ff', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="입찰건수" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} animationDuration={800} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">입찰 분포</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={800}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: '2px solid #e0e7ff', 
                      borderRadius: '12px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">평균 낙찰률</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: '2px solid #e0e7ff', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="낙찰률" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8 }} 
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">평균 예산 (억원)</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: '2px solid #e0e7ff', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="평균예산" 
                    stroke="#f59e0b" 
                    fill="url(#budgetGradient)" 
                    strokeWidth={2}
                    animationDuration={800}
                  />
                  <defs>
                    <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-premium overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-indigo-900">상세 통계</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {filteredInsights.length}개 항목
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {viewType === 'agency' ? '기관명' : viewType === 'category' ? '업종' : '지역'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      총 입찰
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      평균 예산
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      평균 낙찰률
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      평균 경쟁률
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      트렌드
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredInsights.map((insight, index) => (
                    <tr 
                      key={insight.id} 
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{insight.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{insight.totalBids}</span>
                        <span className="text-xs text-gray-500 ml-1">건</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {(insight.averageBudget / 100000000).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">억원</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${insight.averageWinRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                            {insight.averageWinRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {insight.averageCompetition.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">:1</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          insight.trend > 0 
                            ? 'bg-green-100 text-green-700' 
                            : insight.trend < 0 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <TrendingUp className={`h-3 w-3 ${insight.trend < 0 ? 'rotate-180' : ''}`} />
                          {Math.abs(insight.trend).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
