import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { Task } from '../types';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchParams] = useSearchParams();

  const categories = ['회사일', '사이드프로젝트', '공부'];
  const statuses = [
    { value: 'pending', label: '대기' },
    { value: 'in_progress', label: '진행 중' },
    { value: 'completed', label: '완료' }
  ];

  useEffect(() => {
    loadTasks();
    
    // URL 파라미터에서 카테고리 설정
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedCategory, selectedStatus, searchQuery]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.tasks);
    } catch (error) {
      console.error('Tasks loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const updatedTask = { status: newStatus };
      await tasksAPI.updateTask(taskId, updatedTask);
      await loadTasks(); // 다시 로드
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('정말로 이 작업을 삭제하시겠습니까?')) {
      try {
        await tasksAPI.deleteTask(taskId);
        await loadTasks(); // 다시 로드
      } catch (error) {
        console.error('Task deletion error:', error);
      }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="fas fa-tasks"></i> 작업 목록
              <small className="text-muted ms-2">({filteredTasks.length}개)</small>
            </h1>
            <Link to="/add-task" className="btn btn-primary">
              <i className="fas fa-plus"></i> 새 작업 추가
            </Link>
          </div>
        </div>
      </div>

      {/* 필터링 영역 */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label">카테고리</label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">전체</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">상태</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">전체</option>
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">검색</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="제목 또는 설명으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 작업 목록 */}
      <div className="row">
        <div className="col-md-12">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <h5 className="card-title mb-0 me-3">{task.title}</h5>
                        <span className={`badge bg-${getCategoryColor(task.category)} me-2`}>
                          {task.category}
                        </span>
                        <span className={`badge bg-${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="card-text text-muted mb-2">{task.description}</p>
                      )}
                      
                      <div className="row text-muted small">
                        <div className="col-md-6">
                          <i className="fas fa-calendar-plus me-1"></i>
                          생성: {task.created_at}
                        </div>
                        {task.due_date && (
                          <div className="col-md-6">
                            <i className="fas fa-calendar-times me-1"></i>
                            마감: {task.due_date}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ms-3">
                      <div className="btn-group" role="group">
                        <select
                          className="form-select form-select-sm me-2"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          style={{ width: 'auto' }}
                        >
                          {statuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        
                        <Link 
                          to={`/edit-task/${task.id}`}
                          className="btn btn-outline-primary btn-sm me-1"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">작업이 없습니다</h4>
              <p className="text-muted">새로운 작업을 추가해보세요.</p>
              <Link to="/add-task" className="btn btn-primary">
                <i className="fas fa-plus"></i> 첫 번째 작업 추가
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
