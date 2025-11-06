import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { tasksApi, TaskCreate } from '../api/tasks'
import { Zap, ArrowLeft, AlertCircle, Loader } from 'lucide-react'

export default function CreateTaskPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<TaskCreate>({
    name: '',
    task_type: '',
    device_id: '',
    payload: {},
    scheduled_at: '',
  })

  const [payloadJson, setPayloadJson] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPayloadJson(e.target.value)
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Task name is required')
      return false
    }
    if (!formData.task_type.trim()) {
      setError('Task type is required')
      return false
    }
    if (!formData.device_id.trim()) {
      setError('Device ID is required')
      return false
    }

    // Validate JSON payload if provided
    if (payloadJson.trim()) {
      try {
        JSON.parse(payloadJson)
      } catch (e) {
        setError('Invalid JSON format in payload')
        return false
      }
    }

    // Validate scheduled date if provided
    if (formData.scheduled_at) {
      const scheduledDate = new Date(formData.scheduled_at)
      if (isNaN(scheduledDate.getTime())) {
        setError('Invalid scheduled date format')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData: TaskCreate = {
        name: formData.name.trim(),
        task_type: formData.task_type.trim(),
        device_id: formData.device_id.trim(),
      }

      // Parse and add payload if provided
      if (payloadJson.trim()) {
        submitData.payload = JSON.parse(payloadJson)
      }

      // Add scheduled_at if provided
      if (formData.scheduled_at) {
        submitData.scheduled_at = new Date(formData.scheduled_at).toISOString()
      }

      const task = await tasksApi.create(submitData)
      navigate(`/tasks/${task.id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              to="/tasks"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Task
                </h1>
                <p className="text-sm text-gray-600">
                  Schedule a new task for execution
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Required Fields Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Required Information
              </h2>
              <div className="space-y-4">
                {/* Task Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Task Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Update firmware"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    A descriptive name for this task
                  </p>
                </div>

                {/* Task Type */}
                <div>
                  <label
                    htmlFor="task_type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Task Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="task_type"
                    name="task_type"
                    value={formData.task_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select task type...</option>
                    <option value="firmware_update">Firmware Update</option>
                    <option value="config_update">Configuration Update</option>
                    <option value="data_collection">Data Collection</option>
                    <option value="system_restart">System Restart</option>
                    <option value="health_check">Health Check</option>
                    <option value="script_execution">Script Execution</option>
                    <option value="custom">Custom</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    The type of task to execute
                  </p>
                </div>

                {/* Device ID */}
                <div>
                  <label
                    htmlFor="device_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Device ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="device_id"
                    name="device_id"
                    type="text"
                    value={formData.device_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                    placeholder="e.g., UUID or device identifier"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    The device that will execute this task
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Optional Information
              </h2>
              <div className="space-y-4">
                {/* Scheduled At */}
                <div>
                  <label
                    htmlFor="scheduled_at"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Schedule For
                  </label>
                  <input
                    id="scheduled_at"
                    name="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to execute immediately
                  </p>
                </div>

                {/* Payload */}
                <div>
                  <label
                    htmlFor="payload"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Payload (JSON)
                  </label>
                  <textarea
                    id="payload"
                    name="payload"
                    value={payloadJson}
                    onChange={handlePayloadChange}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder={`{\n  "key": "value",\n  "parameter": "data"\n}`}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Task-specific configuration in JSON format
                  </p>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Note:</strong> Tasks will be queued and executed by the
                target device's agent. Make sure the device is online and
                properly configured.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <Link
              to="/tasks"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
