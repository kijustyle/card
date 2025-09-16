// 인증 상태 관리 훅

import { useState, useEffect, createContext, useContext } from 'react';
import { UserInfo } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 토큰 확인
    const token = localStorage.getItem('authToken');
    if (token) {
      // 토큰이 있으면 사용자 정보 조회 (실제로는 토큰 검증 API 호출)
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (employeeId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(employeeId, password);

      console.log(response.data);
      
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      
        // 사용자 정보도 저장 (필요시)
        localStorage.setItem('userInfo', JSON.stringify(response.data.manager));
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 모든 저장된 정보 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      setUser(null);
      setIsLoading(false);
    }
  };


  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};