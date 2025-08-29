import * as React from 'react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { AlertCircle, Shield, Eye, EyeOff, Lock, User } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'
import { apiService } from '../../services/api'
import { mockApiDelay, findMockUser } from '../../utils/mockData'
import hospitalLogo from '../../assets/logo_md.png'

interface LoginPageProps {
  onLogin: (user: any) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    // 1. 폼 기본 동작(새로고침) 방지
    e.preventDefault()

    // 2. 에러 메시지 초기화, 로딩 상태 true로 변경
    setError('')
    setIsLoading(true)

    try {
      // Mock 데이터 부분 주석 처리
      // await mockApiDelay(1000)
      // const user = findMockUser(employeeId)
      // if (user && password === 'admin123') {
      //   onLogin(user)
      // } else {
      //   setError('사번 또는 비밀번호가 올바르지 않습니다.')
      // }

      // 실제 백엔드 API 연동
      const response = await apiService.login(employeeId, password)
      const data = response.data

      if (response.success && response.data.tokens) {
        if (response.data.tokens.accessToken) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken)
          localStorage.setItem(
            'refreshToken',
            response.data.tokens.refreshToken
          )
        }

        // 관리자 정보 전달
        onLogin(response.manager) // response.data.manager 아님
      } else {
        setError(response.message || '로그인에 실패했습니다.')
      }
    } catch (error) {
      // 네트워크 또는 기타 에러 처리
      setError('로그인 중 오류가 발생했습니다.')
      console.error('로그인 에러:', error)
    } finally {
      // 로딩 상태 false로 변경
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Professional Background */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />

        {/* Geometric patterns */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-warning/5 to-transparent rounded-full blur-2xl animate-pulse [animation-delay:4s]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Enhanced Header Section */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                  <img
                    src={hospitalLogo}
                    alt="국립소방병원 로고"
                    className="h-16 w-auto"
                  />
                  {/* Status indicator */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Login Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl animate-slide-up [animation-delay:200ms]">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="flex items-center gap-2 justify-center">
                <Lock className="w-5 h-5 text-primary" />
                관리자 로그인
              </CardTitle>
              <CardDescription>
                시스템 관리자 계정으로 로그인하세요
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Employee ID Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="employeeId"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    사번
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="사번을 입력하세요"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-12 bg-input-background border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    비밀번호
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-input-background border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive" className="animate-scale-in">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      로그인 중...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      로그인
                    </div>
                  )}
                </Button>

                {/* Development Credentials */}
                <Alert className="animate-scale-in [animation-delay:400ms]">
                  <Shield className="size-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">로그인 계정 정보</p>
                      <div className="text-xs">
                        <div>
                          <code className="ml-1 bg-muted px-1 py-0.5 rounded">
                            등록된 사용자만 이용 가능합니다.
                          </code>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </form>
            </CardContent>
          </Card>

          {/* Enhanced Footer */}
          <div className="text-center mt-8 space-y-4 animate-slide-up [animation-delay:600ms]">
            <p className="text-xs text-muted-foreground">
              © 2025 국립소방병원 카드발급 시스템. All rights reserved.
            </p>

            {/* Additional Info */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>버전 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
