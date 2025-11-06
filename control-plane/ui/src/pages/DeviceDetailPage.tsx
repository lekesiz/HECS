import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { devicesApi, Device } from '../api/devices'
import {
  Server,
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  Activity,
  Wifi,
  HardDrive,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react'

export default function DeviceDetailPage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()
  const [device, setDevice] = useState<Device | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchDevice = async () => {
    if (!deviceId) return

    setLoading(true)
    setError('')
    try {
      const data = await devicesApi.get(deviceId)
      setDevice(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch device')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevice()
  }, [deviceId])

  const handleDelete = async () => {
    if (!deviceId) return

    try {
      await devicesApi.delete(deviceId)
      navigate('/devices')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete device')
      setShowDeleteModal(false)
    }
  }

  const handleHeartbeat = async () => {
    if (!deviceId) return

    try {
      const updated = await devicesApi.heartbeat(deviceId)
      setDevice(updated)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send heartbeat')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      online: 'text-green-600 bg-green-100',
      offline: 'text-gray-600 bg-gray-100',
      error: 'text-red-600 bg-red-100',
      maintenance: 'text-yellow-600 bg-yellow-100',
    }
    return colors[status as keyof typeof colors] || colors.offline
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading device...</p>
        </div>
      </div>
    )
  }

  if (error || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Device not found'}</p>
          <Link
            to="/devices"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Devices
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
                to="/devices"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {device.name}
                </h1>
                <p className="text-sm text-gray-600">{device.device_id}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleHeartbeat}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Activity className="w-5 h-5 mr-2" />
                Heartbeat
              </button>
              <Link
                to={`/devices/${deviceId}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit
              </Link>
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
                    device.status
                  )}`}
                >
                  <Activity className="w-5 h-5 mr-2" />
                  <span className="font-medium capitalize">
                    {device.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Device Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Server className="w-4 h-4 mr-2" />
                    Device ID
                  </div>
                  <p className="text-gray-900 font-mono">{device.device_id}</p>
                </div>

                {device.hardware_id && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <HardDrive className="w-4 h-4 mr-2" />
                      Hardware ID
                    </div>
                    <p className="text-gray-900 font-mono">
                      {device.hardware_id}
                    </p>
                  </div>
                )}

                {device.ip_address && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Wifi className="w-4 h-4 mr-2" />
                      IP Address
                    </div>
                    <p className="text-gray-900 font-mono">
                      {device.ip_address}
                    </p>
                  </div>
                )}

                {device.mac_address && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Wifi className="w-4 h-4 mr-2" />
                      MAC Address
                    </div>
                    <p className="text-gray-900 font-mono">
                      {device.mac_address}
                    </p>
                  </div>
                )}

                {device.firmware_version && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <HardDrive className="w-4 h-4 mr-2" />
                      Firmware Version
                    </div>
                    <p className="text-gray-900">{device.firmware_version}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            {device.metadata && Object.keys(device.metadata).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Metadata
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 overflow-x-auto">
                    {JSON.stringify(device.metadata, null, 2)}
                  </pre>
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
                    <Clock className="w-4 h-4 mr-2" />
                    Last Seen
                  </div>
                  <p className="text-gray-900">
                    {formatDate(device.last_seen)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </div>
                  <p className="text-gray-900">
                    {formatDate(device.created_at)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last Updated
                  </div>
                  <p className="text-gray-900">
                    {formatDate(device.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer
              </h2>
              <p className="text-gray-900 font-mono text-sm">
                {device.customer_id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Device
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete device{' '}
              <span className="font-semibold">{device.name}</span>? This action
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
