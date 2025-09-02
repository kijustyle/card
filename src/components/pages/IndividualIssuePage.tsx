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
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(true) // 개발 모드 토글

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
      // 실제 API 호출
      const response = await apiService.searchUserByEmployeeId(searchId)

      if (response.success && response.data) {
        // API 응답 데이터를 프론트엔드 형식으로 변환
        const userData = {
          no: response.data.m_no,
          name: response.data.m_name,
          department: response.data.m_department_name,
          position: response.data.m_position,
          group: response.data.m_group,
          status: response.data.m_status,
          photo: response.data.photo,
          cnt: response.data.card_cnt,
        }

        setSearchedUser(userData)

        // 사용자 카드 발급 이력 조회
        const historyResponse = await apiService.getCardHistory({
          page: 0,
          size: 10,
          employeeId: searchId,
        })

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
    if (!searchedUser) return

    setIsIssuing(true)

    try {
      if (isDevelopmentMode) {
        // 개발 중에는 Mock 처리
        await mockApiDelay(1500)

        const newCard = {
          id: `card-${Date.now()}`,
          userId: searchedUser.id,
          cardType: 'employee',
          cardNumber: `NFMC-EMP-${Date.now().toString().slice(-3)}`,
          issuedAt: new Date().toISOString(),
          issuedBy: 'admin',
          status: 'active',
          qrCode: `QR-${Date.now()}`,
        }

        setUserHistory([newCard, ...userHistory])
        alert('카드가 성공적으로 발급되었습니다!')
      } else {
        // 실제 API 호출
        const response = await apiService.issueCard({
          employeeId: searchedUser.employeeId,
          cardType: 'employee',
          issuerNotes: '개인 카드 발급',
        })

        if (response.success && response.data) {
          const newCard = {
            id: response.data.id || response.data.cardId,
            userId: searchedUser.id,
            cardType: response.data.cardType,
            cardNumber: response.data.cardNumber,
            issuedAt: response.data.issuedAt,
            issuedBy: response.data.issuedBy,
            status: response.data.status,
            qrCode: response.data.qrCode,
          }

          setUserHistory([newCard, ...userHistory])
          alert('카드가 성공적으로 발급되었습니다!')
        } else {
          alert(response.message || '카드 발급에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('카드 발급 오류:', error)
      alert('카드 발급 중 오류가 발생했습니다. 다시 시도해주세요.')
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
      employee: '직원카드',
      visitor: '방문카드',
      temporary: '임시카드',
      contractor: '협력업체카드',
    }

    return typeMap[cardType] || cardType
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">개인 카드 발급</h2>
          <p className="text-muted-foreground">
            사번으로 직원을 조회하여 카드를 발급합니다.
          </p>
        </div>

        {/* 개발 모드 토글 */}
        <div className="flex items-center gap-2">
          <Label htmlFor="dev-mode">개발 모드</Label>
          <input
            id="dev-mode"
            type="checkbox"
            checked={isDevelopmentMode}
            onChange={(e) => setIsDevelopmentMode(e.target.checked)}
            className="rounded"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            직원 조회
            {isDevelopmentMode && (
              <Badge variant="outline" className="text-xs">
                개발 모드
              </Badge>
            )}
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
            <CardDescription>
              {isDevelopmentMode ? 'Mock 데이터' : 'DB 연동 데이터'}
            </CardDescription>
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
                    <Label>부서</Label>
                    <p className="mt-1">{searchedUser.department}</p>
                  </div>
                  <div>
                    <Label>사번</Label>
                    <p className="mt-1 font-mono">{searchedUser.employeeId}</p>
                  </div>
                  <div>
                    <Label>전화번호</Label>
                    <p className="mt-1">{searchedUser.phone || '-'}</p>
                  </div>
                  <div>
                    <Label>이메일</Label>
                    <p className="mt-1 text-sm break-all">
                      {searchedUser.email || '-'}
                    </p>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>발급일시</TableHead>
                    <TableHead>카드번호</TableHead>
                    <TableHead>발급유형</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userHistory.map((item) => {
                    const statusInfo = getStatusBadge(item.status)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(item.issuedAt)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {item.cardNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCardTypeName(item.cardType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            다운로드
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
