// 사용자 및 카드 관련 타입 정의

export interface User {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  phoneNumber: string;
  email: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardIssue {
  id: string;
  userId: string;
  cardType: 'employee' | 'visitor' | 'temporary';
  cardNumber: string;
  issuedAt: string;
  issuedBy: string;
  expiresAt?: string;
  status: 'active' | 'inactive' | 'expired';
  qrCode?: string;
  cardImageUrl?: string;
}

export interface BulkIssueRequest {
  users: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[];
  cardType: 'employee' | 'visitor' | 'temporary';
  expiresAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}