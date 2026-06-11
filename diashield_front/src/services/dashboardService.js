import API from './api';

export const fetchPatientProfile = async () => {
  const res = await API.get('/patient/me');
  return res.data;
};

export const fetchDashboardStats = async () => {
  const res = await API.get('/patient/dashboard');
  return res.data;
};


