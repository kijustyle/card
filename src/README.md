# 국립소방병원 카드발급 시스템 (프론트엔드)

조나단 아이브 스타일의 클린한 디자인으로 제작된 국립소방병원 카드발급 시스템입니다.

## 🎯 주요 기능

- **로그인 및 인증**: 직원 인증 시스템
- **개인 카드 발급**: 사번 조회를 통한 개별 카드 즉시 발급
- **대량 카드 발급**: 검색 또는 엑셀 업로드를 통한 대량 발급
- **발급 이력 관리**: 전체 카드 발급 이력 조회 및 관리
- **대시보드**: 발급 현황 및 통계 대시보드

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Shadcn/ui
- **State Management**: React Hooks
- **API Integration**: Fetch API with Service Layer

## 📦 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd nfmc-card-system
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일에서 Spring 백엔드 API URL을 설정하세요:
```
REACT_APP_API_URL=http://localhost:8080/api
```

### 4. 개발 서버 실행
```bash
npm start
```

## 🔧 Spring 백엔드 연동

### API 엔드포인트 구조

현재 프론트엔드는 다음과 같은 Spring Boot API 엔드포인트를 기대합니다:

#### 인증 관련
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

#### 사용자 관리
- `GET /api/users/search?employeeId={employeeId}` - 사번으로 사용자 검색
- `GET /api/users/{userId}` - 사용자 정보 조회
- `PUT /api/users/{userId}` - 사용자 정보 수정

#### 카드 발급
- `POST /api/cards/issue` - 개별 카드 발급
- `POST /api/cards/bulk-issue` - 대량 카드 발급
- `GET /api/cards/history` - 카드 발급 이력 조회
- `GET /api/cards/{cardId}` - 카드 정보 조회
- `PUT /api/cards/{cardId}/deactivate` - 카드 비활성화

#### 파일 업로드
- `POST /api/files/upload-excel` - 엑셀 파일 업로드

#### 대시보드
- `GET /api/dashboard/stats` - 대시보드 통계

### 데이터 모델

```typescript
// 사용자 모델
interface User {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  phoneNumber: string;
  email: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 카드 발급 모델  
interface CardIssue {
  id: string;
  userId: string;
  cardType: 'employee' | 'visitor' | 'temporary';
  cardNumber: string;
  issuedAt: string;
  issuedBy: string;
  expiresAt?: string;
  status: 'active' | 'inactive' | 'expired';
  qrCode?: string;
  cardImageUrl?: string;
}
```

### Spring Boot Controller 예시

```java
@RestController
@RequestMapping("/api")
public class CardController {
    
    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // 로그인 처리 로직
    }
    
    @GetMapping("/users/search")
    public ResponseEntity<User> searchUser(@RequestParam String employeeId) {
        // 사용자 검색 로직
    }
    
    @PostMapping("/cards/issue")
    public ResponseEntity<CardIssue> issueCard(@RequestBody IssueCardRequest request) {
        // 카드 발급 로직
    }
    
    // 기타 엔드포인트들...
}
```

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: 소방관련 빨간색 계열
- **Secondary**: 파란색 계열 (의료진)
- **Accent**: 주황색 계열 (응급)
- **Neutral**: 회색 계열

### 타이포그래피
- **Base Font Size**: 14px
- **Font Weight**: 400 (Normal), 500 (Medium)
- **Line Height**: 1.5

## 📱 반응형 디자인

- **Desktop**: 1024px 이상
- **Tablet**: 768px - 1023px  
- **Mobile**: 320px - 767px

## 🔒 보안 고려사항

- JWT 토큰 기반 인증
- LocalStorage를 통한 토큰 저장
- API 요청 시 Bearer 토큰 포함
- CORS 설정 필요 (Spring Boot)

## 🚀 배포

### 프로덕션 빌드
```bash
npm run build
```

### 환경별 설정
- **개발**: `.env.development`
- **프로덕션**: `.env.production`

## 📄 라이선스

© 2024 국립소방병원. All rights reserved.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**개발자**: Figma Make AI Assistant  
**디자인**: Jonathan Ive 스타일 클린 디자인  
**문의**: 국립소방병원 IT팀