import { useState } from 'react'
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
  Lock,
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
import { UserInfo } from '../../types'
import { PasswordChangeModal } from './PasswordChangeModal'
import { apiService } from '../../services/api'

interface HeaderProps {
  onLogout: () => void
  userInfo?: UserInfo
  onPasswordChange?: (data: PasswordChangeData) => Promise<void>
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function Header({ onLogout, userInfo, onPasswordChange }: HeaderProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async (data: PasswordChangeData) => {
    
    try {
      if (onPasswordChange) {
        await onPasswordChange(data)
      } else {
        // 기본 비밀번호 변경 로직 (API 호출)
        const response = await apiService.changePassword(data)

        console.log(response);

        if (!response.success) {
          throw new Error(response.message || '비밀번호 변경에 실패했습니다.')
        }
      }

    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      throw error
    }
  }

  // 기본 비밀번호 변경 API 호출
  const defaultPasswordChange = async (data: PasswordChangeData) => {
    try {
        
      const response = await fetch('/api/v1/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || '비밀번호 변경에 실패했습니다.')
      }

      console.log('비밀번호 변경 성공:', result)
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      throw error
    }
  }

  return (
    <>
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
                    {/* <p className="text-sm font-medium text-foreground">
                      {userInfo?.MG_NAME}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userInfo?.M_NO}
                    </p> */}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                {/* <DropdownMenuLabel className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userInfo?.MG_NAME || '관리자'}</p>
                    <p className="text-xs text-muted-foreground">{userInfo?.MG_TYPE || ''}</p>
                  </div> 
                </DropdownMenuLabel>
                <DropdownMenuSeparator />*/}
                
                {/* 비밀번호 변경 메뉴 아이템 */}
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  비밀번호 변경
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
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

      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />
    </>
  )
}