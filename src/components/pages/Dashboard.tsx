import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { 
  Users, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  Activity,
  AlertTriangle,
  Target,
  Zap
} from "lucide-react";
import { Badge } from "../ui/badge";
import { apiService } from '../../services/api';
import { mockApiDelay, mockDashboardStats, getMockCardHistory } from '../../utils/mockData';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const [stats, setStats] = useState(mockDashboardStats);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // 개발 중에는 Mock 데이터 사용
      await mockApiDelay(1000);
      
      setStats(mockDashboardStats);
      const recentHistory = getMockCardHistory().slice(0, 5); // 최근 5개만
      setRecentIssues(recentHistory);

      // 실제 API 호출 (Spring 백엔드 연동 시 사용)
      /*
      const [statsResponse, historyResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getCardHistory({ page: 0, size: 5, sort: 'issuedAt', direction: 'desc' })
      ]);
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      if (historyResponse.success && historyResponse.data) {
        setRecentIssues(historyResponse.data.content);
      }
      */
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모의 데이터
  const recentActivity = [
    { 
      id: 1, 
      name: "김소방", 
      action: "카드 발급 완료", 
      time: "10분 전",
      type: "success",
      department: "응급의학과"
    },
    { 
      id: 2, 
      name: "이구급", 
      action: "카드 발급 요청", 
      time: "30분 전",
      type: "pending",
      department: "간호부"
    },
    { 
      id: 3, 
      name: "박의료", 
      action: "카드 재발급 완료", 
      time: "1시간 전",
      type: "success",
      department: "방사선과"
    },
    { 
      id: 4, 
      name: "최응급", 
      action: "카드 발급 대기", 
      time: "2시간 전",
      type: "waiting",
      department: "중환자의학과"
    },
  ];

  const pendingRequests = [
    { 
      id: 1, 
      name: "정민호", 
      department: "응급의학과", 
      requestDate: "2024-01-20", 
      type: "신규발급",
      priority: "high"
    },
    { 
      id: 2, 
      name: "한지민", 
      department: "중환자의학과", 
      requestDate: "2024-01-20", 
      type: "재발급",
      priority: "normal"
    },
    { 
      id: 3, 
      name: "송윤아", 
      department: "화상외과", 
      requestDate: "2024-01-19", 
      type: "분실재발급",
      priority: "urgent"
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'waiting': return <AlertTriangle className="w-4 h-4 text-info" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'normal': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              대시보드
            </h1>
            <p className="text-lg text-muted-foreground">
              국립소방병원 카드발급 시스템 현황을 실시간으로 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              시스템 정상
            </Badge>
            <Button variant="outline" onClick={() => loadDashboardData()}>
              <TrendingUp className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 via-white to-primary/10 animate-slide-up">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">오늘 발급</p>
                <p className="text-3xl font-bold text-foreground">12</p>
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUpRight className="w-3 h-3 text-success" />
                  <span className="text-success font-medium">+20%</span>
                  <span className="text-muted-foreground">전일대비</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-secondary/5 via-white to-secondary/10 animate-slide-up [animation-delay:100ms]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">이번 달 발급</p>
                <p className="text-3xl font-bold text-foreground">287</p>
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUpRight className="w-3 h-3 text-success" />
                  <span className="text-success font-medium">+15%</span>
                  <span className="text-muted-foreground">전월대비</span>
                </div>
              </div>
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-warning/5 via-white to-warning/10 animate-slide-up [animation-delay:200ms]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">처리 대기</p>
                <p className="text-3xl font-bold text-foreground">5</p>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3 text-warning" />
                  <span className="text-warning font-medium">긴급</span>
                  <span className="text-muted-foreground">처리 필요</span>
                </div>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-success/5 via-white to-success/10 animate-slide-up [animation-delay:300ms]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-success/10 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">등록 직원</p>
                <p className="text-3xl font-bold text-foreground">1,234</p>
                <div className="flex items-center gap-1 text-xs">
                  <Target className="w-3 h-3 text-success" />
                  <span className="text-success font-medium">활성</span>
                  <span className="text-muted-foreground">계정</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <Users className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Recent Activity */}
        <Card className="border-0 shadow-lg animate-slide-up [animation-delay:400ms]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              최근 활동
            </CardTitle>
            <CardDescription>실시간 카드 발급 활동 현황</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50 transition-all hover:bg-accent/50"
              >
                <div className="flex items-center gap-4">
                  {getActivityIcon(activity.type)}
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{activity.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.department}
                      </Badge>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{activity.time}</span>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-6 group"
              onClick={() => onPageChange('history')}
            >
              모든 활동 보기
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Pending Requests */}
        <Card className="border-0 shadow-lg animate-slide-up [animation-delay:500ms]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              처리 대기 요청
            </CardTitle>
            <CardDescription>긴급 처리가 필요한 카드 발급 요청</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div 
                key={request.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50 transition-all hover:bg-accent/50"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{request.name}</p>
                    <Badge 
                      variant={request.priority === 'urgent' ? 'destructive' : 'outline'} 
                      className="text-xs"
                    >
                      {request.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{request.department}</span>
                    <span>•</span>
                    <span className={getPriorityColor(request.priority)}>
                      {request.priority === 'urgent' ? '긴급' : 
                       request.priority === 'high' ? '높음' : '보통'}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{request.requestDate}</span>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-6 group"
              onClick={() => onPageChange('history')}
            >
              모든 요청 보기
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg animate-slide-up [animation-delay:600ms]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Target className="w-5 h-5 text-secondary" />
            </div>
            빠른 실행
          </CardTitle>
          <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-6 group border-2 hover:border-primary/50 transition-all"
              onClick={() => onPageChange('individual')}
            >
              <div className="space-y-2 text-center">
                <CreditCard className="w-8 h-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium">개인 카드 발급</p>
                  <p className="text-xs text-muted-foreground">즉시 발급</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-6 group border-2 hover:border-secondary/50 transition-all"
              onClick={() => onPageChange('bulk')}
            >
              <div className="space-y-2 text-center">
                <Users className="w-8 h-8 mx-auto text-secondary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium">대량 카드 발급</p>
                  <p className="text-xs text-muted-foreground">일괄 처리</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-6 group border-2 hover:border-success/50 transition-all"
              onClick={() => onPageChange('history')}
            >
              <div className="space-y-2 text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-success group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium">발급 이력</p>
                  <p className="text-xs text-muted-foreground">통계 및 관리</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}