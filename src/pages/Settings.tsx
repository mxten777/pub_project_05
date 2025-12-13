import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Bell, 
  User, 
  Key, 
  Tag, 
  Crown, 
  Shield, 
  Mail, 
  Save,
  X,
  Plus,
  Check
} from 'lucide-react'

export default function Settings() {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState({
    newBid: true,
    deadline: true,
    modified: false,
    email: true
  })
  const [keywords, setKeywords] = useState(['스마트시티', 'AI', '소프트웨어'])
  const [newKeyword, setNewKeyword] = useState('')
  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || '',
    company: '(주)테크솔루션',
    position: '대표'
  })

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  return (
    <div className="space-y-6">
      <div className="card-premium p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient">설정</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">계정 및 시스템 환경 설정</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Plan */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">프로필</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition-all"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600"
                  value={currentUser?.email || ''}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">회사명</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition-all"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">직책</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition-all"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                />
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                <Save className="h-4 w-4" />
                저장하기
              </button>
            </div>
          </div>

          {/* Subscription Plan Card */}
          <div className="card-premium p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">구독 플랜</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">현재 플랜</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">Pro</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">월 요금</span>
                <span className="text-lg font-bold text-indigo-600">99,000원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">갱신일</span>
                <span className="text-sm text-gray-900">2025년 1월 13일</span>
              </div>
              
              <div className="pt-3 border-t border-indigo-200">
                <button className="w-full px-4 py-2.5 bg-white border-2 border-indigo-300 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                  플랜 업그레이드
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Settings */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">알림 설정</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-effect rounded-xl hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-gray-900">신규 공고 알림</p>
                  <p className="text-sm text-gray-500">새로운 입찰 공고가 등록되면 알림을 받습니다</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, newBid: !notifications.newBid })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.newBid ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.newBid ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 glass-effect rounded-xl hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-gray-900">마감임박 알림</p>
                  <p className="text-sm text-gray-500">마감 3일 전에 알림을 받습니다</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, deadline: !notifications.deadline })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.deadline ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.deadline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 glass-effect rounded-xl hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-gray-900">변경공고 알림</p>
                  <p className="text-sm text-gray-500">입찰 공고가 변경되면 알림을 받습니다</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, modified: !notifications.modified })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.modified ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.modified ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 glass-effect rounded-xl hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-gray-900">이메일 알림</p>
                  <p className="text-sm text-gray-500">이메일로도 알림을 받습니다</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.email ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Keywords Management */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">관심 키워드</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="키워드 입력 (예: AI, 스마트시티)"
                  className="flex-1 px-4 py-2.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition-all"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <button
                  onClick={addKeyword}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  추가
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 text-indigo-700 rounded-xl font-medium hover:shadow-md transition-all group"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>

              {keywords.length === 0 && (
                <p className="text-center text-gray-500 py-8">등록된 키워드가 없습니다</p>
              )}
            </div>
          </div>

          {/* API Keys (Optional) */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <Key className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">API 키 관리</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공공데이터포털 API 키
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition-all"
                  placeholder="••••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API 키 (선택사항)
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition-all"
                  placeholder="••••••••••••••••"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                <Save className="h-4 w-4" />
                API 키 저장
              </button>
            </div>
          </div>

          {/* Security Info */}
          <div className="card-premium p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">보안 안내</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• API 키는 암호화되어 안전하게 저장됩니다</li>
                  <li>• 개인정보는 외부로 유출되지 않습니다</li>
                  <li>• 모든 통신은 HTTPS로 보호됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
