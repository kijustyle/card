import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Download, Search, Filter, Calendar } from "lucide-react";
import { apiService } from '../../services/api';
import { mockApiDelay, getMockCardHistory, mockUsers } from '../../utils/mockData';
import { CardIssue, User } from '../../types';

export function HistoryPage() {
  const [history, setHistory] = useState<(CardIssue & { user?: User })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [currentPage, statusFilter]);

  const loadHistory = async () => {
    setIsLoading(true);
    
    try {
      // 개발 중에는 Mock 데이터 사용
      await mockApiDelay(1000);
      
      let mockHistory = getMockCardHistory();
      
      // Mock 사용자 정보 추가
      mockHistory = mockHistory.map(card => ({
        ...card,
        user: mockUsers.find(user => user.id === card.userId)
      }));
      
      // 상태 필터 적용
      if (statusFilter !== 'all') {
        mockHistory = mockHistory.filter(card => card.status === statusFilter);
      }
      
      setHistory(mockHistory);
      setTotalPages(1); // Mock에서는 1페이지만

      // 실제 API 호출 (Spring 백엔드 연동 시 사용)
      /*
      const response = await apiService.getCardHistory({
        page: currentPage - 1,
        size: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      if (response.success && response.data) {
        setHistory(response.data.content);
        setTotalPages(response.data.totalPages);
      }
      */
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.user?.name.toLowerCase().includes(searchLower) ||
      item.user?.employeeId.toLowerCase().includes(searchLower) ||
      item.cardNumber.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'expired': return '만료';
      default: return status;
    }
  };

  const getCardTypeText = (cardType: string) => {
    switch (cardType) {
      case 'employee': return '직원증';
      case 'visitor': return '방문증';
      case 'temporary': return '임시증';
      default: return cardType;
    }
  };

  const handleExport = () => {
    alert("발급 이력이 엑셀 파일로 다운로드됩니다.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">발급 이력 관리</h2>
        <p className="text-muted-foreground">전체 카드 발급 이력을 조회하고 관리합니다.</p>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            검색 필터
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="date-from">시작일</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="date-to">종료일</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
            <div>
              <Label>상태</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="완료">완료</SelectItem>
                  <SelectItem value="진행중">진행중</SelectItem>
                  <SelectItem value="대기">대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>부서</Label>
              <Select value={filters.department} onValueChange={(value) => setFilters({...filters, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="개발팀">개발팀</SelectItem>
                  <SelectItem value="마케팅팀">마케팅팀</SelectItem>
                  <SelectItem value="인사팀">인사팀</SelectItem>
                  <SelectItem value="재무팀">재무팀</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">검색</Label>
              <Input
                id="search"
                placeholder="이름, 사번"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setFilters({
              dateFrom: "",
              dateTo: "",
              status: "all",
              department: "all",
              search: ""
            })}>초기화</Button>
            <Button>검색</Button>
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 발급</p>
                <p className="text-2xl font-semibold">4</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">완료</p>
                <p className="text-2xl font-semibold text-green-600">2</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">진행중</p>
                <p className="text-2xl font-semibold text-blue-600">1</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">대기</p>
                <p className="text-2xl font-semibold text-orange-600">1</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-orange-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 발급 이력 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>발급 이력</CardTitle>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              엑셀 다운로드
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사번</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>직급</TableHead>
                <TableHead>발급유형</TableHead>
                <TableHead>발급일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>발급자</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.employeeId}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.position}</TableCell>
                  <TableCell>{item.issueType}</TableCell>
                  <TableCell>{item.issueDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.issuedBy}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        상세
                      </Button>
                      {item.status === '완료' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}