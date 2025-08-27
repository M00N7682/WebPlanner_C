// 앱 전체에서 사용되는 JavaScript 기능들

document.addEventListener('DOMContentLoaded', function() {
    // 부트스트랩 툴팁 초기화
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 알림 자동 숨김
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            if (bsAlert) {
                bsAlert.close();
            }
        }, 5000);
    });

    // 폼 유효성 검사
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
});

// 로딩 상태 표시
function showLoading(element) {
    const originalText = element.innerHTML;
    element.innerHTML = '<span class="loading"></span> 로딩중...';
    element.disabled = true;
    
    return function() {
        element.innerHTML = originalText;
        element.disabled = false;
    };
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(function() {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 3000);
}

// 에러 메시지 표시
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(function() {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}

// 날짜 형식 변환
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 시간 형식 변환
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 상대적 시간 표시
function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
        return `${diffDays}일 전`;
    } else if (diffHours > 0) {
        return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes}분 전`;
    } else {
        return '방금 전';
    }
}

// 키보드 단축키
document.addEventListener('keydown', function(event) {
    // Ctrl + N: 새 작업 추가
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        window.location.href = '/add_task';
    }
    
    // Ctrl + H: 홈으로 이동
    if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        window.location.href = '/';
    }
    
    // Ctrl + L: 작업 목록으로 이동
    if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        window.location.href = '/tasks';
    }
});

// 다크 모드 토글 (선택사항)
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// 다크 모드 복원
function restoreDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// 페이지 로드 시 다크 모드 복원
document.addEventListener('DOMContentLoaded', restoreDarkMode);

// AJAX 헬퍼 함수
function makeRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return fetch(url, mergedOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Request failed:', error);
            showErrorMessage('요청 처리 중 오류가 발생했습니다.');
            throw error;
        });
}

// 잔디 캘린더 업데이트 함수
function updateGrassCalendar() {
    const calendar = document.getElementById('grass-calendar');
    if (calendar) {
        calendar.classList.add('updating');
    }
    
    fetch('/api/grass_data')
        .then(response => response.json())
        .then(data => {
            // 기존 캘린더 제거
            const grid = document.getElementById('grass-grid');
            if (grid) {
                grid.innerHTML = '';
                createGrassCalendar(data);
            }
        })
        .catch(error => {
            console.error('잔디 캘린더 업데이트 실패:', error);
        })
        .finally(() => {
            if (calendar) {
                calendar.classList.remove('updating');
            }
        });
}

// 통계 카드 업데이트 함수
function updateStatistics() {
    fetch('/api/statistics')
        .then(response => response.json())
        .then(data => {
            // 통계 카드 업데이트
            const totalTasks = document.querySelector('.card.bg-primary h4');
            const completedTasks = document.querySelector('.card.bg-success h4');
            const pendingTasks = document.querySelector('.card.bg-warning h4');
            const todayCompleted = document.querySelector('.card.bg-info h4');
            
            if (totalTasks) totalTasks.textContent = data.total_tasks;
            if (completedTasks) completedTasks.textContent = data.completed_tasks;
            if (pendingTasks) pendingTasks.textContent = data.pending_tasks;
            if (todayCompleted) todayCompleted.textContent = data.today_completed;
        })
        .catch(error => {
            console.error('통계 업데이트 실패:', error);
        });
}

// 최근 작업 목록 업데이트 함수
function updateRecentTasks() {
    fetch('/api/recent_tasks')
        .then(response => response.json())
        .then(data => {
            const recentTasksContainer = document.querySelector('.card .card-body');
            if (!recentTasksContainer) return;
            
            // 기존 작업 목록 제거 (새 작업 추가 버튼 제외)
            const existingTasks = recentTasksContainer.querySelectorAll('.d-flex.justify-content-between.align-items-center');
            existingTasks.forEach(task => task.remove());
            
            // 새 작업 목록 추가
            if (data.length > 0) {
                data.forEach(task => {
                    const taskDiv = document.createElement('div');
                    taskDiv.className = 'd-flex justify-content-between align-items-center mb-2 p-2 border rounded';
                    taskDiv.innerHTML = `
                        <div>
                            <strong>${task.title}</strong>
                            <br>
                            <small class="text-muted">
                                <span class="badge bg-secondary">${task.category}</span>
                                ${task.created_at}
                            </small>
                        </div>
                        <div>
                            ${task.status === 'completed' 
                                ? '<i class="fas fa-check-circle text-success"></i>' 
                                : '<i class="fas fa-clock text-warning"></i>'}
                        </div>
                    `;
                    
                    // 새 작업 추가 버튼 앞에 삽입
                    const addButton = recentTasksContainer.querySelector('.text-center');
                    if (addButton) {
                        recentTasksContainer.insertBefore(taskDiv, addButton);
                    }
                });
            } else {
                // 작업이 없을 때 메시지 추가
                const noTasksMsg = document.createElement('p');
                noTasksMsg.className = 'text-muted';
                noTasksMsg.textContent = '아직 작업이 없습니다.';
                
                const addButton = recentTasksContainer.querySelector('.text-center');
                if (addButton) {
                    recentTasksContainer.insertBefore(noTasksMsg, addButton);
                }
            }
        })
        .catch(error => {
            console.error('최근 작업 업데이트 실패:', error);
        });
}

// 잔디 캘린더 생성 함수 (전역으로 사용)
function createGrassCalendar(data) {
    const grid = document.getElementById('grass-grid');
    if (!grid) return;
    
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // 주별로 정렬
    const weeks = [];
    let currentWeek = [];
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const count = data[dateStr] || 0;
        const level = getGrassLevel(count);
        
        currentWeek.push({
            date: new Date(d),
            count: count,
            level: level
        });
        
        if (d.getDay() === 6 || d.getTime() === today.getTime()) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
    }
    
    // HTML 생성
    weeks.forEach(week => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'grass-week';
        
        week.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'grass-square';
            dayDiv.setAttribute('data-level', day.level);
            dayDiv.title = `${day.date.toLocaleDateString()} - ${day.count}개 작업 완료`;
            weekDiv.appendChild(dayDiv);
        });
        
        grid.appendChild(weekDiv);
    });
}

// 잔디 레벨 계산 함수
function getGrassLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
}

// 폼 데이터를 JSON으로 변환
function formDataToJSON(formData) {
    const object = {};
    formData.forEach((value, key) => {
        object[key] = value;
    });
    return JSON.stringify(object);
}

// 스크롤 위치 복원
function saveScrollPosition() {
    localStorage.setItem('scrollPosition', window.pageYOffset);
}

function restoreScrollPosition() {
    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
        localStorage.removeItem('scrollPosition');
    }
}

// 페이지 종료 시 스크롤 위치 저장
window.addEventListener('beforeunload', saveScrollPosition);

// 페이지 로드 시 스크롤 위치 복원
window.addEventListener('load', restoreScrollPosition);
