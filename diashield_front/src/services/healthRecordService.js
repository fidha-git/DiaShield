/**
 * Health Record Service
 * Handles API calls for health records, lab reports, and medications
 */

import API from './api';

/**
 * Get all laboratory reports for the logged-in patient
 * @returns {Promise} Array of laboratory reports
 */
export const getLabReports = async () => {
  try {
    const response = await API.get('/health-records/labs');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    throw error;
  }
};

/**
 * Get a specific laboratory report by ID
 * @param {number} reportId - The ID of the report
 * @returns {Promise} Laboratory report data
 */
export const getLabReportById = async (reportId) => {
  try {
    const response = await API.get(`/health-records/labs/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lab report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Create a new laboratory report
 * @param {Object} reportData - Report data (report_name, report_type, report_date, file_url, ordered_by)
 * @returns {Promise} Created report data
 */
export const createLabReport = async (reportData) => {
  try {
    const response = await API.post('/health-records/labs', reportData);
    return response.data;
  } catch (error) {
    console.error('Error creating lab report:', error);
    throw error;
  }
};

/**
 * Update an existing laboratory report
 * @param {number} reportId - The ID of the report
 * @param {Object} reportData - Updated report data
 * @returns {Promise} Updated report data
 */
export const updateLabReport = async (reportId, reportData) => {
  try {
    const response = await API.put(`/health-records/labs/${reportId}`, reportData);
    return response.data;
  } catch (error) {
    console.error(`Error updating lab report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Delete a laboratory report
 * @param {number} reportId - The ID of the report
 * @returns {Promise} Deletion confirmation
 */
export const deleteLabReport = async (reportId) => {
  try {
    const response = await API.delete(`/health-records/labs/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting lab report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Get all medications/prescriptions for the logged-in patient
 * @returns {Promise} Array of prescriptions/medications
 */
export const getMedications = async () => {
  try {
    console.log('[HEALTH_RECORD_SERVICE] Fetching medications from /prescriptions/patient/all');
    const response = await API.get('/prescriptions/patient/all');
    console.log('[HEALTH_RECORD_SERVICE] Medications API Response:', response);
    console.log('[HEALTH_RECORD_SERVICE] Response data:', response.data);
    console.log('[HEALTH_RECORD_SERVICE] Response data type:', typeof response.data);
    console.log('[HEALTH_RECORD_SERVICE] Is array:', Array.isArray(response.data));
    const data = response.data || [];
    console.log('[HEALTH_RECORD_SERVICE] Returning medications:', data);
    return data;
  } catch (error) {
    console.error('[HEALTH_RECORD_SERVICE] Error fetching medications:', error);
    console.error('[HEALTH_RECORD_SERVICE] Error status:', error.response?.status);
    console.error('[HEALTH_RECORD_SERVICE] Error data:', error.response?.data);
    console.error('[HEALTH_RECORD_SERVICE] Error message:', error.message);
    throw error;
  }
};

/**
 * Download a laboratory report file
 * @param {string} fileUrl - The URL/path of the file to download
 * @param {string} fileName - The name of the file for download
 */
export const downloadLabReport = async (fileUrl, fileName = 'report.pdf') => {
  try {
    const response = await API.get(fileUrl, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading lab report:', error);
    throw error;
  }
};

/**
 * Upload a laboratory report with file
 * @param {File} file - The file to upload (PDF, JPG, PNG)
 * @param {string} reportName - Name of the report
 * @param {string} reportType - Type of report (e.g., "Blood Test", "X-Ray")
 * @param {string} reportDate - Date of the report (ISO format: YYYY-MM-DD)
 * @returns {Promise} Created report data
 */
export const uploadLabReport = async (file, reportName, reportType, reportDate) => {
  try {
    console.log('[HEALTH_RECORD_SERVICE] Uploading lab report:', {
      fileName: file.name,
      fileSize: file.size,
      reportName,
      reportType,
      reportDate,
    });

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error(`File too large. Maximum size is 10MB (received ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Validate file type
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: PDF, JPG, PNG (received ${file.type})`);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('report_name', reportName);
    formData.append('report_type', reportType);
    formData.append('report_date', reportDate);

    console.log('[HEALTH_RECORD_SERVICE] Sending upload request...');
    
    const response = await API.post('/health-records/upload-report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('[HEALTH_RECORD_SERVICE] Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('[HEALTH_RECORD_SERVICE] Error uploading lab report:', error);
    console.error('[HEALTH_RECORD_SERVICE] Error response:', error.response?.data);
    throw error;
  }
};

export default {
  getLabReports,
  getLabReportById,
  createLabReport,
  updateLabReport,
  deleteLabReport,
  getMedications,
  downloadLabReport,
  uploadLabReport,
};
