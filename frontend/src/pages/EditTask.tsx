import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { Task, TaskFormData } from '../types';

const EditTask: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: '회사일',
    priority: 'medium',
    status: 'pending',
    due_date: ''
  });

  const categories = ['회사일', '사이드프로젝트', '공부'];
  const statuses = [
    { value: 'pending', label: '대기' },
    { value: 'in_progress', label: '진행 중' },
    { value: 'completed', label: '완료' }
  ];

  useEffect(() => {
    if (id) {
      loadTask(parseInt(id));
    }
  }, [id]);

  const loadTask = async (taskId: number) => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTask(taskId);
      setTask(response);
      setFormData({
        title: response.title,
        description: response.description,
        category: response.category,
        priority: response.priority,
        status: response.status,
        due_date: response.due_date || ''
      });
    } catch (error) {
      console.error('Task loading error:', error);
      alert('작업을 불러오는 중 오류가 발생했습니다.');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!id) {
      alert('작업 ID가 없습니다.');
      return;
    }

    try {
      setSaving(true);
      await tasksAPI.updateTask(parseInt(id), formData);
      alert('작업이 성공적으로 수정되었습니다.');
      navigate('/tasks');
    } catch (error) {
      console.error('Task update error:', error);
      alert('작업 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('수정 중인 내용이 있습니다. 정말로 취소하시겠습니까?')) {
      navigate('/tasks');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('정말로 이 작업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await tasksAPI.deleteTask(parseInt(id));
        alert('작업이 삭제되었습니다.');
        navigate('/tasks');
      } catch (error) {
        console.error('Task deletion error:', error);
        alert('작업 삭제 중 오류가 발생했습니다.');
      }
    }
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

  if (!task) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h4>작업을 찾을 수 없습니다</h4>
        <p className="text-muted">요청하신 작업이 존재하지 않거나 삭제되었습니다.</p>
        <button onClick={() => navigate('/tasks')} className="btn btn-primary">
          <i className="fas fa-arrow-left"></i> 작업 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-md-12">
          <div className="d-flex align-items-center mb-4">
            <button 
              onClick={() => navigate('/tasks')}
              className="btn btn-outline-secondary me-3"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1><i className="fas fa-edit"></i> 작업 수정</h1>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    제목 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="작업 제목을 입력하세요"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">설명</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="작업에 대한 자세한 설명을 입력하세요"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">카테고리</label>
                      <select
                        id="category"
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">상태</label>
                      <select
                        id="status"
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="due_date" className="form-label">마감일</label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    className="form-control"
                    value={formData.due_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-outline-danger"
                    disabled={saving}
                  >
                    <i className="fas fa-trash"></i> 삭제
                  </button>
                  
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-outline-secondary"
                      disabled={saving}
                    >
                      <i className="fas fa-times"></i> 취소
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i> 수정 완료
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-info-circle"></i> 작업 정보</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>생성일:</strong><br />
                <span className="text-muted">{task.created_at}</span>
              </div>
              
              {task.updated_at && (
                <div className="mb-3">
                  <strong>수정일:</strong><br />
                  <span className="text-muted">{task.updated_at}</span>
                </div>
              )}
              
              <div className="mb-3">
                <strong>현재 상태:</strong><br />
                <span className={`badge bg-${
                  task.status === 'completed' ? 'success' :
                  task.status === 'in_progress' ? 'info' : 'secondary'
                }`}>
                  {statuses.find(s => s.value === task.status)?.label || task.status}
                </span>
              </div>
              
              <div className="mb-3">
                <strong>카테고리:</strong><br />
                <span className={`badge bg-${
                  task.category === '회사일' ? 'primary' :
                  task.category === '사이드프로젝트' ? 'success' : 'warning'
                }`}>
                  {task.category}
                </span>
              </div>

              {task.due_date && (
                <div className="mb-3">
                  <strong>마감일:</strong><br />
                  <span className="text-muted">{task.due_date}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
