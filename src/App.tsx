import { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { LoginPage } from './components/pages/LoginPage'
import { Dashboard } from './components/pages/Dashboard'
import { IndividualIssuePage } from './components/pages/IndividualIssuePage'
import { BulkIssuePage } from './components/pages/BulkIssuePage'
import { HistoryPage } from './components/pages/HistoryPage'
import { apiService } from './services/api'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true) // 초기 로딩 상태
  const [userInfo, setUserInfo] = useState(null) // 사용자 정보 저장

  // 컴포넌트 마운트 시 토큰 확인
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      console.log('토큰:', token)

      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await apiService.getProfile(token)

      console.log('응답:', response)

      if (response.success && response.data) {
        console.log('success:', response.data)
        setIsLoggedIn(true)
        setUserInfo(response.data.manager) // response.data → response.manager
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } catch (error) {
      console.error('토큰 검증 실패:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setIsLoggedIn(true)
    setUserInfo(userData)
  }

  const handleLogout = () => {
    // 토큰 제거
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    setIsLoggedIn(false)
    setUserInfo(null)
    setCurrentPage('dashboard')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />
      case 'individual':
        return <IndividualIssuePage />
      case 'bulk':
        return <BulkIssuePage />
      case 'history':
        return <HistoryPage />
      default:
        return <Dashboard onPageChange={setCurrentPage} />
    }
  }

  // 초기 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 로그인 페이지 표시
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  // 로그인 후 메인 애플리케이션
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(30,64,175,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative z-10">
        <Header onLogout={handleLogout} userInfo={userInfo} />
        <div className="flex">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            <div className="p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto animate-fade-in">
              <div className="animate-slide-up">{renderPage()}</div>
            </div>

            <footer className="mt-auto border-t border-border/50 bg-white/50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-10 py-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <p>© 2025 국립소방병원. All rights reserved.</p>
                  <div className="flex items-center gap-4">
                    <span>카드발급 시스템 v1.0</span>
                    <div
                      className="w-2 h-2 bg-success rounded-full animate-pulse"
                      title="시스템 정상"
                    />
                  </div>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
