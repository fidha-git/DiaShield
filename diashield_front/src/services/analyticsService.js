import API from './api';

export const fetchPatientProfile = async () => {
  const res = await API.get('/patient/me');
  return res.data;
};

export const fetchDashboardStats = async () => {
  const res = await API.get('/patient/dashboard');
  return res.data;
};

export const fetchMonthlyAnalytics = async () => {
  const res = await API.get('/analytics/monthly');
  // New shape: { monthly_analytics: [...] }
  return res.data.monthly_analytics || [];
};

