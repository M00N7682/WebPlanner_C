import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { TaskFormData } from '../types';

const AddTask: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

    try {
      setLoading(true);
      await tasksAPI.createTask(formData);
      alert('작업이 성공적으로 추가되었습니다.');
      navigate('/tasks');
    } catch (error) {
      console.error('Task creation error:', error);
      alert('작업 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?')) {
      navigate('/tasks');
    }
  };

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
            <h1><i className="fas fa-plus"></i> 새 작업 추가</h1>
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

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline-secondary"
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i> 취소
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        추가 중...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> 작업 추가
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6><i className="fas fa-info-circle"></i> 작업 추가 가이드</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6 className="text-primary">카테고리별 활용법</h6>
                <ul className="list-unstyled small">
                  <li><span className="badge bg-primary me-1">회사일</span> 업무 관련 작업</li>
                  <li><span className="badge bg-success me-1">사이드프로젝트</span> 개인 프로젝트</li>
                  <li><span className="badge bg-warning me-1">공부</span> 학습 관련 작업</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <h6 className="text-info">상태 설명</h6>
                <ul className="list-unstyled small">
                  <li><span className="badge bg-secondary me-1">대기</span> 아직 시작하지 않음</li>
                  <li><span className="badge bg-info me-1">진행 중</span> 현재 작업 중</li>
                  <li><span className="badge bg-success me-1">완료</span> 작업 완료됨</li>
                </ul>
              </div>

              <div>
                <h6 className="text-warning">팁</h6>
                <ul className="small">
                  <li>명확하고 구체적인 제목을 작성하세요</li>
                  <li>설명란에 상세한 요구사항을 기록하세요</li>
                  <li>마감일을 설정하여 계획적으로 관리하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
