import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  LogOut,
  Settings,
  Bell,
  User,
  Shield,
  Activity,
  ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import hospitalLogo from '../../assets/logo_md.png'

interface HeaderProps {
  onLogout: () => void
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        {/* Enhanced Logo and Title Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={hospitalLogo}
                alt="국립소방병원"
                className="h-8 w-auto"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white shadow-sm animate-pulse" />
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Actions */}
        <div className="flex items-center gap-2">
          {/* Enhanced User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-accent/50 transition-colors px-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">관리자</p>
                  <p className="text-xs text-muted-foreground">{}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-scale-in">
              <DropdownMenuLabel className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">관리자</p>
                  <p className="text-xs text-muted-foreground">
                    admin@nfmc.go.kr
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />내 프로필
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                계정 설정
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Bell className="w-4 h-4 mr-2" />
                알림 설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
