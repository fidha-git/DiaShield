import api from "./api";

export const getMedicalHistory = async (patientId) => {
  const response = await api.get(`/medical-history/${patientId}`);
return response.data;
};

export const createMedicalHistory = async (data) => {
  const response = await api.post(`/medical-history/create`, data);
return response.data;
};

export const updateMedicalHistory = async (id, data) => {
  const response = await api.put(`/medical-history/update/${id}`, data);
return response.data;
};

export const deleteMedicalHistory = async (id) => {
  const response = await api.delete(`/medical-history/delete/${id}`);
return response.data;
};
