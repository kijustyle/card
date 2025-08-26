import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Upload, Search, Download, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { apiService } from "../../services/api";
import { mockApiDelay, mockUsers } from "../../utils/mockData";
import { User, BulkIssueRequest } from "../../types";

export function BulkIssuePage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [uploadedData, setUploadedData] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBulkIssuing, setIsBulkIssuing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      // 개발 중에는 Mock 데이터 사용
      await mockApiDelay(1000);
      
      // Mock 검색 결과
      const filtered = mockUsers.filter(user => 
        user.name.includes(searchTerm) ||
        user.employeeId.includes(searchTerm) ||
        user.department.includes(searchTerm)
      );
      
      setSearchResults(filtered);

      // 실제 API 호출 (Spring 백엔드 연동 시 사용)
      /*
      const response = await apiService.searchUser(searchTerm);
      if (response.success && response.data) {
        setSearchResults([response.data]);
      }
      */
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // 개발 중에는 Mock 데이터 사용
      await mockApiDelay(2000);
      setUploadedData(mockUsers);

      // 실제 API 호출 (Spring 백엔드 연동 시 사용)
      /*
      const response = await apiService.uploadExcelFile(file);
      if (response.success && response.data) {
        setUploadedData(response.data);
      } else {
        alert(response.error || '파일 업로드에 실패했습니다.');
      }
      */
    } catch (error) {
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkIssue = async () => {
    if (selectedUsers.length === 0) {
      alert('발급할 사용자를 선택해주세요.');
      return;
    }
    
    setIsBulkIssuing(true);
    
    try {
      // 개발 중에는 Mock 처리
      await mockApiDelay(3000);
      
      alert(`${selectedUsers.length}명의 카드가 성공적으로 발급되었습니다!`);
      setSelectedUsers([]);

      // 실제 API 호출 (Spring 백엔드 연동 시 사용)
      /*
      const selectedUserData = [...searchResults, ...uploadedData].filter(user => 
        selectedUsers.includes(user.id)
      );
      
      const bulkRequest: BulkIssueRequest = {
        users: selectedUserData.map(user => ({
          employeeId: user.employeeId,
          name: user.name,
          department: user.department,
          position: user.position,
          phoneNumber: user.phoneNumber,
          email: user.email,
          photoUrl: user.photoUrl,
          isActive: user.isActive
        })),
        cardType: 'employee'
      };
      
      const response = await apiService.bulkIssueCards(bulkRequest);
      if (response.success) {
        alert(`${response.data?.length}명의 카드가 성공적으로 발급되었습니다!`);
        setSelectedUsers([]);
      } else {
        alert(response.error || '대량 발급에 실패했습니다.');
      }
      */
    } catch (error) {
      alert('대량 발급 중 오류가 발생했습니다.');
    } finally {
      setIsBulkIssuing(false);
    }
  };

  const UserTable = ({ users, source }: { users: User[], source: string }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={users.length > 0 && users.every(user => selectedUsers.includes(user.id))}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedUsers([...selectedUsers, ...users.map(u => u.id).filter(id => !selectedUsers.includes(id))]);
                } else {
                  setSelectedUsers(selectedUsers.filter(id => !users.map(u => u.id).includes(id)));
                }
              }}
            />
          </TableHead>
          <TableHead>사번</TableHead>
          <TableHead>이름</TableHead>
          <TableHead>부서</TableHead>
          <TableHead>직급</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
              />
            </TableCell>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.department}</TableCell>
            <TableCell>{user.position}</TableCell>
            <TableCell>
              <Badge variant="outline">발급대기</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">대량 카드 발급</h2>
        <p className="text-muted-foreground">여러 직원의 카드를 한번에 발급합니다.</p>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            직원 검색
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            엑셀 업로드
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                직원 검색
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="search-term">검색어</Label>
                  <Input
                    id="search-term"
                    placeholder="이름, 부서, 사번으로 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch}>검색</Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {searchResults.length}명의 직원이 검색되었습니다.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      선택된 직원: {selectedUsers.length}명
                    </p>
                  </div>
                  <UserTable users={searchResults} source="search" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                엑셀 파일 업로드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="excel-file">엑셀 파일 선택</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    사번, 이름, 부서, 직급 정보가 포함된 엑셀 파일을 업로드하세요.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    템플릿 다운로드
                  </Button>
                </div>

                {uploadedData.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {uploadedData.length}명의 직원 정보가 업로드되었습니다.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        선택된 직원: {selectedUsers.length}명
                      </p>
                    </div>
                    <UserTable users={uploadedData} source="upload" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{selectedUsers.length}명 선택됨</span>
              </div>
              <Button onClick={handleBulkIssue}>
                선택된 직원 카드 일괄 발급
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}