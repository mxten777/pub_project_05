import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, 
  Radar, 
  BarChart3, 
  Target, 
  FileText, 
  Settings,
  Menu,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '입찰 레이더', href: '/radar', icon: Radar },
  { name: '분석 대시보드', href: '/analytics', icon: BarChart3 },
  { name: '투찰가 예측', href: '/prediction', icon: Target },
  { name: '문서 자동화', href: '/documents', icon: FileText },
  { name: '설정', href: '/settings', icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-sm transition-all duration-300" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 w-80 glass-effect shadow-2xl transform transition-all duration-300 ease-out">
            <div className="flex h-20 items-center justify-between px-6 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <img src="/images/baikal_logo.png" alt="Baikal Logo" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-lg font-bold text-gradient">Smart Bid</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <nav className="px-4 py-6 overflow-y-auto h-[calc(100vh-5rem)]">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 mb-2 ${
                      isActive
                        ? 'gradient-primary text-white shadow-lg shadow-indigo-500/50 scale-[1.02]'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    data-testid={`nav-${item.href === '/' ? 'dashboard' : item.href.slice(1)}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 glass-effect border-r border-indigo-100">
          <div className="flex h-20 items-center px-6 border-b border-indigo-100">
            <div className="flex items-center gap-3">
              <img src="/images/baikal_logo.png" alt="Baikal Logo" className="h-12 w-12 rounded-full object-cover shadow-lg" />
              <div>
                <div className="text-lg font-bold text-gradient">Smart Bid</div>
                <div className="text-xs text-gray-500">Intelligence Platform</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 mb-2 group ${
                    isActive
                      ? 'gradient-primary text-white shadow-lg shadow-indigo-500/50 scale-[1.02]'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-[1.01]'
                  }`}
                  data-testid={`nav-${item.href === '/' ? 'dashboard' : item.href.slice(1)}`}
                >
                  <item.icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-indigo-100 space-y-3">
            {/* User Profile */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser?.displayName || '사용자'}
                </p>
                <p className="text-xs text-indigo-700">Pro 플랜</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full lg:pl-72">
        <div className="sticky top-0 z-40 flex h-20 items-center gap-x-4 border-b border-indigo-100 glass-effect px-6 shadow-sm">
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-indigo-600 focus:outline-none transition-colors rounded-xl hover:bg-indigo-50"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">메뉴 열기</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 lg:hidden flex items-center gap-2">
            <img src="/images/baikal_logo.png" alt="Baikal Logo" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-lg font-bold text-gradient">Smart Bid</span>
          </div>
          <div className="hidden lg:flex flex-1" />
          <div className="flex items-center gap-x-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-indigo-900">시스템 정상 운영중</span>
            </div>
            
            {/* User Menu - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-xl border border-indigo-100">
                <UserIcon className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">{currentUser?.displayName || '사용자'}</span>
              </div>
            </div>
          </div>
        </div>
        <main className="py-8">
          <div className="px-6 lg:px-10 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
