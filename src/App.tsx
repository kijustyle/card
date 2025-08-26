import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { LoginPage } from './components/pages/LoginPage'
import { Dashboard } from './components/pages/Dashboard'
import { IndividualIssuePage } from './components/pages/IndividualIssuePage'
import { BulkIssuePage } from './components/pages/BulkIssuePage'
import { HistoryPage } from './components/pages/HistoryPage'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
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

  // 로그인하지 않은 경우 로그인 페이지 표시
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  // 로그인 후 메인 애플리케이션 - Enhanced Professional Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      {/* Professional backdrop with subtle patterns */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(30,64,175,0.1),transparent_50%)] pointer-events-none" />

      {/* Main application structure */}
      <div className="relative z-10">
        <Header onLogout={handleLogout} />
        <div className="flex">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            {/* Enhanced content area with professional spacing and transitions */}
            <div className="p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto animate-fade-in">
              <div className="animate-slide-up">{renderPage()}</div>
            </div>

            {/* Professional footer */}
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
