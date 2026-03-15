import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auth token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authAPI = {
  register:      (userData)    => api.post('/auth/register', userData),
  login:         (credentials) => api.post('/auth/login', credentials),
  getProfile:    ()            => api.get('/auth/profile'),
  updateProfile: (userData)    => api.put('/auth/profile', userData),
};

// Complaint services
export const complaintAPI = {
  create: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll:                 ()              => api.get('/complaints'),
  getById:                (id)            => api.get(`/complaints/${id}`),
  getUserComplaints:      ()              => api.get('/complaints/user/my-complaints'),
  getDepartmentComplaints:()              => api.get('/complaints/department/my-complaints'),
  updateStatus:           (id, status)   => api.put(`/complaints/${id}/status`, { status }),
  assignDepartment:       (id, deptId)   => api.put(`/complaints/${id}/assign`, { department_id: deptId }),
  getStats:               ()             => api.get('/complaints/stats'),
};

// Department services
export const departmentAPI = {
  getAll:      ()              => api.get('/departments'),
  getById:     (id)            => api.get(`/departments/${id}`),
  create:      (data)          => api.post('/departments', data),
  update:      (id, data)      => api.put(`/departments/${id}`, data),
  remove:      (id)            => api.delete(`/departments/${id}`),
  getComplaints:(id)           => api.get(`/departments/${id}/complaints`),
};

// Admin services
export const adminAPI = {
  getAllUsers:  ()          => api.get('/admin/users'),
  updateUser:  (id, data)  => api.put(`/admin/users/${id}`, data),
  deleteUser:  (id)        => api.delete(`/admin/users/${id}`),
};

// Feedback services
export const feedbackAPI = {
  create:          (data)         => api.post('/feedback', data),
  getByComplaintId:(complaintId)  => api.get(`/feedback/complaint/${complaintId}`),
  getStats:        ()             => api.get('/feedback/stats/all'),
};

// Notification services
export const notificationAPI = {
  getAll:        () => api.get('/notifications'),
  markAsRead:    (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount:() => api.get('/notifications/unread/count'),
};

export default api;
