import axios from 'axios';
import { User, Task, LoginData, RegisterData, TaskFormData, Statistics, CalendarEvent } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API
export const authAPI = {
  login: async (data: LoginData): Promise<{ user: User }> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (category?: string, status?: string): Promise<{ tasks: Task[] }> => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (status && status !== 'all') params.append('status', status);
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.task;
  },

  createTask: async (data: TaskFormData): Promise<{ task: Task; message: string }> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  updateTask: async (id: number, data: Partial<TaskFormData> | { status: string }): Promise<{ task: Task; message: string }> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  toggleTask: async (id: number): Promise<{ task: Partial<Task>; message: string }> => {
    const response = await api.post(`/tasks/${id}/toggle`);
    return response.data;
  },

  deleteTask: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStatistics: async (): Promise<Statistics> => {
    const response = await api.get('/dashboard/statistics');
    return response.data;
  },

  getRecentTasks: async (): Promise<{ tasks: Task[] }> => {
    const response = await api.get('/dashboard/recent-tasks');
    return response.data;
  },
};

// Calendar API
export const calendarAPI = {
  getEvents: async (start?: string, end?: string): Promise<{ events: CalendarEvent[] }> => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    
    const response = await api.get(`/calendar/events?${params.toString()}`);
    return response.data;
  },
};

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
