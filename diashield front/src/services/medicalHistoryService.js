import api from "./api";

export const getMedicalHistory = async (patientId) => {
  const response = await api.get(`/medical-history/${patientId}`);
  console.log("Medical History:", response.data);
  return response.data;
};

export const createMedicalHistory = async (data) => {
  const response = await api.post(`/medical-history/create`, data);
  console.log("Medical History:", response.data);
  return response.data;
};

export const updateMedicalHistory = async (id, data) => {
  const response = await api.put(`/medical-history/update/${id}`, data);
  console.log("Medical History:", response.data);
  return response.data;
};

export const deleteMedicalHistory = async (id) => {
  const response = await api.delete(`/medical-history/delete/${id}`);
  console.log("Medical History:", response.data);
  return response.data;
};
