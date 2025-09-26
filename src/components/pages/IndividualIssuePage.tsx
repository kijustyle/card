import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'
import {
  Search,
  UserPlus,
  Download,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { CardTemplate } from '../card/CardTemplate'
import { apiService } from '../../services/api'
import {
  mockApiDelay,
  findMockUser,
  getMockCardHistory,
} from '../../utils/mockData'
import { UserInfo, UserData, CardIssue } from '../../types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { group } from 'console'

export function IndividualIssuePage() {
  const [searchId, setSearchId] = useState('')
  const [searchedUser, setSearchedUser] = useState(null)
  const [userHistory, setUserHistory] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [cardCount, setCardCount] = useState(0) // 발급차수 상태
  const [cardType, setCardType] = useState('R')

  const [currentPage, setCurrentPage] = useState(0) // 페이징 상태 
  const [totalPages, setTotalPages] = useState(0)   // 총 페이지 수
  const [totalElements, setTotalElements] = useState(0) // 총 요소 수
  
  const handleSearch = async () => {
    if (!searchId.trim()) {
      setSearchError('사번을 입력해주세요.')
      return
    }

    setIsSearching(true)
    setSearchError('')
    setSearchedUser(null)
    setUserHistory([])

    try {
      
      const response = await apiService.searchUserByEmployeeId(searchId)
      
      console.log(response);
      
      if (response.success && response.data) {
        // API 응답 데이터를 프론트엔드 형식으로 변환
        const userData = {
          no: response.data.m_no,
          name: response.data.m_name,
          ename : response.data.m_e_name,
          department: response.data.m_department_name,
          position: response.data.m_position_name,
          group: response.data.m_group,
          status: response.data.m_status,
          photo_blob: response.data.photo_blob,
          card_count: response.data.card_count,
        }
        setSearchedUser(userData)
        setCardCount(userData.card_count)

        // 사용자 카드 발급 이력 조회
        await loadHistory(0) // 첫 페이지부터 로드

        // 사용자 카드 발급 이력 조회
        const historyResponse = await apiService.getCardHistory({
          page: 0,
          size: 10,
          employeeId: searchId,
        })

        console.log(historyResponse);
        
        if (historyResponse.success && historyResponse.data) {
          setUserHistory(
            historyResponse.data.content || historyResponse.data || []
          )
        }
      } else {
        setSearchError(
          response.message || '해당 사번의 사용자를 찾을 수 없습니다.'
        )
      }
    } catch (error) {
      console.error('사용자 검색 오류:', error)
      setSearchError('검색 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleIssueCard = async () => {
    if (!searchedUser) {
      alert('사용자 정보가 없습니다.')
      return
    }

    // 카드 발급차수 유효성 검증
    if (!cardCount || cardCount < 1) {
      alert('올바른 발급차수를 입력해주세요.')
      return
    }

    setIsIssuing(true)

    try {
      const issueData = {
        employeeId: searchedUser.no,           // 사번
        name: searchedUser.name,               // 이름
        ename: searchedUser.ename,             // 영문 이름
        department: searchedUser.department,    // 부서
        position: searchedUser.position,       // 직급
        cardCount: cardCount,                  // 발급차수
        cardType: cardType,                    // 선택된 카드종류
        photo_blob: searchedUser.photo_blob,    // 사진
      }

      console.log('카드발급 요청 데이터:', issueData)

      // 실제 API 호출
      const response = await apiService.issueCard(issueData)

      if (response.success) {
        // 발급 성공 시 처리
        alert('카드가 성공적으로 발급되었습니다!')
        
        // 같은 사번으로 다시 조회하여 최신 정보 반영
        await handleSearch()
        
      } else {
        // 발급 실패 시 처리
        const errorMessage = '카드 발급에 실패했습니다. \n[' + response.message + ']'
        console.error('카드 발급 실패:', response)
        alert(errorMessage)
      }
      
    } catch (error) {
      console.error('카드 발급 오류:', error)
      
      // 네트워크 오류인지 서버 오류인지 구분
      if (error.name === 'NetworkError' || !navigator.onLine) {
        alert('네트워크 연결을 확인해주세요.')
      } else if (error.response) {
        // 서버에서 오류 응답을 받은 경우
        const serverError = error.response.data?.message || '서버 오류가 발생했습니다.'
        alert(serverError)
      } else {
        alert('카드 발급 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsIssuing(false)
    }
  }


  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: '활성', variant: 'default' },
      inactive: { label: '비활성', variant: 'secondary' },
      expired: { label: '만료', variant: 'destructive' },
      suspended: { label: '정지', variant: 'outline' },
    }

    return statusMap[status] || { label: status, variant: 'secondary' }
  }

  const getCardTypeName = (cardType) => {
    const typeMap = {
      'P': 'PVC카드',
      'R': 'RFID카드',
    }

    return typeMap[cardType] || cardType
  }

  const loadHistory = async (page) => {
    try {
      const historyResponse = await apiService.getCardHistory({
        page: page,
        size: 10,
        employeeId: searchedUser?.no || searchId,
      })

      if (historyResponse.success && historyResponse.data) {
        setUserHistory(historyResponse.data.content || [])
        setTotalPages(historyResponse.data.totalPages || 0)
        setTotalElements(historyResponse.data.totalElements || 0)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('이력 조회 오류:', error)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadHistory(newPage)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">직원증 발급</h2>
          <p className="text-muted-foreground">
            직원을 조회하여 직원증을 즉시 발급합니다.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            직원 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="employee-id">검색어</Label>
              <Input
                id="employee-id"
                placeholder="사번을 입력하세요"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={searchError ? 'border-red-500' : ''}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    조회 중...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    조회
                  </>
                )}
              </Button>
            </div>
          </div>

          {searchError && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700 text-sm">{searchError}</p>
            </div>
          )}
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
                    <p className="mt-1 font-medium">{searchedUser.name}</p>
                  </div>
                  <div>
                    <Label>직급</Label>
                    <p className="mt-1">{searchedUser.position}</p>
                  </div>
                  <div>
                    <Label>영문이름</Label>
                    <p className="mt-1">{searchedUser.ename}</p>
                  </div>
                  <div>
                    <Label>부서</Label>
                    <p className="mt-1">{searchedUser.department}</p>
                  </div>
                  <div>
                    <Label>사번</Label>
                    <p className="mt-1 font-mono">{searchedUser.no}</p>
                  </div>
                  <div>
                    <Label>차수</Label>
                    <Input
                      id="card-count"
                      type="number"
                      min="1"
                      value={cardCount}
                      onChange={(e) => setCardCount(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  {/* 카드타입 선택 라디오 버튼 추가 */}
                  <div>
                    <Label>카드종류</Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="rfid-card"
                          name="cardType"
                          value="R"
                          checked={cardType === 'R'}
                          onChange={(e) => setCardType(e.target.value)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="rfid-card" className="font-normal cursor-pointer">
                          RFID카드
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="pvc-card"
                          name="cardType"
                          value="P"
                          checked={cardType === 'P'}
                          onChange={(e) => setCardType(e.target.value)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="pvc-card" className="font-normal cursor-pointer">
                          PVC카드
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {searchedUser.status && (
                    <div>
                      <Label>상태</Label>
                      <p className="mt-1">
                        <Badge
                          variant={
                            searchedUser.status === 'W'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {searchedUser.status === 'W' ? '재직' : '퇴직'}
                        </Badge>
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleIssueCard}
                  disabled={isIssuing || searchedUser.status === 'N'}
                  className="w-full"
                >
                  {isIssuing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      발급 중...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      카드 즉시 발급
                    </>
                  )}
                </Button>

                {searchedUser.status === 'N' && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    퇴직한 직원은 카드를 발급할 수 없습니다.
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <CardTemplate
                  name={searchedUser.name}
                  position={searchedUser.position}
                  department={searchedUser.department}
                  employeeId={searchedUser.no}
                  photo={searchedUser.photo_blob}  // photo_blob 사용
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
            <CardTitle className="flex items-center justify-between">
              발급 이력
              <Badge variant="outline">{userHistory.length}건</Badge>
            </CardTitle>
            <CardDescription>
              이전에 발급된 카드 내역을 확인할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>발급 이력이 없습니다.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>발급일시</TableHead>
                      <TableHead>카드종류</TableHead>
                      <TableHead>발급차수</TableHead>
                      <TableHead>부서</TableHead>
                      <TableHead>직급</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userHistory.map((item, index) => {
                      const statusInfo = getStatusBadge(item.status)
                      return (
                        <TableRow key={`${item.employeeId}_${item.cardCount}_${index}`}>
                          <TableCell className="font-mono text-sm">
                            {formatDate(item.issuedAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCardTypeName(item.cardType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.cardCount}
                          </TableCell>
                          <TableCell>
                            {item.department}
                          </TableCell>
                          <TableCell>
                            {item.position}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* 페이징 네비게이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      {currentPage * 10 + 1}-{Math.min((currentPage + 1) * 10, totalElements)} / {totalElements}건
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        이전
                      </Button>
                      <span className="text-sm">
                        {currentPage + 1} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
