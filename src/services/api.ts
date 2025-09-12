// Spring 백엔드 API 서비스

import {
  UserInfo,
  UserData,
  CardIssue,
  reponseData,
  CardIssueRequest,
  BulkIssueRequest,
  ApiResponse,
  PaginationParams,
  PagedResponse,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiService {
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
  }> = []

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let token = localStorage.getItem('accessToken')

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const newToken = await this.handleTokenRefresh()
        if (newToken) {
          // 새 토큰으로 재시도
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          }
          return this.request<T>(endpoint, {
            ...options,
            headers: config.headers,
          })
        } else {
          // 리프레시 실패 시 로그아웃 처리
          this.handleLogout()
          return {
            success: false,
            message: '로그인이 만료되었습니다. 다시 로그인해주세요.',
          }
        }
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || '요청 처리 중 오류가 발생했습니다.',
        }
      }

      return {
        success: true,
        data: data,
      }
    } catch (error) {
      return {
        success: false,
        message: '네트워크 오류가 발생했습니다.',
      }
    }
  }

  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      // 이미 리프레시 중인 경우 대기
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      })
    }

    this.isRefreshing = true
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      this.isRefreshing = false
      return null
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const newAccessToken = data.accessToken
        const newRefreshToken = data.refreshToken

        // 새 토큰들 저장
        localStorage.setItem('accessToken', newAccessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        // 대기 중인 요청들에 새 토큰 제공
        this.failedQueue.forEach(({ resolve }) => resolve(newAccessToken))
        this.failedQueue = []

        this.isRefreshing = false
        return newAccessToken
      } else {
        // 리프레시 토큰도 만료된 경우
        this.failedQueue.forEach(({ reject }) =>
          reject(new Error('Token refresh failed'))
        )
        this.failedQueue = []
        this.isRefreshing = false
        return null
      }
    } catch (error) {
      console.error('토큰 리프레시 실패:', error)
      this.failedQueue.forEach(({ reject }) => reject(error))
      this.failedQueue = []
      this.isRefreshing = false
      return null
    }
  }

  private handleLogout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    // 페이지 새로고침으로 로그인 페이지로 이동
    window.location.reload()
  }

  // 토큰 유효성 검사 (선택적)
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  // 인증 관련
  async login(mgId: string, password: string): Promise<ApiResponse<any>> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mgId, password }),
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.request<void>('/auth/logout', {
      method: 'POST',
    })
    localStorage.removeItem('authToken')
    return result
  }

  // 사용자 프로필 조회
  async getProfile(token?: string): Promise<ApiResponse<any>> {
    const authToken = token || localStorage.getItem('accessToken')

    return this.request('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    })
  }

  // === 새로 추가된 개인 카드 발급 관련 메서드들 ===

  /**
   * 사번으로 사용자 검색 (TB_MEMBER + TB_PHOTO 조인)
   */
  async searchUserByEmployeeId(employeeId: string): Promise<ApiResponse<UserData>> {
    return this.request(`/api/v1/user/search/${employeeId}`)
  }

  /**
   * 카드 발급 이력 조회 (페이징)
   */
  async getCardHistory(params: {
    page?: number
    size?: number
    employeeId: string
  }): Promise<ApiResponse<PagedResponse<CardIssue>>> {
    const queryParams = new URLSearchParams({
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString(),
      employeeId: params.employeeId,
    })

    return this.request(`/api/v1/card/history?${queryParams}`)
  }

  /**
   * 개인 카드 발급
   */
  async issueCard(params: CardIssueRequest): Promise<ApiResponse<reponseData>> {
    return this.request('/api/v1/card/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: params.employeeId,
        name: params.name,
        department: params.department,
        position: params.position,
        cardCount: params.cardCount,
        cardType: params.cardType,
        photo_blob: params.photo_blob,
      }),
    })
  }

  /**
   * 카드 다운로드/출력
   */
  async downloadCard(cardId: string): Promise<ApiResponse<Blob>> {
    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`${API_BASE_URL}/api/v1/cards/${cardId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        
        // 파일 다운로드 처리
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `card-${cardId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        return {
          success: true,
          data: blob,
          message: '카드가 다운로드되었습니다.'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          message: errorData.message || '카드 다운로드에 실패했습니다.'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '네트워크 오류가 발생했습니다.'
      }
    }
  }

  // === 기존 메서드들 ===

  // 사용자 관리
  async searchUser(employeeId: string): Promise<ApiResponse<UserInfo>> {
    return this.request(`/users/search?employeeId=${employeeId}`)
  }

  async getUserById(userId: string): Promise<ApiResponse<UserInfo>> {
    return this.request(`/users/${userId}`)
  }

  async updateUser(
    userId: string,
    userData: Partial<UserInfo>
  ): Promise<ApiResponse<UserInfo>> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // 카드 관리
  async bulkIssueCards(
    request: BulkIssueRequest
  ): Promise<ApiResponse<CardIssue[]>> {
    return this.request('/cards/bulk-issue', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getCardById(cardId: string): Promise<ApiResponse<CardIssue>> {
    return this.request(`/cards/${cardId}`)
  }

  async deactivateCard(cardId: string): Promise<ApiResponse<void>> {
    return this.request(`/cards/${cardId}/deactivate`, {
      method: 'PUT',
    })
  }

  // 파일 업로드 (엑셀)
  async uploadExcelFile(file: File): Promise<ApiResponse<UserInfo[]>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request('/files/upload-excel', {
      method: 'POST',
      headers: {}, // Content-Type을 자동으로 설정하도록 빈 객체
      body: formData,
    })
  }

  // 대시보드 통계
  async getDashboardStats(): Promise<
    ApiResponse<{
      totalUsers: number
      totalCards: number
      activeCards: number
      todayIssued: number
      monthlyIssued: number
    }>
  > {
    return this.request('/dashboard/stats')
  }

  // 카드 이미지 생성
  async generateCardImage(cardData: {
    name: string
    employeeId: string
    department: string
    position: string
    photoUrl?: string
  }): Promise<ApiResponse<{ imageUrl: string }>> {
    return this.request('/cards/generate-image', {
      method: 'POST',
      body: JSON.stringify(cardData),
    })
  }
}

export const apiService = new ApiService()