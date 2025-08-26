import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, UserPlus, Download, Calendar, Clock } from 'lucide-react';
import { CardTemplate } from '../card/CardTemplate';
import { apiService } from '../../services/api';
import { mockApiDelay, findMockUser, getMockCardHistory } from '../../utils/mockData';
import { User, CardIssue } from '../../types';

export function IndividualIssuePage() {
  const [searchId, setSearchId] = useState('');
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<CardIssue[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      // 개발 중에는 Mock 데이터 사용  
      await mockApiDelay(800);
      const user = findMockUser(searchId);
      
      if (user) {
        setSearchedUser(user);
        // 사용자 카드 발급 이력 조회
        const history = getMockCardHistory(user.id);
        setUserHistory(history);
      } else {
        setSearchError('해당 사번의 사용자를 찾을 수 없습니다.');
        setSearchedUser(null);
        setUserHistory([]);
      }

      // 실제 API 호출 (Spring 백엔드 연동 시 사용)
      /*
      const response = await apiService.searchUser(searchId);
      if (response.success && response.data) {
        setSearchedUser(response.data);
        // 사용자 카드 발급 이력 조회
        const historyResponse = await apiService.getCardHistory({ 
          page: 0, 
          size: 10, 
          userId: response.data.id 
        });
        if (historyResponse.success && historyResponse.data) {
          setUserHistory(historyResponse.data.content);
        }
      } else {
        setSearchError(response.error || '사용자를 찾을 수 없습니다.');
        setSearchedUser(null);
        setUserHistory([]);
      }
      */
    } catch (error) {
      setSearchError('검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleIssueCard = async () => {
    if (!searchedUser) return;
    
    setIsIssuing(true);
    
    try {
      // 개발 중에는 Mock 처리
      await mockApiDelay(1500);
      
      // Mock 카드 발급
      const newCard: CardIssue = {
        id: `card-${Date.now()}`,
        userId: searchedUser.id,
        cardType: 'employee',
        cardNumber: `NFMC-EMP-${Date.now().toString().slice(-3)}`,
        issuedAt: new Date().toISOString(),
        issuedBy: 'admin',
        status: 'active',
        qrCode: `QR-${Date.now()}`,
      };
      
      setUserHistory([newCard, ...userHistory]);
      alert('카드가 성공적으로 발급되었습니다!');

      // 실제 API 호출 (Spring 백엔드 연동 시 사용)
      /*
      const response = await apiService.issueCard(searchedUser.id, 'employee');
      if (response.success && response.data) {
        setUserHistory([response.data, ...userHistory]);
        alert('카드가 성공적으로 발급되었습니다!');
      } else {
        alert(response.error || '카드 발급에 실패했습니다.');
      }
      */
    } catch (error) {
      alert('카드 발급 중 오류가 발생했습니다.');
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">개인 카드 발급</h2>
        <p className="text-muted-foreground">사번으로 직원을 조회하여 카드를 발급합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            직원 조회
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="employee-id">사번</Label>
              <Input
                id="employee-id"
                placeholder="사번을 입력하세요"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "조회 중..." : "조회"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searchedUser && (
        <Card>
          <CardHeader>
            <CardTitle>직원 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label>이름</Label>
                    <p className="mt-1">{searchedUser.name}</p>
                  </div>
                  <div>
                    <Label>직급</Label>
                    <p className="mt-1">{searchedUser.position}</p>
                  </div>
                  <div>
                    <Label>부서</Label>
                    <p className="mt-1">{searchedUser.department}</p>
                  </div>
                  <div>
                    <Label>사번</Label>
                    <p className="mt-1">{searchedUser.employeeId}</p>
                  </div>
                  <div>
                    <Label>전화번호</Label>
                    <p className="mt-1">{searchedUser.phone}</p>
                  </div>
                  <div>
                    <Label>이메일</Label>
                    <p className="mt-1">{searchedUser.email}</p>
                  </div>
                </div>
                
                <Button onClick={handleIssueCard} className="w-full">
                  카드 즉시 발급
                </Button>
              </div>
              
              <div className="flex justify-center">
                <CardTemplate
                  name={searchedUser.name}
                  position={searchedUser.position}
                  department={searchedUser.department}
                  employeeId={searchedUser.employeeId}
                  photo={searchedUser.photo}
                  issueDate={new Date().toLocaleDateString('ko-KR')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchedUser && (
        <Card>
          <CardHeader>
            <CardTitle>발급 이력</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>발급일</TableHead>
                  <TableHead>발급유형</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.issuedAt}</TableCell>
                    <TableCell>{item.cardType}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        다운로드
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}