import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Download, Filter } from "lucide-react";
import { apiService } from '../../services/api';
import { CardIssueHistory, ApiResponse, PagedResponse } from '../../types';

// 타입 정의
interface HistoryFilters {
  dateFrom: string;
  dateTo: string;
  search: string;
  page: number;
  size: number;
}

export function HistoryPage() {
  const [history, setHistory] = useState<CardIssueHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  // 당월 1일과 오늘 날짜 계산
  const getCurrentMonthDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0부터 시작 (0=1월, 8=9월)
    
    // 당월 1일
    const firstDay = new Date(year, month, 1);
    
    // 디버깅용 로그
    console.log('현재 년도:', year);
    console.log('현재 월:', month + 1, '월'); // +1해서 실제 월 표시
    console.log('당월 1일:', firstDay);
    console.log('오늘:', today);
    
    return {
      startDate: firstDay.toLocaleDateString('sv-SE'), // YYYY-MM-DD 형식
      endDate: today.toLocaleDateString('sv-SE')       // YYYY-MM-DD 형식
    };
  };
  
  // 필터 상태
  const [filters, setFilters] = useState<HistoryFilters>(() => {
    const { startDate, endDate } = getCurrentMonthDates();
    return {
      dateFrom: startDate,
      dateTo: endDate,
      search: "",
      page: 0,
      size: 10
    };
  });

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    setIsLoading(true);
    
    try {
      const requestParams = {
        ...filters,
        page: currentPage - 1, // 0부터 시작하므로 -1
      };

      console.log('API 요청 파라미터:', requestParams);

      const response = await apiService.getCardIssueHistory(requestParams);
      
      console.log('API 응답:', response);

      if (response.success && response.data) {
        // id 필드가 없는 경우를 위한 처리
        const historyWithId = (response.data.content || []).map((item, index) => ({
          ...item,
          id: item.id || `${item.mNo}_${item.createDt}_${index}` // id가 없으면 생성
        }));
        
        setHistory(historyWithId);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
        
        console.log('처리된 데이터:', historyWithId);
      } else {
        // API 응답이 실패한 경우
        console.error('API 응답 실패:', response);
        setHistory([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      // 에러 발생 시 기본값 설정
      setHistory([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadHistory();
  };

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
      case '완료': return 'default';
      case '진행중': return 'secondary';
      case '대기': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCardTypeText = (cardType: string) => {
    return cardType === 'R' ? 'RFID' : 'PCV';
  };

  const handleExport = async () => {
    try {
      console.log('엑셀 다운로드 시작...');
      
      const blob = await apiService.exportCardIssueHistory(filters);
      
      console.log('Blob 정보:', {
        size: blob.size,
        type: blob.type
      });
      
      // Blob이 비어있는지 확인
      if (blob.size === 0) {
        throw new Error('다운로드된 파일이 비어있습니다.');
      }
      
      // 다운로드 링크 생성 및 클릭
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `카드발급이력_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('엑셀 다운로드 완료');
    } catch (error) {
      console.error('Export failed:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  // 디버깅용 로그
  console.log('렌더링 상태:', {
    history: history,
    historyLength: history?.length,
    isLoading,
    totalElements,
    totalPages,
    currentPage,
    firstItem: history?.[0]
  });

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="search">검색</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="이름, 사번"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
                <Button onClick={handleSearch}>검색</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 발급 이력 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>발급 이력 (총 {totalElements}건)</CardTitle>
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
                <TableHead>카드타입</TableHead>
                <TableHead>카드번호</TableHead>
                <TableHead>발급수량</TableHead>
                <TableHead>발급일</TableHead>
                <TableHead>발급자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!history || history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    {isLoading ? '데이터를 불러오는 중...' : '데이터가 없습니다.'}
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item, index) => (
                  <TableRow key={item.id || `row_${index}`}>
                    <TableCell>{item.mNo || item.M_NO || '정보없음'}</TableCell>
                    <TableCell>{item.mName || item.M_NAME || '정보없음'}</TableCell>
                    <TableCell>{item.mDepartment || item.M_DEPARTMENT || '정보없음'}</TableCell>
                    <TableCell>{item.mPosition || item.M_POSITION || '정보없음'}</TableCell>
                    <TableCell>
                      <Badge>
                        {getCardTypeText(item.cardType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.cardSno || item.CARD_SNO || '정보없음'}</TableCell>
                    <TableCell>{item.cardCount || item.CARD_COUNT || 0}</TableCell>
                    <TableCell>{formatDate(item.createDt || item.CREATE_DT || '')}</TableCell>
                    <TableCell>{item.createId || item.CREATE_ID || '정보없음'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                이전
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}