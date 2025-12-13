import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useBidStore } from '@/store/bidStore'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, Calendar, MapPin, DollarSign, ArrowUpDown, X } from 'lucide-react'

const CATEGORIES = ['건설', '용역', '물품', '소프트웨어', '기타']
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

const getMockBids = () => [
  {
    id: '1',
    title: '2024년 스마트시티 통합플랫폼 구축사업',
    agency: '서울특별시청',
    category: '소프트웨어',
    region: '서울',
    budget: 500000000,
    deadline: '2024-12-31T23:59:59',
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
    deadline: '2024-12-25T18:00:00',
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
    deadline: '2024-12-28T17:00:00',
    createdAt: new Date().toISOString(),
    status: 'modified'
  },
  {
    id: '4',
    title: 'AI 기반 교통관제 시스템 구축',
    agency: '부산광역시청',
    category: '소프트웨어',
    region: '부산',
    budget: 800000000,
    deadline: '2025-01-10T18:00:00',
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '5',
    title: '친환경 에너지 설비 구축',
    agency: '대전광역시청',
    category: '건설',
    region: '대전',
    budget: 2000000000,
    deadline: '2025-01-15T17:00:00',
    createdAt: new Date().toISOString(),
    status: 'active'
  }
]

export default function BidRadar() {
  const { filteredBids, setBids, setFilters, filters, favorites, toggleFavorite } = useBidStore()
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'deadline' | 'budget' | 'latest'>('latest')
  const [budgetRange, setBudgetRange] = useState({ min: '', max: '' })

  useEffect(() => {
    setBids(getMockBids() as any)
    // Firebase 데이터는 백그라운드에서 로드
    if (db) {
      loadBids()
    }
  }, [])

  const loadBids = async () => {
    if (!db) return
    
    try {
      const bidsQuery = query(
        collection(db, 'bids'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(bidsQuery)
      const bidsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      if (bidsData.length > 0) {
        setBids(bidsData as any)
      }
    } catch (error) {
      console.error('Error loading bids:', error)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleBudgetRangeChange = () => {
    const min = budgetRange.min ? parseInt(budgetRange.min) * 10000000 : undefined
    const max = budgetRange.max ? parseInt(budgetRange.max) * 10000000 : undefined
    setFilters({ ...filters, budgetMin: min, budgetMax: max })
  }

  const clearFilters = () => {
    setFilters({})
    setBudgetRange({ min: '', max: '' })
    setSortBy('latest')
  }

  const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'))
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    )
  }

  // 정렬 로직
  const sortedBids = [...filteredBids].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      case 'budget':
        return b.budget - a.budget
      case 'latest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const formatBudget = (budget: number) => {
    if (budget >= 100000000) {
      return `${(budget / 100000000).toFixed(1)}억원`
    } else if (budget >= 10000000) {
      return `${(budget / 10000000).toFixed(0)}천만원`
    } else {
      return `${(budget / 10000).toFixed(0)}만원`
    }
  }

  const getDaysLeft = (deadline: string) => {
    const now = new Date()
    const end = new Date(deadline)
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="space-y-6">
      <div className="card-premium p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient">입찰 레이더</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">실시간 입찰 공고 모니터링</p>
          </div>
          <div className="flex items-center gap-2">
            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-red-400 hover:text-red-600 transition-all duration-300"
              >
                <X className="h-4 w-4" />
                초기화
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/50 text-sm sm:text-base font-semibold"
            >
              <Filter className="h-4 w-4" />
              필터
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card-premium p-4 sm:p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
          <input
            type="text"
            placeholder="공고명, 기관명 검색..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base bg-gradient-to-r from-white to-indigo-50/30 transition-all"
            value={filters.keyword || ''}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">업종</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">전체</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">전체</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value as any)}
              >
                <option value="">전체</option>
                <option value="active">진행중</option>
                <option value="modified">변경</option>
                <option value="closed">마감</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">예산 범위 (천만원 단위)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="최소"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={budgetRange.min}
                  onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
                />
                <span className="text-gray-500">～</span>
                <input
                  type="number"
                  placeholder="최대"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={budgetRange.max}
                  onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
                />
                <button
                  onClick={handleBudgetRangeChange}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bid List */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            총 <span className="font-semibold text-indigo-600 text-lg">{sortedBids.length}</span>건
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <select
              className="px-3 py-2 border-2 border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white hover:border-indigo-300 transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="latest">최신순</option>
              <option value="deadline">마감일순</option>
              <option value="budget">예산순</option>
            </select>
          </div>
        </div>
        
        {sortedBids.length === 0 ? (
          <div className="card-premium p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-sm sm:text-base">조건에 맞는 입찰 공고가 없습니다.</p>
          </div>
        ) : (
          sortedBids.map((bid) => {
            const daysLeft = getDaysLeft(bid.deadline)
            const isFavorite = favorites.includes(bid.id)
            
            return (
              <div key={bid.id} className="card-premium hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <Link to={`/bid/${bid.id}`} className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-sm sm:text-base line-clamp-2">
                            {highlightText(bid.title, filters.keyword || '')}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-indigo-500" />
                              <span className="truncate">{highlightText(bid.agency, filters.keyword || '')}</span>
                            </span>
                            <span className="flex-shrink-0">{bid.region}</span>
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                              {formatBudget(bid.budget)}
                            </span>
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              {daysLeft > 0 ? `D-${daysLeft}` : '마감'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleFavorite(bid.id)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                          isFavorite ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
                        }`}
                      >
                        <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        bid.status === 'active' ? 'bg-green-100 text-green-700' :
                        bid.status === 'modified' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {bid.status === 'active' ? '진행중' :
                         bid.status === 'modified' ? '변경' : '마감'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
