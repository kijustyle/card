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
  CardIssueHistory
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

    const isFormData = options.body instanceof FormData

    const config: RequestInit = {
      headers: {
        // FormData가 아닐 때만 Content-Type 설정
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,

      body: isFormData 
      ? options.body 
      : (options.body ? JSON.stringify(options.body) : undefined)
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
        },
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        
        // 응답 구조 확인 (서버 응답 형식에 맞춤)
        const tokenData = data.data || data
        
        // 새 액세스 토큰 저장
        if (tokenData.accessToken) {
          localStorage.setItem('accessToken', tokenData.accessToken)
        }
        
        // 새 리프레시 토큰이 있으면 저장 (Rotating Refresh Token)
        if (tokenData.refreshToken) {
          localStorage.setItem('refreshToken', tokenData.refreshToken)
        }

        // 대기 중인 요청들에 새 토큰 제공
        this.failedQueue.forEach(({ resolve }) => resolve(tokenData.accessToken))
        this.failedQueue = []

        this.isRefreshing = false
        return tokenData.accessToken
      } else {
        // 리프레시 실패 - 로그아웃 처리
        this.failedQueue.forEach(({ reject }) =>
          reject(new Error('Token refresh failed'))
        )
        this.failedQueue = []
        this.isRefreshing = false
        
        // 사용자가 삭제되었거나 비활성화된 경우
        const errorData = await response.json()
        console.error('리프레시 토큰 갱신 실패:', errorData.message)
        
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
      method: 'GET'
    })
  }

  /**
   * 사번으로 사용자 검색 (TB_MEMBER + TB_PHOTO 조인)
   */
  async searchUserByEmployeeId(employeeId: string): Promise<ApiResponse<UserData>> {
    return this.request(`/api/v1/user/search/${employeeId}`)
  }

  /**
   * 검색어로 사용자 검색 (TB_MEMBER + TB_PHOTO 조인)
   */
  async searchEmployee(searchTerm: string): Promise<ApiResponse<UserData>> {
    return this.request(`/api/v1/user/find/${searchTerm}`)
  }

  /**
   * 저장된 대량 발급 대상자 리스트 조회
   */
  async getSavedBatchList(): Promise<ApiResponse<UserData[]>> {
    return this.request('/api/v1/batch/list')
  }

  /**
   * 일괄 발급 대상자 저장
   */
  async saveBatchEmployees(params) {
    return this.request('/api/v1/batch/save', {
      method: 'POST',
      body: params,
    })
  }

  /**
   * 저장된 대량 발급 대상자의 카드 타입 변경
   */
  async updateCardType(params: {
    employeeId: string;
    cardType: string; // 'R' 또는 'P'
  }): Promise<ApiResponse<any>> {
    return this.request('/api/v1/batch/update-card-type', {
      method: 'PUT',
      body: params,
    })
  }


  /**
   * 대량 발급 대상자 삭제
  */
  async removeBulkIssueEmployee(employeeId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/batch/delete/${employeeId}`, {
      method: 'DELETE',
    })
  }

  /**
   * 엑셀 파일 업로드 및 사번 검증
   */
  async uploadBatchExcel(file: File): Promise<ApiResponse<any>> {
  
    const formData = new FormData()
    formData.append('file', file)

    return this.request('/api/v1/batch/upload-excel', {
      method: 'POST',
      body: formData
    })
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

  async getCardIssueHistory(params: {
    page?: number;
    size?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<ApiResponse<PagedResponse<CardIssueHistory>>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());
    
    if (params.dateFrom) {
      queryParams.append('dateFrom', params.dateFrom);
    }
    if (params.dateTo) {
      queryParams.append('dateTo', params.dateTo);
    }
    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim());
    }

    return this.request(`/api/v1/card/issue-history?${queryParams}`);
  }

  /**
   * 카드 발급 이력 엑셀 다운로드
   */
  async exportCardIssueHistory(params: {
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (params.dateFrom) {
      queryParams.append('dateFrom', params.dateFrom);
    }
    if (params.dateTo) {
      queryParams.append('dateTo', params.dateTo);
    }
    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim());
    }
    
    let token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/card/issue-history/export?${queryParams}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.blob();
  }

  /**
   * 개인 카드 발급
   */
  async issueCard(params: CardIssueRequest): Promise<ApiResponse<reponseData>> {
    return this.request(`/api/v1/card/issue`, {
      method: 'POST',
      body: params
    })
  }

  // 대량 발급을 위한 개별 전송 *batch
  async issueBatchCard(params: CardIssueRequest): Promise<ApiResponse<reponseData>> {
    return this.request(`/api/v1/card/issueBatchCard`, {
      method: 'POST',
      body: params
    })
  }
    
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

  // 대시보드 관련 메서드들 추가
  async getDashboardStats(): Promise<ApiResponse<{
    todayIssued: number;
    monthlyIssued: number;
    activeCards: number;
    totalUsers: number;
  }>> {
    return this.request('/api/v1/dashboard/stats')
  }

  /**
   * 기간별 발급 차트 데이터 조회
   */
  async getIssueChartData(period: '1month' | '6months' | '1year' = '1month'): Promise<ApiResponse<Array<{
    period: string;
    count: number;
  }>>> {
    return this.request(`/api/v1/dashboard/chart?period=${period}`)
  }

  /**
   * 최근 발급 현황 조회
   */
  async getRecentIssues(limit: number = 5): Promise<ApiResponse<Array<{
    issueId: string;
    employeeId: string;
    name: string;
    department: string;
    cardType: string;
    cardTypeName: string;
    issuedAt: string;
  }>>> {
    return this.request(`/api/v1/dashboard/recent-issues?limit=${limit}`)
  }

  
}

export const apiService = new ApiService()