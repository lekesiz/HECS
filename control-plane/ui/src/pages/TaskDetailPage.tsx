import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { tasksApi, Task } from '../api/tasks'
import {
  Zap,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Server,
  RotateCw,
  PlayCircle,
} from 'lucide-react'

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchTask = async () => {
    if (!taskId) return

    setLoading(true)
    setError('')
    try {
      const data = await tasksApi.get(taskId)
      setTask(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch task')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTask()
  }, [taskId])

  const handleDelete = async () => {
    if (!taskId) return

    try {
      await tasksApi.delete(taskId)
      navigate('/tasks')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete task')
      setShowDeleteModal(false)
    }
  }

  const handleRetry = async () => {
    if (!taskId) return

    try {
      const updated = await tasksApi.retry(taskId)
      setTask(updated)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to retry task')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      running: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      running: PlayCircle,
      completed: CheckCircle,
      failed: XCircle,
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    return <Icon className="w-5 h-5 mr-2" />
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return '-'
    const duration = new Date(end).getTime() - new Date(start).getTime()
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Task not found'}</p>
          <Link
            to="/tasks"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/tasks"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {task.name}
                </h1>
                <p className="text-sm text-gray-600">{task.task_type}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {task.status === 'failed' &&
                task.retry_count < task.max_retries && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RotateCw className="w-5 h-5 mr-2" />
                    Retry
                  </button>
                )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Status
              </h2>
              <div className="flex items-center">
                <div
                  className={`flex items-center px-4 py-2 rounded-lg ${getStatusColor(
                    task.status
                  )}`}
                >
                  {getStatusIcon(task.status)}
                  <span className="font-medium capitalize">{task.status}</span>
                </div>
              </div>
            </div>

            {/* Task Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Task Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Zap className="w-4 h-4 mr-2" />
                    Task Type
                  </div>
                  <p className="text-gray-900">{task.task_type}</p>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Server className="w-4 h-4 mr-2" />
                    Device ID
                  </div>
                  <p className="text-gray-900 font-mono text-sm">
                    {task.device_id}
                  </p>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Retries
                  </div>
                  <p className="text-gray-900">
                    {task.retry_count} / {task.max_retries}
                  </p>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration
                  </div>
                  <p className="text-gray-900">
                    {calculateDuration(task.started_at, task.completed_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payload */}
            {task.payload && Object.keys(task.payload).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payload
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 overflow-x-auto">
                    {JSON.stringify(task.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Result */}
            {task.result && Object.keys(task.result).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Result
                </h2>
                <div className="bg-green-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 overflow-x-auto">
                    {JSON.stringify(task.result, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Error Message */}
            {task.error_message && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Error Message
                </h2>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-mono">
                    {task.error_message}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </div>
                  <p className="text-gray-900 text-sm">
                    {formatDate(task.created_at)}
                  </p>
                </div>

                {task.scheduled_at && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      Scheduled
                    </div>
                    <p className="text-gray-900 text-sm">
                      {formatDate(task.scheduled_at)}
                    </p>
                  </div>
                )}

                {task.started_at && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Started
                    </div>
                    <p className="text-gray-900 text-sm">
                      {formatDate(task.started_at)}
                    </p>
                  </div>
                )}

                {task.completed_at && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      {task.status === 'completed' ? 'Completed' : 'Failed'}
                    </div>
                    <p className="text-gray-900 text-sm">
                      {formatDate(task.completed_at)}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last Updated
                  </div>
                  <p className="text-gray-900 text-sm">
                    {formatDate(task.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Task
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete task{' '}
              <span className="font-semibold">{task.name}</span>? This action
              cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
