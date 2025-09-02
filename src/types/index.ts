// 사용자 및 카드 관련 타입 정의

export interface UserInfo {
  MG_ID: string
  MG_NAME: string
  MG_TYPE: string
  M_NO: string
}

export interface UserData {
  m_no: string
  m_name: string
  m_department_name: string
  m_position: string
  m_group: string
  m_status: string
  card_count: string
  photo_blob: Blob
}

export interface reponseData {
  success: boolean
  message: string
}

export interface CardIssue {
  employeeId: string
  department: string
  position: string
  cardCount: number
  cardType: string
  issuedAt: string
  issuedBy: string
}

export interface CardIssueRequest {
  employeeId: string        // 사번
  name: string             // 이름
  department: string       // 부서
  position: string         // 직급
  cardCount: number        // 발급차수
  cardType: string         // 카드종류 ('P': PVC카드, 'R': RFID카드)
  photo_blob?: string      // 사진 데이터
}

export interface BulkIssueRequest {
  users: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>[]
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
