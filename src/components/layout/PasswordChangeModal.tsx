import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Alert,
  AlertDescription,
} from '../ui/alert'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PasswordChangeData) => Promise<void>
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ValidationErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function PasswordChangeModal({ isOpen, onClose, onSubmit }: PasswordChangeModalProps) {
  const [formData, setFormData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: keyof PasswordChangeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 해당 필드 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // 성공/에러 메시지 초기화
    setSubmitError('')
    setSubmitSuccess(false)
  }

  // 비밀번호 표시/숨기기 토글
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // 실시간 유효성 검사
  const validatePassword = (password: string): string[] => {
    const issues: string[] = []
    
    if (password.length < 4) {
      issues.push('최소 4자 이상')
    }
    if (password.length > 50) {
      issues.push('최대 50자 이하')
    }
    // 추가 검증 규칙이 있다면 여기에 추가
    
    return issues
  }

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // 현재 비밀번호 검증
    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.'
    }

    // 새 비밀번호 검증
    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.'
    } else {
      const passwordIssues = validatePassword(formData.newPassword)
      if (passwordIssues.length > 0) {
        newErrors.newPassword = passwordIssues.join(', ')
      } else if (formData.newPassword === formData.currentPassword) {
        newErrors.newPassword = '현재 비밀번호와 다른 비밀번호를 입력해주세요.'
      }
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호와 일치하지 않습니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSubmitError('')
    setSubmitSuccess(false)

    try {
      await onSubmit(formData)
      setSubmitSuccess(true)
      
      // 2초 후 모달 닫기
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 모달 닫기 핸들러
  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    })
    setErrors({})
    setSubmitError('')
    setSubmitSuccess(false)
    setIsLoading(false)
    onClose()
  }

  // 비밀번호 강도 표시
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '' }
    
    let strength = 0
    if (password.length >= 4) strength += 1
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    const strengthTexts = ['매우 약함', '약함', '보통', '강함', '매우 강함']
    const strengthColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500']
    
    return {
      strength,
      text: strengthTexts[strength] || '',
      color: strengthColors[strength] || 'text-gray-500'
    }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleClose} 
      style={{
        fontFamily: '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        '--dialog-width': '420px', // CSS 변수로 설정
        width: '420px',
        maxWidth: '95vw', // 모바일 대응
        minWidth: '320px' // 최소 넓이 보장
      }}
    >
      <DialogContent 
        className="p-0" 
        style={{
          width: '420px',
          maxWidth: '95vw',
          fontFamily: 'inherit'
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <span style={{ fontFamily: 'inherit', fontSize: '18px', fontWeight: '500' }}>
              비밀번호 변경
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground" style={{ fontFamily: 'inherit' }}>
            보안을 위해 현재 비밀번호를 확인한 후 새 비밀번호로 변경합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4" style={{ fontFamily: 'inherit' }}>
          {/* 현재 비밀번호 */}
          <div className="space-y-2">
            <Label 
              htmlFor="currentPassword" 
              className="text-sm font-medium"
              style={{ fontFamily: 'inherit', display: 'block' }}
            >
              현재 비밀번호
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="현재 비밀번호"
                className={`pr-10 h-10 ${errors.currentPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                style={{ fontFamily: 'inherit' }}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'inherit' }}>
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* 새 비밀번호 */}
          <div className="space-y-2">
            <Label 
              htmlFor="newPassword" 
              className="text-sm font-medium"
              style={{ fontFamily: 'inherit', display: 'block' }}
            >
              새 비밀번호
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="새 비밀번호"
                className={`pr-10 h-10 ${errors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                style={{ fontFamily: 'inherit' }}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            
            {/* 비밀번호 강도 표시 */}
            {formData.newPassword && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground" style={{ fontFamily: 'inherit' }}>
                  강도:
                </span>
                <span 
                  className={`text-xs font-medium ${passwordStrength.color}`}
                  style={{ fontFamily: 'inherit' }}
                >
                  {passwordStrength.text}
                </span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${passwordStrength.color.replace('text-', 'bg-')}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'inherit' }}>
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label 
              htmlFor="confirmPassword" 
              className="text-sm font-medium"
              style={{ fontFamily: 'inherit', display: 'block' }}
            >
              새 비밀번호 확인
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="새 비밀번호 확인"
                className={`pr-10 h-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                style={{ fontFamily: 'inherit' }}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            
            {/* 비밀번호 일치 확인 표시 */}
            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span style={{ fontFamily: 'inherit' }}>비밀번호가 일치합니다</span>
              </div>
            )}
            
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'inherit' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* 에러/성공 메시지 */}
          {submitError && (
            <Alert variant="destructive" className="py-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm" style={{ fontFamily: 'inherit' }}>
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert className="border-green-500 text-green-700 bg-green-50 py-3">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-sm" style={{ fontFamily: 'inherit' }}>
                비밀번호가 성공적으로 변경되었습니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-10"
              style={{ fontFamily: 'inherit' }}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || submitSuccess}
              className="flex-1 h-10"
              style={{ fontFamily: 'inherit' }}
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  변경 중...
                </>
              ) : (
                '변경하기'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}