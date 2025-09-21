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
  Target,
  BarChart3,
  Shield,
  RefreshCw
} from "lucide-react";
import { Badge } from "../ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { apiService } from '../../services/api';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

interface DashboardStats {
  todayIssued: number;
  monthlyIssued: number;
  activeCards: number;
  totalUsers: number;
}

interface ChartData {
  period: string;
  count: number;
}

interface RecentIssue {
  issueId: string;
  employeeId: string;
  name: string;
  department: string;
  cardType: string;
  cardTypeName: string;
  issuedAt: string;
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    todayIssued: 0,
    monthlyIssued: 0,
    activeCards: 0,
    totalUsers: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentIssues, setRecentIssues] = useState<RecentIssue[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'1month' | '6months' | '1year'>('1month');
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [statsResponse, recentResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentIssues(5)
      ]);
      
      console.log('Stats Response:', statsResponse);
      console.log('Recent Response:', recentResponse);
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        console.error('Stats API Failed:', statsResponse);
      }
      
      if (recentResponse.success && recentResponse.data) {
        console.log('Recent Issues Data Type:', typeof recentResponse.data);
        console.log('Recent Issues Data:', recentResponse.data);
        console.log('Is Array?', Array.isArray(recentResponse.data));
        
        if (Array.isArray(recentResponse.data)) {
          setRecentIssues(recentResponse.data);
        } else if (typeof recentResponse.data === 'object' && recentResponse.data !== null) {
          const dataArray = Object.values(recentResponse.data);
          console.log('Converted to array:', dataArray);
          setRecentIssues(dataArray);
        } else {
          console.error('Recent Issues data is not an array or object:', recentResponse.data);
          setRecentIssues([]);
        }
      } else {
        console.error('Recent Issues API Failed:', recentResponse);
        setRecentIssues([]);
      }
      
      await loadChartData();
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChartData = async () => {
    setIsChartLoading(true);
    
    try {
      const chartResponse = await apiService.getIssueChartData(selectedPeriod);
      
      console.log('Chart Response:', chartResponse);
      
      if (chartResponse.success && chartResponse.data) {
        if (Array.isArray(chartResponse.data)) {
          setChartData(chartResponse.data);
        } else if (typeof chartResponse.data === 'object' && chartResponse.data !== null) {
          const dataArray = Object.values(chartResponse.data);
          console.log('Chart data converted to array:', dataArray);
          setChartData(dataArray);
        } else {
          console.error('Chart data is not an array or object:', chartResponse.data);
          setChartData([]);
        }
      } else {
        console.error('Chart API Failed:', chartResponse);
        setChartData([]);
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setChartData([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toLocaleString();
  };

  const formatPeriodLabel = (period: string) => {
    try {
      if (selectedPeriod === '1month') {
        const date = new Date(period);
        if (isNaN(date.getTime())) {
          return period;
        }
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}`;
      } else {
        if (period.includes('-') && period.length === 7) {
          const [year, month] = period.split('-');
          return `${month}월`;
        }
        return period;
      }
    } catch (error) {
      console.error('날짜 포맷 오류:', error, period);
      return period;
    }
  }

  const getPeriodButtonText = (period: string) => {
    switch (period) {
      case '1month': return '1개월';
      case '6months': return '6개월';
      case '1year': return '1년';
      default: return period;
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const issueDate = new Date(dateString);
    const diffMs = now.getTime() - issueDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return '방금 전';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      
      return (
        <div className="bg-white/90 backdrop-blur-xl border-0 rounded-2xl p-4 shadow-2xl ring-1 ring-white/20">
          <div className="text-sm font-medium text-gray-900 mb-2">{label}</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <span className="text-sm text-gray-600">발급 건수</span>
            </div>
            <div className="text-lg font-bold bg-gray-900 text-white">
              {formatNumber(data.value)}건
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="url(#dotGradient)"
          className="drop-shadow-lg"
        />
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="white"
          className="opacity-90"
        />
      </g>
    );
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              대시보드
            </h2>
            <p className="text-lg text-muted-foreground">
              국립소방병원 카드발급 시스템 현황을 실시간으로 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              시스템 정상
            </Badge>
            <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 via-white to-primary/10 animate-slide-up">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">오늘 발급</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? '...' : formatNumber(stats?.todayIssued)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <CreditCard className="w-3 h-3 text-blue-500" />
                  <span className="text-blue-500 font-medium">건</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-500" />
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
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? '...' : formatNumber(stats?.monthlyIssued)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 font-medium">건</span>
                </div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-warning/5 via-white to-warning/10 animate-slide-up [animation-delay:300ms]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">활성 카드</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? '...' : formatNumber(stats?.activeCards)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <Shield className="w-3 h-3 text-yellow-500" />
                  <span className="text-yellow-500 font-medium">개</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Shield className="w-6 h-6 text-yellow-500" />
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
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? '...' : formatNumber(stats?.totalUsers)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3 text-orange-500" />
                  <span className="text-orange-500 font-medium">명</span>
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section - 리퀴드 글래스 디자인 */}
        <Card className="lg:col-span-2 border-0 shadow-2xl border shadow-sm bg-white overflow-hidden animate-slide-up [animation-delay:400ms]">
          {/* 배경 그라데이션 효과 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full translate-y-24 -translate-x-24 pointer-events-none" />
          
          <CardHeader className="pb-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-bold">
                    발급 현황 분석
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600/80">
                  실시간 카드 발급 추이와 트렌드를 확인하세요
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {(['1month', '6months', '1year'] as const).map((period) => (
                  <Button
                    key={period}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    disabled={isChartLoading}
                    style={{
                      backgroundColor: selectedPeriod === period ? '#fd4c4cff' : 'white',
                      color: selectedPeriod === period ? 'white' : '#374151',
                      border: selectedPeriod === period ? 'none' : '1px solid #d1d5db',
                      fontWeight: '500'
                    }}
                    className="transition-all duration-200"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fd4c4cff';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.border = 'none';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPeriod !== period) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#374151';
                        e.currentTarget.style.border = '1px solid #d1d5db';
                      }
                    }}
                  >
                    <span>{getPeriodButtonText(period)}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="h-80 relative">
              {isChartLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="relative">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <div className="absolute inset-0 w-8 h-8 animate-ping bg-blue-500/20 rounded-full" />
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-600">데이터를 불러오는 중입니다...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f0c2c2ff" stopOpacity={0.2} />
                        <stop offset="50%" stopColor="#f15353ff" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#eb0e0eff" stopOpacity={0.1} />
                      </linearGradient>
                      
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#4c55dbff" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                      
                      <linearGradient id="dotGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                      
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#374151"
                      strokeOpacity={0.1}
                      vertical={false}
                    />
                    
                    <XAxis 
                      dataKey="period" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickMargin={15}
                      tickFormatter={formatPeriodLabel}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickMargin={15}
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#f58181ff"
                      strokeWidth={3}
                      fill="url(#chartGradient)"
                      fillOpacity={0.6}
                      filter="url(#glow)"
                      animationBegin={0}
                      animationDuration={2000}
                    />
                    
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#e75959ff"
                      strokeWidth={4}
                      dot={<CustomDot />}
                      activeDot={{ 
                        r: 8, 
                        fill: 'url(#dotGradient)',
                        stroke: 'white',
                        strokeWidth: 3,
                        filter: 'url(#glow)'
                      }}
                      animationBegin={500}
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* 통계 정보 */}
            {/* {!isChartLoading && Array.isArray(chartData) && chartData.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-xl ring-1 ring-white/20">
                  <div className="text-sm text-gray-600 mb-1">총 발급</div>
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatNumber(chartData.reduce((sum, item) => sum + (item.count || 0), 0))}건
                  </div>
                </div>
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-xl ring-1 ring-white/20">
                  <div className="text-sm text-gray-600 mb-1">평균</div>
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatNumber(Math.round(chartData.reduce((sum, item) => sum + (item.count || 0), 0) / chartData.length))}건
                  </div>
                </div>
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-xl ring-1 ring-white/20">
                  <div className="text-sm text-gray-600 mb-1">최고</div>
                  <div className="text-lg font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                    {formatNumber(Math.max(...chartData.map(item => item.count || 0)))}건
                  </div>
                </div>
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        {/* <Card className="border-0 shadow-lg animate-slide-up [animation-delay:500ms]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              최근 발급 현황
            </CardTitle>
            <CardDescription>실시간 카드 발급 활동 현황</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-100 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full" />
                      <div className="space-y-2">
                        <div className="w-16 h-3 bg-gray-300 rounded" />
                        <div className="w-20 h-2 bg-gray-300 rounded" />
                      </div>
                    </div>
                    <div className="w-12 h-2 bg-gray-300 rounded" />
                  </div>
                ))}
              </div>
            ) : !Array.isArray(recentIssues) || recentIssues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>최근 발급 내역이 없습니다</p>
                {!Array.isArray(recentIssues) && (
                  <p className="text-xs text-red-500 mt-2">
                    데이터 형식 오류: {typeof recentIssues}
                  </p>
                )}
              </div>
            ) : (
              recentIssues.map((issue) => (
                <div 
                  key={issue.issueId} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 transition-all hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{issue.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {issue.department}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {issue.cardTypeName}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(issue.issuedAt)}
                  </span>
                </div>
              ))
            )}
            <Button 
              variant="outline" 
              className="w-full mt-6 group"
              onClick={() => onPageChange('history')}
            >
              전체 이력 보기
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </CardContent>
        </Card> */}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg animate-slide-up [animation-delay:600ms]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Target className="w-5 h-5 text-orange-500" />
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