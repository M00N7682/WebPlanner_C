import React, { useState, useEffect } from 'react';
import { dashboardAPI, calendarAPI } from '../services/api';
import { Statistics, Task, CalendarEvent } from '../types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, recentData, eventsData] = await Promise.all([
        dashboardAPI.getStatistics(),
        dashboardAPI.getRecentTasks(),
        calendarAPI.getEvents(),
      ]);

      setStatistics(statsData);
      setRecentTasks(recentData.tasks);
      setCalendarEvents(eventsData.events);
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '회사일':
        return 'primary';
      case '사이드프로젝트':
        return 'success';
      case '공부':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getTileContent = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = calendarEvents.filter(event => 
      event.start === dateStr || event.due_date === dateStr
    );

    if (dayEvents.length > 0) {
      return (
        <div className="calendar-events">
          {dayEvents.slice(0, 3).map((event, index) => (
            <div 
              key={index} 
              className={`calendar-event bg-${getCategoryColor(event.category)}`}
              title={event.title}
            ></div>
          ))}
          {dayEvents.length > 3 && (
            <div className="calendar-event-more">+{dayEvents.length - 3}</div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-md-12">
          <h1 className="mb-4">
            <i className="fas fa-tachometer-alt"></i> 대시보드
            <small className="text-muted ms-2">환영합니다!</small>
          </h1>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{statistics?.total_tasks || 0}</h4>
                  <p className="mb-0">전체 작업</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-tasks fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{statistics?.completed_tasks || 0}</h4>
                  <p className="mb-0">완료된 작업</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{statistics?.pending_tasks || 0}</h4>
                  <p className="mb-0">대기 중인 작업</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{statistics?.today_completed || 0}</h4>
                  <p className="mb-0">오늘 완료</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-calendar-check fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* 캘린더 */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-calendar"></i> 활동 캘린더</h5>
            </div>
            <div className="card-body">
              <Calendar
                onChange={(value) => setCalendarDate(value as Date)}
                value={calendarDate}
                tileContent={getTileContent}
                className="react-calendar-custom"
              />
            </div>
          </div>
        </div>

        {/* 최근 작업 */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-clock"></i> 최근 작업</h5>
            </div>
            <div className="card-body">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div key={task.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <div>
                      <strong>{task.title}</strong>
                      <br />
                      <small className="text-muted">
                        <span className={`badge bg-${getCategoryColor(task.category)} me-1`}>
                          {task.category}
                        </span>
                        {task.created_at}
                      </small>
                    </div>
                    <div>
                      {task.status === 'completed' ? (
                        <i className="fas fa-check-circle text-success"></i>
                      ) : (
                        <i className="fas fa-clock text-warning"></i>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">아직 작업이 없습니다.</p>
              )}
              
              <div className="text-center mt-3">
                <a href="/add-task" className="btn btn-primary btn-sm">
                  <i className="fas fa-plus"></i> 새 작업 추가
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리별 빠른 접근 */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-layer-group"></i> 카테고리별 작업</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <a href="/tasks?category=회사일" className="text-decoration-none">
                    <div className="card bg-light hover-card">
                      <div className="card-body text-center">
                        <i className="fas fa-briefcase fa-3x text-primary mb-2"></i>
                        <h5>회사일</h5>
                        <p className="text-muted">업무 관련 작업</p>
                      </div>
                    </div>
                  </a>
                </div>
                <div className="col-md-4">
                  <a href="/tasks?category=사이드프로젝트" className="text-decoration-none">
                    <div className="card bg-light hover-card">
                      <div className="card-body text-center">
                        <i className="fas fa-code fa-3x text-success mb-2"></i>
                        <h5>사이드프로젝트</h5>
                        <p className="text-muted">개인 프로젝트</p>
                      </div>
                    </div>
                  </a>
                </div>
                <div className="col-md-4">
                  <a href="/tasks?category=공부" className="text-decoration-none">
                    <div className="card bg-light hover-card">
                      <div className="card-body text-center">
                        <i className="fas fa-graduation-cap fa-3x text-warning mb-2"></i>
                        <h5>공부</h5>
                        <p className="text-muted">학습 관련 작업</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
