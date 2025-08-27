export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  category: '회사일' | '사이드프로젝트' | '공부';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  due_date: string | null;
}

export interface Statistics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  today_completed: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  due_date: string | null;
  created_at: string;
  category: string;
  status: string;
  priority: string;
  description: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  category: '회사일' | '사이드프로젝트' | '공부';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
