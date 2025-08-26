// Spring 백엔드 API 서비스

import { User, CardIssue, BulkIssueRequest, ApiResponse, PaginationParams, PagedResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || '요청 처리 중 오류가 발생했습니다.',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.',
      };
    }
  }

  // 인증 관련
  async login(employeeId: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('authToken');
    return result;
  }

  // 사용자 관리
  async searchUser(employeeId: string): Promise<ApiResponse<User>> {
    return this.request(`/users/search?employeeId=${employeeId}`);
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // 카드 발급 관련
  async issueCard(userId: string, cardType: string, expiresAt?: string): Promise<ApiResponse<CardIssue>> {
    return this.request('/cards/issue', {
      method: 'POST',
      body: JSON.stringify({ userId, cardType, expiresAt }),
    });
  }

  async bulkIssueCards(request: BulkIssueRequest): Promise<ApiResponse<CardIssue[]>> {
    return this.request('/cards/bulk-issue', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getCardHistory(params: PaginationParams & { userId?: string; status?: string }): Promise<ApiResponse<PagedResponse<CardIssue>>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
      ...(params.sort && { sort: params.sort }),
      ...(params.direction && { direction: params.direction }),
      ...(params.userId && { userId: params.userId }),
      ...(params.status && { status: params.status }),
    });

    return this.request(`/cards/history?${queryParams}`);
  }

  async getCardById(cardId: string): Promise<ApiResponse<CardIssue>> {
    return this.request(`/cards/${cardId}`);
  }

  async deactivateCard(cardId: string): Promise<ApiResponse<void>> {
    return this.request(`/cards/${cardId}/deactivate`, {
      method: 'PUT',
    });
  }

  // 파일 업로드 (엑셀)
  async uploadExcelFile(file: File): Promise<ApiResponse<User[]>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/files/upload-excel', {
      method: 'POST',
      headers: {}, // Content-Type을 자동으로 설정하도록 빈 객체
      body: formData,
    });
  }

  // 대시보드 통계
  async getDashboardStats(): Promise<ApiResponse<{
    totalUsers: number;
    totalCards: number;
    activeCards: number;
    todayIssued: number;
    monthlyIssued: number;
  }>> {
    return this.request('/dashboard/stats');
  }

  // 카드 이미지 생성
  async generateCardImage(cardData: {
    name: string;
    employeeId: string;
    department: string;
    position: string;
    photoUrl?: string;
  }): Promise<ApiResponse<{ imageUrl: string }>> {
    return this.request('/cards/generate-image', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }
}

export const apiService = new ApiService();