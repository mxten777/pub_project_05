import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useBidStore } from '@/store/bidStore'
import { Bid } from '@/types'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  FileText,
  Star,
  Share2,
  Printer,
  Download,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Tag,
  User,
  Phone,
  Mail,
  TrendingUp
} from 'lucide-react'

// Mock 데이터
const getMockBid = (id: string): Bid => ({
  id,
  title: '2024년 스마트시티 통합플랫폼 구축사업',
  agency: '서울특별시청',
  category: '소프트웨어',
  region: '서울',
  budget: 500000000,
  deadline: '2024-12-31T23:59:59',
  createdAt: new Date().toISOString(),
  status: 'active'
})

const mockDetail = {
  bidNumber: '20241213-00123',
  demandOrg: '서울특별시 디지털정책관',
  contactPerson: '김담당',
  contactPhone: '02-1234-5678',
  contactEmail: 'contact@seoul.go.kr',
  announcementDate: '2024-12-01',
  deadline: '2024-12-31 18:00',
  bidMethod: '일반경쟁입찰',
  requirements: [
    '소프트웨어 개발 실적 3건 이상',
    '기술인력 5명 이상 보유',
    '사업자등록증 보유',
    '법인등기부등본 제출'
  ],
  description: `본 사업은 서울시 스마트시티 통합플랫폼을 구축하여 시민들에게 보다 편리하고 효율적인 행정서비스를 제공하기 위한 프로젝트입니다.

주요 구축 내용:
1. 통합 데이터 플랫폼 구축
2. 실시간 모니터링 시스템
3. AI 기반 분석 대시보드
4. 모바일 앱 개발
5. 시민 참여 포털

기대 효과:
- 행정 효율성 30% 향상
- 시민 만족도 제고
- 데이터 기반 정책 의사결정`,
  attachments: [
    { name: '입찰공고문.pdf', size: '2.5MB', url: '#' },
    { name: '과업지시서.hwp', size: '1.8MB', url: '#' },
    { name: '제안요청서.pdf', size: '3.2MB', url: '#' },
    { name: '계약조건.pdf', size: '850KB', url: '#' }
  ]
}

const mockHistory = [
  { year: '2023', biddersCount: 5, winnerRate: 87.5, avgRate: 88.2 },
  { year: '2022', biddersCount: 4, winnerRate: 86.8, avgRate: 87.5 },
  { year: '2021', biddersCount: 6, winnerRate: 88.3, avgRate: 89.1 }
]

const mockRelatedBids = [
  {
    id: '2',
    title: '공공데이터 개방 시스템 고도화',
    agency: '경기도청',
    budget: 300000000,
    deadline: '2024-12-25'
  },
  {
    id: '4',
    title: 'AI 기반 교통관제 시스템 구축',
    agency: '부산광역시청',
    budget: 800000000,
    deadline: '2025-01-10'
  }
]

export default function BidDetail() {
  const { bidId } = useParams<{ bidId: string }>()
  const navigate = useNavigate()
  const { favorites, toggleFavorite } = useBidStore()
  const [bid, setBid] = useState<Bid | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'attachments' | 'history'>('overview')

  useEffect(() => {
    if (bidId) {
      loadBidDetail()
    }
  }, [bidId])

  const loadBidDetail = async () => {
    setLoading(true)
    
    // Mock 데이터 즉시 로드
    if (bidId) {
      setBid(getMockBid(bidId))
    }
    
    // Firebase 데이터는 백그라운드에서 로드
    if (db && bidId) {
      try {
        const docRef = doc(db, 'bids', bidId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setBid({ id: docSnap.id, ...docSnap.data() } as Bid)
        }
      } catch (error) {
        console.error('Error loading bid:', error)
      }
    }
    
    setLoading(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bid?.title,
        text: `${bid?.agency} - ${bid?.title}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

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

  const isFavorite = bid ? favorites.includes(bid.id) : false

  if (loading || !bid) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">로딩중...</p>
        </div>
      </div>
    )
  }

  const daysLeft = getDaysLeft(bid.deadline)

  const tabs = [
    { id: 'overview', label: '개요', icon: FileText },
    { id: 'requirements', label: '참가 조건', icon: CheckCircle },
    { id: 'attachments', label: '첨부파일', icon: Download },
    { id: 'history', label: '유사 이력', icon: TrendingUp }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">목록으로</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(bid.id)}
            className={`p-2.5 rounded-xl border-2 transition-all duration-300 ${
              isFavorite
                ? 'border-yellow-400 bg-yellow-50 text-yellow-600 hover:scale-110'
                : 'border-gray-200 bg-white hover:border-yellow-400 hover:bg-yellow-50'
            }`}
          >
            <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
          >
            <Printer className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="card-premium overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/20">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-gray-500">공고번호</span>
                <span className="text-sm font-mono text-gray-700">{mockDetail.bidNumber}</span>
              </div>
              <h1 className="text-3xl font-bold text-gradient mb-4">{bid.title}</h1>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                  bid.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                  bid.status === 'modified' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {bid.status === 'active' ? '진행중' :
                   bid.status === 'modified' ? '변경공고' : '마감'}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                  {bid.category}
                </span>
                {daysLeft <= 7 && daysLeft > 0 && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm animate-pulse">
                    🔥 D-{daysLeft}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-effect p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-500/10">
                  <Building className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">발주기관</p>
                  <p className="text-sm font-bold text-gray-900">{bid.agency}</p>
                </div>
              </div>
            </div>

            <div className="glass-effect p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">추정가격</p>
                  <p className="text-sm font-bold text-gray-900">{formatBudget(bid.budget)}</p>
                </div>
              </div>
            </div>

            <div className="glass-effect p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-pink-500/10">
                  <Clock className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">마감일</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(bid.deadline).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex gap-1 px-8 pt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-lg -mb-px border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">담당자</p>
                      <p className="text-base text-gray-900">{mockDetail.contactPerson}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">연락처</p>
                      <p className="text-base text-gray-900">{mockDetail.contactPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">이메일</p>
                      <p className="text-base text-gray-900">{mockDetail.contactEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">공고일</p>
                      <p className="text-base text-gray-900">{mockDetail.announcementDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">입찰방식</p>
                      <p className="text-base text-gray-900">{mockDetail.bidMethod}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">지역</p>
                      <p className="text-base text-gray-900">{bid.region}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  사업 개요
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {mockDetail.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                참가 자격 요건
              </h3>
              <div className="space-y-3">
                {mockDetail.requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 glass-effect rounded-xl hover:shadow-md transition-all duration-300">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-gray-900 font-medium">{req}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 mb-2">주의사항</h4>
                    <ul className="space-y-2 text-sm text-amber-800">
                      <li>• 모든 증빙서류는 입찰 마감일 전까지 제출해야 합니다</li>
                      <li>• 허위 서류 제출 시 입찰 참가가 제한될 수 있습니다</li>
                      <li>• 자격 요건 미달 시 개찰 후에도 낙찰이 취소될 수 있습니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-indigo-600" />
                첨부파일
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockDetail.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    className="flex items-center gap-4 p-5 glass-effect rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">{file.size}</p>
                    </div>
                    <Download className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </a>
                ))}
              </div>

              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">나라장터 바로가기</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      상세한 공고 내용과 추가 자료는 나라장터 사이트에서 확인하실 수 있습니다.
                    </p>
                    <a
                      href="https://www.g2b.go.kr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      <ExternalLink className="h-4 w-4" />
                      나라장터 이동
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                유사 사업 낙찰 이력
              </h3>
              
              <div className="space-y-4">
                {mockHistory.map((item, index) => (
                  <div key={index} className="glass-effect p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{item.year}년</h4>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        참여 {item.biddersCount}개사
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">낙찰률</p>
                        <p className="text-2xl font-bold text-gradient">{item.winnerRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">평균 투찰률</p>
                        <p className="text-2xl font-bold text-gray-900">{item.avgRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  낙찰 예측 인사이트
                </h4>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li>• 최근 3년간 평균 낙찰률: <strong>87.5%</strong></li>
                  <li>• 평균 참여 업체 수: <strong>5개사</strong></li>
                  <li>• 낙찰률 추세: <strong>안정적</strong></li>
                  <li>• 권장 투찰 범위: <strong>86.5% ~ 88.5%</strong></li>
                </ul>
                <button
                  onClick={() => navigate(`/prediction?bidId=${bid.id}`)}
                  className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  AI 예측으로 정밀 분석하기 →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-8 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/prediction?bidId=${bid.id}`)}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <TrendingUp className="h-5 w-5" />
              투찰가 예측하기
            </button>
            <button
              onClick={() => navigate(`/documents?bidId=${bid.id}`)}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <FileText className="h-5 w-5" />
              제안서 자동 생성
            </button>
          </div>
        </div>
      </div>

      {/* Related Bids */}
      {mockRelatedBids.length > 0 && (
        <div className="card-premium p-8">
          <h2 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-2">
            <Tag className="h-6 w-6" />
            관련 입찰 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockRelatedBids.map((relatedBid) => (
              <Link
                key={relatedBid.id}
                to={`/bid/${relatedBid.id}`}
                className="glass-effect p-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <h3 className="font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {relatedBid.title}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="h-4 w-4" />
                    {relatedBid.agency}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    {formatBudget(relatedBid.budget)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(relatedBid.deadline).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
