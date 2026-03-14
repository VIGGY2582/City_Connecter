import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Something went wrong';
      
      switch (status) {
        case 401:
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access denied. You don\'t have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your internet connection.');
    } else {
      toast.error('Request failed. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// User services
export const userAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// Department services
export const departmentAPI = {
  getAllDepartments: () => api.get('/departments'),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  createDepartment: (departmentData) => api.post('/departments', departmentData),
  updateDepartment: (id, departmentData) => api.put(`/departments/${id}`, departmentData),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
  getDepartmentComplaints: (id) => api.get(`/departments/${id}/complaints`),
};

// Complaint services
export const complaintAPI = {
  getAllComplaints: () => api.get('/complaints'),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  createComplaint: (complaintData) => api.post('/complaints', complaintData),
  updateComplaint: (id, complaintData) => api.put(`/complaints/${id}`, complaintData),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`),
  getUserComplaints: () => api.get('/complaints/my-complaints'),
  getDepartmentComplaints: () => api.get('/complaints/department'),
  assignComplaint: (id, assignmentData) => api.put(`/complaints/${id}/assign`, assignmentData),
  updateComplaintStatus: (id, statusData) => api.put(`/complaints/${id}/status`, statusData),
};

// Notification services
export const notificationAPI = {
  getAllNotifications: () => api.get('/notifications'),
  getUnreadNotifications: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Health check
export const healthAPI = {
  checkHealth: () => api.get('/health'),
};

export default api;
