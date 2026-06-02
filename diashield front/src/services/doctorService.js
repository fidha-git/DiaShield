import API from './api';

export const getMyDoctorProfile = () => API.get('/doctor/me');

export const getDoctorById = (id) => API.get(`/doctor/${id}`);

export const updateDoctorProfile = (id, data) => API.put(`/doctor/update/${id}`, data);

export const getDoctorAppointments = (doctorId, params = {}) =>
  API.get(`/appointments/doctor/${doctorId}`, { params });

export const getDoctorDashboard = (doctorId) =>
  API.get(`/appointments/dashboard/${doctorId}`);

export const completeAppointment = (appointmentId) =>
  API.put(`/appointments/complete/${appointmentId}`);

export const getDoctorSlots = (doctorId) =>
  API.get(`/doctor/slots/${doctorId}`);

export const addDoctorSlot = (doctorId, data) =>
  API.post(`/doctor/add-slot/${doctorId}`, data);

export const updateDoctorSlot = (slotId, data) =>
  API.put(`/doctor/slot/${slotId}`, data);

export const deleteDoctorSlot = (slotId) =>
  API.delete(`/doctor/slot/${slotId}`);

export const getClinicalNote = (appointmentId) =>
  API.get(`/doctor-notes/${appointmentId}`);

export const addClinicalNote = (appointmentId, data) =>
  API.post(`/doctor-notes/add/${appointmentId}`, data);

export const updateClinicalNote = (appointmentId, data) =>
  API.put(`/doctor-notes/update/${appointmentId}`, data);

export const deleteClinicalNote = (appointmentId) =>
  API.delete(`/doctor-notes/delete/${appointmentId}`);

export const getDoctorPrescriptions = () =>
  API.get('/prescriptions/doctor/all');

export const getPrescription = (appointmentId) =>
  API.get(`/prescriptions/${appointmentId}`);

export const addPrescription = (appointmentId, data) =>
  API.post(`/prescriptions/add/${appointmentId}`, data);

export const updatePrescription = (appointmentId, data) =>
  API.put(`/prescriptions/update/${appointmentId}`, data);

export const deletePrescription = (appointmentId) =>
  API.delete(`/prescriptions/delete/${appointmentId}`);
