import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Bid } from '@/types'
import { TrendingUp, DollarSign, FileText, Clock, Star, Bell, Target, Search, Sparkles, Settings as SettingsIcon, ArrowRight, Calendar, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  trend?: 'up' | 'down'
  trendData?: number[]
}

function StatsCard({ title, value, change, icon, trend = 'up', trendData }: StatsCardProps) {
  const chartData = trendData?.map((val, idx) => ({ value: val, index: idx })) || []
  
  return (
    <div className="card-premium p-6 hover:scale-105 transition-all duration-300 group relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-3">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {change && (
              <div className="flex items-center gap-2">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <p className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {change}
                </p>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            {icon}
          </div>
        </div>
        
        {/* Mini trend chart */}
        {trendData && trendData.length > 0 && (
          <div className="h-12 -mx-2 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={trend === 'up' ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

// Quick action button component
interface QuickActionProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  color: 'indigo' | 'purple' | 'pink' | 'blue'
}

function QuickAction({ title, description, icon, onClick, color }: QuickActionProps) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
  }
  
  return (
    <button
      onClick={onClick}
      className={`card-premium p-6 hover:scale-105 transition-all duration-300 group text-left w-full`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </button>
  )
}

const getMockBids = (): Bid[] => [
  {
    id: '1',
    title: '2024년 스마트시티 통합플랫폼 구축사업',
    agency: '서울특별시청',
    category: '소프트웨어',
    region: '서울',
    budget: 500000000,
    deadline: '2024-12-31',
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '2',
    title: '공공데이터 개방 시스템 고도화',
    agency: '경기도청',
    category: '소프트웨어',
    region: '경기',
    budget: 300000000,
    deadline: '2024-12-25',
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '3',
    title: '청사 리모델링 공사',
    agency: '인천광역시청',
    category: '건설',
    region: '인천',
    budget: 1200000000,
    deadline: '2024-12-28',
    createdAt: new Date().toISOString(),
    status: 'modified'
  }
]

export default function Dashboard() {
  const [recentBids, setRecentBids] = useState<Bid[]>(getMockBids())

  useEffect(() => {
    // Firebase에서 실제 데이터를 백그라운드로 로드
    if (db) {
      loadDashboardData()
    }
  }, [])

  const loadDashboardData = async () => {
    if (!db) return
    
    try {
      const bidsQuery = query(
        collection(db, 'bids'),
        orderBy('createdAt', 'desc'),
        limit(8)
      )
      const snapshot = await getDocs(bidsQuery)
      const bidsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Bid))
      
      if (bidsData.length > 0) {
        setRecentBids(bidsData)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  // Calculate D-day
  const calculateDday = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '마감'
    if (diffDays === 0) return 'D-Day'
    return `D-${diffDays}`
  }

  // Navigation handlers
  const handleSearch = () => window.location.href = '/bidradar'
  const handlePrediction = () => window.location.href = '/prediction'
  const handleDocuments = () => window.location.href = '/documents'
  const handleSettings = () => window.location.href = '/settings'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-premium p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">대시보드</h1>
            <p className="text-gray-600">입찰·조달 인텔리전스 플랫폼 실시간 현황</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="신규 공고"
          value="127"
          change="+12.5%"
          icon={<FileText className="h-8 w-8" />}
          trend="up"
          trendData={[85, 92, 88, 95, 103, 115, 127]}
        />
        <StatsCard
          title="진행중 입찰"
          value="89"
          icon={<Clock className="h-8 w-8" />}
          trendData={[95, 93, 88, 91, 87, 90, 89]}
        />
        <StatsCard
          title="평균 예산"
          value="1.2억"
          change="+8.3%"
          icon={<DollarSign className="h-8 w-8" />}
          trend="up"
          trendData={[0.9, 1.0, 1.1, 1.05, 1.15, 1.18, 1.2]}
        />
        <StatsCard
          title="예측 정확도"
          value="94.2%"
          change="+2.1%"
          icon={<Target className="h-8 w-8" />}
          trend="up"
          trendData={[89, 90, 91, 92, 93, 93.5, 94.2]}
        />
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="즐겨찾기"
          value="24"
          change="+3"
          icon={<Star className="h-8 w-8" />}
          trend="up"
          trendData={[18, 19, 20, 21, 22, 23, 24]}
        />
        <StatsCard
          title="알림 설정"
          value="15"
          icon={<Bell className="h-8 w-8" />}
          trendData={[12, 13, 14, 14, 15, 15, 15]}
        />
        <StatsCard
          title="성공률"
          value="78.5%"
          change="+5.2%"
          icon={<Sparkles className="h-8 w-8" />}
          trend="up"
          trendData={[70, 72, 73, 75, 76, 77, 78.5]}
        />
        <StatsCard
          title="참여율"
          value="82.3%"
          change="-1.5%"
          icon={<TrendingUp className="h-8 w-8" />}
          trend="down"
          trendData={[85, 84.5, 84, 83.5, 83, 82.5, 82.3]}
        />
      </div>

      {/* Quick Actions */}
      <div className="card-premium p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            title="입찰 검색"
            description="최신 공고를 실시간으로 확인하세요"
            icon={<Search className="h-6 w-6" />}
            onClick={handleSearch}
            color="indigo"
          />
          <QuickAction
            title="투찰 예측"
            description="AI 기반 낙찰가 예측 분석"
            icon={<Sparkles className="h-6 w-6" />}
            onClick={handlePrediction}
            color="purple"
          />
          <QuickAction
            title="서류 생성"
            description="입찰 서류를 자동으로 생성하세요"
            icon={<FileText className="h-6 w-6" />}
            onClick={handleDocuments}
            color="pink"
          />
          <QuickAction
            title="설정"
            description="알림 및 개인화 설정 관리"
            icon={<SettingsIcon className="h-6 w-6" />}
            onClick={handleSettings}
            color="blue"
          />
        </div>
      </div>

      {/* Recent Bids */}
      <div className="card-premium overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-indigo-900">최근 입찰 공고</h2>
              <p className="text-sm text-indigo-700 mt-1">실시간 업데이트</p>
            </div>
            <button 
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm text-indigo-600 font-semibold hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span>모두 보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentBids.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              등록된 입찰 공고가 없습니다.
            </div>
          ) : (
            recentBids.map((bid) => (
              <div key={bid.id} className="p-6 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{bid.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
                        {bid.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {bid.agency}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {bid.region}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                        <span className="font-semibold text-indigo-600">{(bid.budget / 100000000).toFixed(1)}억원</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* D-day badge */}
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      calculateDday(bid.deadline) === '마감' ? 'bg-gray-200 text-gray-700' :
                      calculateDday(bid.deadline) === 'D-Day' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' :
                      parseInt(calculateDday(bid.deadline).replace('D-', '')) <= 3 ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white' :
                      'bg-gradient-to-r from-blue-400 to-indigo-400 text-white'
                    }`}>
                      {calculateDday(bid.deadline)}
                    </span>
                    {/* Status badge */}
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm ${
                      bid.status === 'active' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                      bid.status === 'modified' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {bid.status === 'active' ? '진행중' :
                       bid.status === 'modified' ? '변경' : '마감'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
