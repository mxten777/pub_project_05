import { create } from 'zustand'
import { Bid, FilterOptions } from '@/types'

interface BidStore {
  bids: Bid[]
  filteredBids: Bid[]
  favorites: string[]
  filters: FilterOptions
  setBids: (bids: Bid[]) => void
  setFilters: (filters: FilterOptions) => void
  toggleFavorite: (bidId: string) => void
  applyFilters: () => void
}

export const useBidStore = create<BidStore>((set, get) => ({
  bids: [],
  filteredBids: [],
  favorites: [],
  filters: {},
  
  setBids: (bids) => {
    set({ bids, filteredBids: bids })
    get().applyFilters()
  },
  
  setFilters: (filters) => {
    set({ filters })
    get().applyFilters()
  },
  
  toggleFavorite: (bidId) => {
    set((state) => ({
      favorites: state.favorites.includes(bidId)
        ? state.favorites.filter(id => id !== bidId)
        : [...state.favorites, bidId]
    }))
  },
  
  applyFilters: () => {
    const { bids, filters } = get()
    let filtered = [...bids]
    
    if (filters.category) {
      filtered = filtered.filter(bid => bid.category.includes(filters.category!))
    }
    
    if (filters.region) {
      filtered = filtered.filter(bid => bid.region.includes(filters.region!))
    }
    
    if (filters.budgetMin) {
      filtered = filtered.filter(bid => bid.budget >= filters.budgetMin!)
    }
    
    if (filters.budgetMax) {
      filtered = filtered.filter(bid => bid.budget <= filters.budgetMax!)
    }
    
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(bid => 
        bid.title.toLowerCase().includes(keyword) ||
        bid.agency.toLowerCase().includes(keyword)
      )
    }
    
    if (filters.status) {
      filtered = filtered.filter(bid => bid.status === filters.status)
    }
    
    set({ filteredBids: filtered })
  }
}))
