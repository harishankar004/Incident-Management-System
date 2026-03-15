import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
http.interceptors.request.use(cfg => {
  const t = localStorage.getItem('ims_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Handle 401 → redirect to login
http.interceptors.response.use(
  r => r,
  e => {
    if (e.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(e);
  }
);

export const authAPI = {
  login: d => http.post('/api/auth/login', d),
};

export const incidentAPI = {
  create:       d       => http.post('/api/incidents', d),
  list:         params  => http.get('/api/incidents', { params }),
  myList:       params  => http.get('/api/incidents/my', { params }),
  getById:      id      => http.get(`/api/incidents/${id}`),
  assign:       (id, d) => http.patch(`/api/incidents/${id}/assign`, d),
  changeStatus: (id, d) => http.patch(`/api/incidents/${id}/status`, d),
  addComment:   (id, d) => http.post(`/api/incidents/${id}/comments`, d),
  kpi:          ()      => http.get('/api/incidents/dashboard/kpi'),
};

export const adminAPI = {
  createUser:  d       => http.post('/api/admin/users', d),
  listUsers:   params  => http.get('/api/admin/users', { params }),
  getUser:     id      => http.get(`/api/admin/users/${id}`),
  updateUser:  (id, d) => http.put(`/api/admin/users/${id}`, d),
  deleteUser:  id      => http.delete(`/api/admin/users/${id}`),
  listSlas:    ()      => http.get('/api/admin/slas'),
  createSla:   d       => http.post('/api/admin/slas', d),
  updateSla:   (id, d) => http.put(`/api/admin/slas/${id}`, d),
  deleteSla:   id      => http.delete(`/api/admin/slas/${id}`),
  auditLogs:   params  => http.get('/api/admin/audit', { params }),
};

export const usersAPI = {
  // This endpoint is accessible to all authenticated users (not admin-restricted)
  // INC_MANAGER uses this to fetch RESOLVER list for incident assignment
  byRole: role => http.get(`/api/users/by-role/${role}`),
};

export const categoryAPI = {
  list:   ()  => http.get('/api/categories'),
  create: d   => http.post('/api/categories', d),
};

export const notifAPI = {
  list:        () => http.get('/api/notifications'),
  unreadCount: () => http.get('/api/notifications/unread-count'),
  markAllRead: () => http.patch('/api/notifications/mark-all-read'),
  markRead:    id => http.patch(`/api/notifications/${id}/read`),
};

export default http;
