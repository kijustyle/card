// 사용자 및 카드 관련 타입 정의

export interface UserIfno {
  MG_ID: string
  MG_NAME: string
  MG_TYPE: string
  M_NO: string
}

export interface CardIssue {
  id: string
  userId: string
  cardType: 'employee' | 'visitor' | 'temporary'
  cardNumber: string
  issuedAt: string
  issuedBy: string
  expiresAt?: string
  status: 'active' | 'inactive' | 'expired'
  qrCode?: string
  cardImageUrl?: string
}

export interface BulkIssueRequest {
  users: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[]
  cardType: 'employee' | 'visitor' | 'temporary'
  expiresAt?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  manager?: any // 추가
  tokens?: {
    // 추가
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
  }
  data?: T
  timestamp?: string
  requestId?: string
}
export interface PaginationParams {
  page: number
  size: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
}
