import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Upload, Search, Download, Users, X, Plus } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from "../ui/select";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { apiService } from '../../services/api'
import BulkIssueProgress from '../BulkIssue/BulkIssueProgress';

export function BulkIssuePage() {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [uploadedData, setUploadedData] = useState([]);
  const [savedEmployees, setSavedEmployees] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBulkIssuing, setIsBulkIssuing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchPopup, setShowSearchPopup] = useState(false); // 검색 결과 팝업
  const [popupSearchResults, setPopupSearchResults] = useState([]); // 팝업용 검색 결과
  const [isLoadingSaved, setIsLoadingSaved] = useState(true); // 로딩 상태
  const [isSavingEmployees, setIsSavingEmployees] = useState(false); // 새로운 state 추가

   const fetchSavedEmployees = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await apiService.getSavedBatchList();

      console.log(response.data);
      
      if (response.success && response.data) {
        setSavedEmployees(response.data.list);
      }

      console.log('savedEmployees', savedEmployees)
    } catch (error) {
      console.error('Failed to fetch saved employees:', error);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchSavedEmployees();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSelectedUsers([]); // 검색 시 선택 초기화
    
    
    try {
     
      const response = await apiService.searchEmployee(searchTerm)
      const result = response.data;
      
      console.log(response);
      console.log(response.data);
      
      if (response.success && response.data) {
        setPopupSearchResults(response.data.data);
        setShowSearchPopup(true);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const downloadExcelTemplate = () => {
    // 템플릿 데이터
    const templateData = [
      { '사원번호': ''},
    ];

    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(templateData);

    // 열 너비 설정
    ws['!cols'] = [
      { wch: 30 }, // 사번
    ];

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '발급대상자');

    // 엑셀 파일 생성 및 다운로드
    const excelBuffer = XLSX.write(wb, { 
      bookType: 'xlsx', 
      type: 'array' 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(blob, '대량발급_템플릿.xlsx');
  };

  const handleSaveSelectedEmployees = async () => {
    const selectedFromPopup = popupSearchResults.filter(user => 
      selectedUsers.includes(user.m_no)
    );
    
    // 기존 저장된 직원들과 중복 제거하여 추가
    const newEmployees = selectedFromPopup.filter(user => 
      !savedEmployees.some(saved => saved.m_no === user.m_no)
    );
    
    // 새로 추가할 직원이 없으면 early return
    if (newEmployees.length === 0) {
      alert('추가할 직원이 없습니다.');
      return;
    }
    
    console.log(newEmployees);
    // 로딩 시작
    setIsSavingEmployees(true);
    
    try {
      // 1. 서버에 선택된 직원들 저장
      const saveResponse = await apiService.saveBatchEmployees({
        employees: newEmployees.map(emp => ({
          m_no: emp.m_no,
          saved_card_type: emp.saved_card_type || 'R'
        }))
      });
      
      if (!saveResponse.success) {
        alert('직원 저장에 실패했습니다.');
        return;
      }
      
      // 2. 저장 후 서버에서 최신 목록 다시 가져오기
      const listResponse = await apiService.getSavedBatchList();
      
      if (listResponse.success && listResponse.data) {
        setSavedEmployees(listResponse.data.list);
      }
      
      // 3. 상태 초기화 및 팝업 닫기
      setSelectedUsers([]); // 선택 초기화
      setShowSearchPopup(false);
      setSearchTerm('');
      
      alert(`${newEmployees.length}명의 직원이 저장되었습니다.`);
      
    } catch (error) {
      console.error('Failed to save employees:', error);
      alert('직원 저장 중 오류가 발생했습니다.');
    } finally {
      // 로딩 종료
      setIsSavingEmployees(false);
    }
  };

  // 저장된 직원 삭제
  const handleRemoveSavedEmployee = async (employeeId) => {
    try {
      const response = await apiService.removeBulkIssueEmployee(employeeId);
      
      if (response.success) {
        setSavedEmployees(savedEmployees.filter(emp => emp.m_no !== employeeId));
        setSelectedUsers(selectedUsers.filter(id => id !== employeeId));
      } else {
        alert('직원 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to remove employee:', error);
      alert('직원 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // 파일 직접 전달 (FormData는 서비스에서 처리)
      const response = await apiService.uploadBatchExcel(file);
      
      if (response.success && response.data) {
        setUploadedData(response.data.validEmployees || []);
        
        // 결과 메시지
        const { totalCount, savedCount, skippedCount, savedEmployees, skippedEmployees } = response.data;
        
        let message = `전체 ${totalCount}명 중 ${savedCount}명 저장 완료`;
        if (skippedCount > 0) {
          message += `\n제외된 인원 : ${skippedCount}`;
          if (skippedEmployees && skippedEmployees.length > 0) {
            message += `\n제외된 사번: ${skippedEmployees.join(', ')}`;
          }
        }
        
        await fetchSavedEmployees();
        
        alert(message);

      } else {
        alert(response.message || '파일 업로드에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 상태 변수들 추가
  const [showProgress, setShowProgress] = useState(false);
  const [progressData, setProgressData] = useState({
    currentUser: '',
    completedCount: 0,
    totalCount: 0,
    currentProgress: 0
  });
  

  const handleBulkIssue = async () => {
    const allUsers = [...savedEmployees, ...uploadedData];
    const selectedForIssue = allUsers.filter(user => selectedUsers.includes(user.m_no));
    
    if (selectedForIssue.length === 0) {
      alert('발급할 사용자를 선택해주세요.');
      return;
    }
    
    setIsBulkIssuing(true);
    setShowProgress(true);
    
    const totalCount = selectedForIssue.length;
    let completedCount = 0;
    let failedCount = 0;
    const failedUsers = [];
    
    // ✅ 여기서 명시적으로 초기화
    setProgressData({
      currentUser: `${selectedForIssue[0]?.m_name} (${selectedForIssue[0]?.m_no})`,
      completedCount: 0,  // 명시적으로 0
      totalCount: totalCount,
      currentProgress: 0  // 명시적으로 0
    });

    
    
    // 초기화 후 잠깐 대기
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      for (let i = 0; i < selectedForIssue.length; i++) {
        const user = selectedForIssue[i];
        
        // 현재 처리 중인 사용자만 업데이트
        setProgressData(prev => ({
          ...prev,
          currentUser: `${user.m_name} (${user.m_no})`
        }));
        
        try {
          const response = await apiService.issueCard({
            employeeId: user.m_no,
          });
          
          if (response.success) {
            completedCount++;
          } else {
            failedCount++;
            failedUsers.push(`${user.m_name}(${user.m_no})`);
          }
          
        } catch (error) {
          failedCount++;
          failedUsers.push(`${user.m_name}(${user.m_no})`);
        }
        
        // 처리 완료 후 업데이트
        const processedCount = completedCount + failedCount;
        setProgressData({
          currentUser: processedCount < totalCount 
            ? `${user.m_name} 처리완료` 
            : '모든 처리 완료',
          completedCount: processedCount,
          totalCount: totalCount,
          currentProgress: Math.floor((processedCount / totalCount) * 100) // Math.floor 추가
        });
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      setShowProgress(false);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let message = `총 ${totalCount}명 중 ${completedCount}명 발급 완료`;
      if (failedCount > 0) {
        message += `\n실패: ${failedCount}명\n(${failedUsers.join(', ')})`;
      }
      
      alert(message);
      setSelectedUsers([]);
      
    } catch (error) {
      setShowProgress(false);
      alert('대량 발급 중 오류가 발생했습니다.');
    } finally {
      setIsBulkIssuing(false);
    }
  };

  const handleChangeCardType = (m_no, value, source) => {
    const norm = (value ?? 'R').toUpperCase() === 'P' ? 'P' : 'R';
    const updater = (arr) => arr.map(u => u.m_no === m_no ? { ...u, saved_card_type: norm } : u);

    if (source === 'saved')      setSavedEmployees(prev => updater(prev));
    else if (source === 'upload') setUploadedData(prev => updater(prev));
    else                          setPopupSearchResults(prev => updater(prev)); // popup에서 편집할 경우
  };

  const UserTable = ({ users = [], source, showRemoveButton = false, savedEmployees = [] }) => {
    // 1) 타입 일관화: selection을 Set으로 계산
    const selectedSet = new Set(selectedUsers.map(v => String(v)));
    const ids = users.map(u => String(u.m_no));

    // 2) 선택 상태 계산
    const total = ids.length;
    const selectedCount = ids.filter(id => selectedSet.has(id)).length;
    const allChecked = total > 0 && selectedCount === total;
    const someChecked = selectedCount > 0 && selectedCount < total;

    // 3) 상단 체크박스 토글
    const toggleAll = (checked) => {
      const on = !!checked;
      if (on) {
        // 검색 팝업에서만 중복 체크
        if (source === 'popup') {
          const savedIds = new Set(savedEmployees.map(emp => String(emp.m_no)));
          const selectableIds = ids.filter(id => !savedIds.has(id));
          
          const union = new Set(selectedSet);
          selectableIds.forEach(id => union.add(id));
          setSelectedUsers(Array.from(union));
        } else {
          // 기존 로직 유지
          const union = new Set(selectedSet);
          ids.forEach(id => union.add(id));
          setSelectedUsers(Array.from(union));
        }
      } else {
        // 현재 테이블에 있는 것들만 제거
        const removeSet = new Set(ids);
        const next = Array.from(selectedSet).filter(id => !removeSet.has(id));
        setSelectedUsers(next);
      }
    };

    // 4) 개별 체크
    const onRowCheck = (userId, checked) => {
      const id = String(userId);
      
      if (!!checked) {
        // 검색 팝업에서만 중복 체크 (source가 'popup'일 때만)
        if (source === 'popup') {
          const isAlreadySaved = savedEmployees.some(emp => String(emp.m_no) === id);
          if (isAlreadySaved) {
            alert('이미 저장된 직원입니다.');
            return; // 체크되지 않도록 early return
          }
        }
        
        if (!selectedSet.has(id)) {
          setSelectedUsers([...selectedUsers, id]);
        }
      } else {
        setSelectedUsers(selectedUsers.filter(v => String(v) !== id));
      }
    };

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                aria-label="전체 선택"
                checked={allChecked ? true : (someChecked ? "indeterminate" : false)}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>사번</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>부서</TableHead>
            <TableHead>직급</TableHead>
            <TableHead>카드종류</TableHead>
            {showRemoveButton && <TableHead className="w-12">삭제</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showRemoveButton ? 7 : 6}>
                <p className="text-sm text-muted-foreground">표시할 직원이 없습니다.</p>
              </TableCell>
            </TableRow>
          ) : users.map((user) => {
            const id = String(user.m_no);
            return (
              <TableRow key={id}>
                <TableCell>
                  <Checkbox
                    checked={selectedSet.has(id)}
                    onCheckedChange={(checked) => onRowCheck(id, checked)}
                    aria-label={`${user.m_name} 선택`}
                  />
                </TableCell>
                <TableCell>{user.m_no}</TableCell>
                <TableCell>{user.m_name}</TableCell>
                <TableCell>{user.m_department_name}</TableCell>
                <TableCell>{user.m_position}</TableCell>
                <TableCell>
                  {(() => {
                    const current = ((user.saved_card_type ?? 'R') + '').toUpperCase();
                    const value = current === 'P' ? 'P' : 'R'; // 기본 R
                    return (
                      <Select
                        value={value}
                        onValueChange={(v) => handleChangeCardType(user.m_no, v, source)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="R">RFID</SelectItem>
                          <SelectItem value="P">PVC</SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </TableCell>
                {showRemoveButton && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSavedEmployee(id)}
                      aria-label="삭제"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };
  return (
    <div className="space-y-6">
      {/* 🔥 여기에 프로그레스 UI 추가! - 맨 첫 번째 줄 */}
      <BulkIssueProgress
        isVisible={showProgress}
        currentUser={progressData.currentUser}
        completedCount={progressData.completedCount}
        totalCount={progressData.totalCount}
        currentProgress={progressData.currentProgress}
      />
      <div>
        <h2 className="text-2xl font-semibold mb-2">직원증 일괄 발급</h2>
        <p className="text-muted-foreground">여러 직원의 직원증을 한번에 발급합니다.</p>
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
                    placeholder="이름, 사번을 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? '검색 중...' : '검색'}
                  </Button>
                </div>
              </div>
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
                    사번 정보가 포함된 엑셀 파일을 업로드하세요.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadExcelTemplate}
                  >
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
                        선택된 직원: {selectedUsers.filter(id => uploadedData.some(emp => emp.m_no === id)).length}명
                      </p>
                    </div>
                    <UserTable users={uploadedData} source="upload" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedUsers.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{selectedUsers.length}명 선택됨</span>
                </div>
                <Button onClick={handleBulkIssue} disabled={isBulkIssuing}>
                  {isBulkIssuing ? '발급 중...' : '선택된 직원 카드 일괄 발급'}
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* 저장된 직원 리스트 */}
          {Array.isArray(savedEmployees) && savedEmployees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  저장된 직원 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSaved ? (
                  <p className="text-sm text-muted-foreground">불러오는 중...</p>
                ) : savedEmployees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">저장된 직원이 없습니다.</p>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        총 {savedEmployees.length}명의 직원이 저장되었습니다.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        선택된 직원: {selectedUsers.filter(id =>
                          savedEmployees.some(emp => emp.m_no === id)
                        ).length}명
                      </p>
                    </div>
                    <UserTable users={savedEmployees} source="saved" showRemoveButton />
                  </>
                )}
              </CardContent>
            </Card>
          )}
      </Tabs>

      {/* 검색 결과 팝업 */}
      <Dialog open={showSearchPopup} onOpenChange={setShowSearchPopup}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              검색 결과
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {popupSearchResults.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {popupSearchResults.length}명의 직원이 검색되었습니다.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    선택된 직원: {selectedUsers.length}명
                  </p>
                </div>
                <UserTable users={popupSearchResults} source="popup" savedEmployees={savedEmployees} />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSearchPopup(false)}
              disabled={isSavingEmployees} // 저장 중일 때 비활성화
            >
              취소
            </Button>
            <Button 
              onClick={handleSaveSelectedEmployees} 
              disabled={selectedUsers.length === 0 || isSavingEmployees} // 저장 중일 때 비활성화
              className="flex items-center gap-2"
            >
              {isSavingEmployees ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  저장 중...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  선택된 직원 저장 ({selectedUsers.length}명)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}