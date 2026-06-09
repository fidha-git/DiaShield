import API from './api';

export const fetchAdminAnalytics = () => API.get('/admin/analytics');

export const fetchAdminUsers = () => API.get('/admin/users');

export const fetchAdminDoctors = () => API.get('/admin/doctors');

export const fetchAdminPredictions = () => API.get('/admin/predictions');

export const fetchAdminAppointments = () => API.get('/admin/appointments');

export const getDoctors = () => API.get('/doctor/all');

export const getDoctorById = (id) => API.get(`/doctor/${id}`);

export const createDoctor = (data) => API.post('/doctor/create', data);

export const updateDoctor = (id, data) => API.put(`/doctor/update/${id}`, data);

export const deleteDoctor = (id) => API.delete(`/doctor/delete/${id}`);

export const fetchAdminActivityLogs = () => API.get('/admin/activity-logs');

export const blockUser = (userId) => API.put(`/admin/block-user/${userId}`);

export const unblockUser = (userId) => API.put(`/admin/unblock-user/${userId}`);

export const deleteUser = (userId) => API.delete(`/admin/delete-user/${userId}`);

export const getSettings = () => API.get("/admin/settings");

export const updateSettings = (data) => API.put("/admin/settings", data);
