export interface Bid {
  id: string
  title: string
  agency: string
  category: string
  region: string
  budget: number
  deadline: string
  createdAt: string
  updatedAt?: string
  status: 'active' | 'closed' | 'modified'
  description?: string
  bidMethod?: string
  estimatedPrice?: number
  announcementDate?: string
}

export interface BidHistory {
  id: string
  bidId: string
  biddersCount: number
  rates: number[]
  winnerRate: number
  winnerCompany?: string
  completedAt: string
}

export interface Prediction {
  id: string
  bidId: string
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
  createdAt: string
}

export interface Insight {
  id: string
  type: 'agency' | 'category' | 'region'
  name: string
  totalBids: number
  averageBudget: number
  averageWinRate: number
  averageCompetition: number
  period: string
  trend: number // 증감률
}

export interface FilterOptions {
  category?: string
  region?: string
  budgetMin?: number
  budgetMax?: number
  keyword?: string
  status?: Bid['status']
}
