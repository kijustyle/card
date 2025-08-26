// Spring 백엔드 연동 전까지 사용할 Mock 데이터

import { User, CardIssue } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'NFMC2024001',
    name: '김소방',
    department: '응급의학과',
    position: '전문의',
    phoneNumber: '010-1234-5678',
    email: 'kim.fire@nfmc.go.kr',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    employeeId: 'NFMC2024002',
    name: '이구급',
    department: '간호부',
    position: '수간호사',
    phoneNumber: '010-2345-6789',
    email: 'lee.rescue@nfmc.go.kr',
    photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612c68d?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
  {
    id: '3',
    employeeId: 'NFMC2024003',
    name: '박의료',
    department: '방사선과',
    position: '방사선사',
    phoneNumber: '010-3456-7890',
    email: 'park.medical@nfmc.go.kr',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z',
  },
];

export const mockCardIssues: CardIssue[] = [
  {
    id: 'card-001',
    userId: '1',
    cardType: 'employee',
    cardNumber: 'NFMC-EMP-001',
    issuedAt: '2024-01-15T09:30:00Z',
    issuedBy: 'admin',
    status: 'active',
    qrCode: 'QR-NFMC-EMP-001',
  },
  {
    id: 'card-002',
    userId: '2',
    cardType: 'employee',
    cardNumber: 'NFMC-EMP-002',
    issuedAt: '2024-01-16T11:00:00Z',
    issuedBy: 'admin',
    status: 'active',
    qrCode: 'QR-NFMC-EMP-002',
  },
  {
    id: 'card-003',
    userId: '3',
    cardType: 'temporary',
    cardNumber: 'NFMC-TMP-001',
    issuedAt: '2024-01-17T15:00:00Z',
    issuedBy: 'admin',
    expiresAt: '2024-02-17T15:00:00Z',
    status: 'active',
    qrCode: 'QR-NFMC-TMP-001',
  },
];

export const mockDashboardStats = {
  totalUsers: 1247,
  totalCards: 1389,
  activeCards: 1247,
  todayIssued: 15,
  monthlyIssued: 342,
};

// Mock API 함수들 (개발 중 사용)
export const mockApiDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const findMockUser = (employeeId: string): User | undefined => 
  mockUsers.find(user => user.employeeId === employeeId);

export const findMockUserById = (userId: string): User | undefined => 
  mockUsers.find(user => user.id === userId);

export const getMockCardHistory = (userId?: string) => {
  let cards = mockCardIssues;
  if (userId) {
    cards = cards.filter(card => card.userId === userId);
  }
  return cards.map(card => ({
    ...card,
    user: findMockUserById(card.userId),
  }));
};