# TodoList 웹 애플리케이션

GitHub 스타일의 잔디 캘린더와 카테고리별 작업 관리 기능을 제공하는 현대적인 TodoList 웹 애플리케이션입니다.

## 주요 기능

### 🌟 핵심 기능
- **GitHub 스타일 잔디 캘린더**: 일별 작업 완료 현황을 시각적으로 표시
- **카테고리별 관리**: 회사일, 사이드프로젝트, 공부로 작업 분류
- **우선순위 설정**: 높음, 보통, 낮음 3단계 우선순위
- **마감일 관리**: 작업별 마감일 설정 및 추적
- **실시간 상태 업데이트**: 체크박스 클릭으로 즉시 완료 상태 변경

### 📊 대시보드
- 전체/완료/대기중인 작업 수 통계
- 오늘 완료한 작업 수
- 최근 작업 목록
- 카테고리별 빠른 접근

### 🎨 사용자 경험
- 반응형 디자인 (모바일/태블릿/데스크톱 지원)
- 직관적인 사용자 인터페이스
- 부드러운 애니메이션 효과
- 키보드 단축키 지원
- 자동 알림 시스템

## 기술 스택

### 백엔드
- **Python 3.13**: 최신 Python 버전
- **Flask 3.0**: 웹 프레임워크
- **SQLAlchemy**: ORM (Object-Relational Mapping)
- **Flask-Login**: 사용자 인증
- **Flask-WTF**: 폼 처리 및 CSRF 보호
- **SQLite**: 데이터베이스

### 프론트엔드
- **HTML5**: 시맨틱 마크업
- **CSS3**: 현대적인 스타일링
- **JavaScript (ES6+)**: 인터랙티브 기능
- **Bootstrap 5**: UI 프레임워크
- **Font Awesome**: 아이콘

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd todolist
```

### 2. 가상환경 설정 (자동으로 설정됨)
```bash
# 가상환경이 자동으로 생성되어 있습니다
```

### 3. 의존성 설치 (이미 설치됨)
```bash
# 패키지들이 이미 설치되어 있습니다
pip install -r requirements.txt
```

### 4. 애플리케이션 실행
```bash
python run.py
```

### 5. 브라우저에서 접속
```
http://127.0.0.1:5000
```

## 사용법

### 1. 회원가입 및 로그인
- 첫 방문 시 회원가입 페이지에서 계정 생성
- 사용자명, 이메일, 비밀번호 입력

### 2. 작업 추가
- **새 작업 추가** 버튼 클릭
- 제목, 설명, 카테고리, 우선순위, 마감일 입력
- **Ctrl + N** 단축키로 빠른 추가 가능

### 3. 작업 관리
- 체크박스 클릭으로 완료/미완료 상태 변경
- **수정** 버튼으로 작업 내용 변경
- **삭제** 버튼으로 작업 제거

### 4. 필터링 및 정렬
- 카테고리별 필터링: 전체, 회사일, 사이드프로젝트, 공부
- 상태별 필터링: 전체, 대기중, 완료됨

### 5. 잔디 캘린더 활용
- 대시보드에서 지난 1년간의 활동 현황 확인
- 완료한 작업 수에 따라 색상 강도 변화
- 마우스 호버로 해당 날짜의 상세 정보 확인

## 키보드 단축키

- **Ctrl + N**: 새 작업 추가
- **Ctrl + H**: 홈(대시보드)으로 이동
- **Ctrl + L**: 작업 목록으로 이동

## 프로젝트 구조

```
todolist/
├── app/
│   ├── __init__.py          # Flask 앱 팩토리
│   ├── models.py            # 데이터베이스 모델
│   ├── routes.py            # 메인 라우트
│   ├── auth.py              # 인증 관련 라우트
│   ├── forms.py             # WTForms 폼 정의
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css    # 커스텀 스타일
│   │   └── js/
│   │       └── app.js       # JavaScript 기능
│   └── templates/
│       ├── base.html        # 기본 템플릿
│       ├── index.html       # 대시보드
│       ├── tasks.html       # 작업 목록
│       ├── add_task.html    # 작업 추가
│       ├── edit_task.html   # 작업 수정
│       └── auth/
│           ├── login.html   # 로그인
│           └── register.html # 회원가입
├── requirements.txt         # 의존성 목록
└── run.py                  # 애플리케이션 진입점
```

## 데이터베이스 스키마

### User 테이블
- id: 기본키
- username: 사용자명 (고유)
- email: 이메일 (고유)
- password_hash: 암호화된 비밀번호
- created_at: 생성일시

### Task 테이블
- id: 기본키
- title: 작업 제목
- description: 작업 설명
- category: 카테고리 (회사일/사이드프로젝트/공부)
- priority: 우선순위 (low/medium/high)
- status: 상태 (pending/completed)
- created_at: 생성일시
- updated_at: 수정일시
- completed_at: 완료일시
- due_date: 마감일
- user_id: 사용자 외래키

## API 엔드포인트

### 인증
- `GET/POST /login`: 로그인
- `GET/POST /register`: 회원가입
- `GET /logout`: 로그아웃

### 작업 관리
- `GET /`: 대시보드
- `GET /tasks`: 작업 목록
- `GET/POST /add_task`: 작업 추가
- `GET/POST /edit_task/<id>`: 작업 수정
- `POST /toggle_task/<id>`: 작업 상태 토글
- `POST /delete_task/<id>`: 작업 삭제

### API
- `GET /api/grass_data`: 잔디 캘린더 데이터

## 보안 기능

- CSRF 보호 (Flask-WTF)
- 비밀번호 해싱 (Werkzeug)
- 세션 관리 (Flask-Login)
- SQL 인젝션 방지 (SQLAlchemy ORM)

## 향후 개발 계획

- [ ] 팀 협업 기능
- [ ] 작업 공유 및 댓글
- [ ] 모바일 앱 개발
- [ ] 이메일 알림
- [ ] 통계 및 리포트 기능
- [ ] 다크 모드
- [ ] 다국어 지원

## 라이선스

MIT License

## 개발자

개발 문의사항이나 기능 제안은 언제든지 환영합니다!

---

**즐거운 작업 관리 되세요! 🎯**
