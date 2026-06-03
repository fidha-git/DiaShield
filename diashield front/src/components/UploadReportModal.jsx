import React, { useState } from 'react'
import healthRecordService from '../services/healthRecordService'

/**
 * Modal for uploading laboratory reports
 * Handles file selection, validation, and upload
 */
export default function UploadReportModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [reportName, setReportName] = useState('')
  const [reportType, setReportType] = useState('')
  const [reportDate, setReportDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const reportTypes = [
    'Blood Test',
    'X-Ray',
    'ECG',
    'Ultrasound',
    'CT Scan',
    'MRI',
    'Pathology Report',
    'Other',
  ]

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!file) {
      setError('Please select a file')
      return
    }

    if (!reportName.trim()) {
      setError('Please enter a report name')
      return
    }

    if (!reportType) {
      setError('Please select a report type')
      return
    }

    if (!reportDate) {
      setError('Please select a report date')
      return
    }

    setLoading(true)

    try {
      console.log('[UPLOAD_MODAL] Starting upload...')
      
      const result = await healthRecordService.uploadLabReport(
        file,
        reportName,
        reportType,
        reportDate
      )

      console.log('[UPLOAD_MODAL] Upload successful:', result)
      
      // Reset form
      setFile(null)
      setFileName('')
      setReportName('')
      setReportType('')
      setReportDate('')
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('[UPLOAD_MODAL] Upload failed:', err)
      
      let errorMessage = err.message || 'Failed to upload report'
      
      // Parse backend error responses
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail[0]?.msg || errorMessage
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setFileName('')
    setReportName('')
    setReportType('')
    setReportDate('')
    setError('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0F172A]/90 rounded-2xl shadow-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto dark:border dark:border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">file_upload</span>
            Upload Report
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-sky-200 dark:border-sky-500/30 rounded-lg p-4 hover:border-sky-400 dark:hover:border-sky-500/60 transition-colors cursor-pointer bg-sky-50/50 dark:bg-sky-900/20">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-sky-500 text-3xl">
                cloud_upload
              </span>
              <div className="text-center">
                {fileName ? (
                  <>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{fileName}</p>
                    <p className="text-xs text-slate-500 mt-1">Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      PDF, JPG, or PNG (max 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          {/* Report Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Report Name *
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Complete Blood Count"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
              disabled={loading}
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Report Type *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
              disabled={loading}
            >
              <option value="">Select a type...</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Report Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Report Date *
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                handleReset()
                onClose()
              }}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">
                    refresh
                  </span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    upload
                  </span>
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
