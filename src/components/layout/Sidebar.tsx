import { cn } from '../ui/utils'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  LayoutDashboard,
  CreditCard,
  Users,
  History,
  Settings,
  HelpCircle,
  FileText,
  TrendingUp,
  Activity,
} from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const navigationItems = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: LayoutDashboard,
    description: '시스템 현황 및 통계',
    badge: null,
  },
  {
    id: 'individual',
    label: '즉시 발급',
    icon: CreditCard,
    description: '직원증 즉시발급',
    badge: null,
  },
  {
    id: 'bulk',
    label: '일괄 발급',
    icon: Users,
    description: '직원증 일괄발급',
    badge: 'New',
  },
  {
    id: 'history',
    label: '발급 이력',
    icon: History,
    description: '직원증 발급 이력 조회',
    badge: null,
  },
]

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-72 min-h-[calc(100vh-4rem)] border-r border-border/50 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40">
      {/* Enhanced sidebar content */}
      <div className="flex flex-col h-full">
        {/* Navigation Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">직원증 발급 메뉴</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            직원증 발급을 위한 통합 관리 시스템
          </p>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              주요 메뉴
            </p>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-auto p-3 transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90'
                      : 'hover:bg-accent/50 hover:translate-x-1'
                  )}
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    )}
                  />
                  <div className="flex-1 text-left">
                    <div
                      className={cn(
                        'font-medium text-sm',
                        isActive ? 'text-primary-foreground' : 'text-foreground'
                      )}
                    >
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        'text-xs leading-tight mt-0.5',
                        isActive
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground'
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={isActive ? 'secondary' : 'outline'}
                      className="text-xs shrink-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </nav>
      </div>
    </aside>
  )
}
