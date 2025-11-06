import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { devicesApi, DeviceUpdate } from '../api/devices'
import {
  Server,
  ArrowLeft,
  AlertCircle,
  Loader,
  RefreshCw,
} from 'lucide-react'

export default function EditDevicePage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<DeviceUpdate>({
    name: '',
    status: 'offline',
    ip_address: '',
    firmware_version: '',
  })

  const [deviceName, setDeviceName] = useState('')

  useEffect(() => {
    const fetchDevice = async () => {
      if (!deviceId) return

      setLoading(true)
      setError('')
      try {
        const device = await devicesApi.get(deviceId)
        setDeviceName(device.name)
        setFormData({
          name: device.name,
          status: device.status,
          ip_address: device.ip_address || '',
          firmware_version: device.firmware_version || '',
        })
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch device')
      } finally {
        setLoading(false)
      }
    }

    fetchDevice()
  }, [deviceId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (formData.name && !formData.name.trim()) {
      setError('Device name cannot be empty')
      return false
    }

    // Validate IP address format if provided
    if (formData.ip_address && formData.ip_address.trim()) {
      const ipRegex =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipRegex.test(formData.ip_address.trim())) {
        setError('Invalid IP address format')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deviceId) return

    setError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Only send fields that have values
      const submitData: DeviceUpdate = {}

      if (formData.name?.trim()) {
        submitData.name = formData.name.trim()
      }
      if (formData.status) {
        submitData.status = formData.status
      }
      if (formData.ip_address?.trim()) {
        submitData.ip_address = formData.ip_address.trim()
      }
      if (formData.firmware_version?.trim()) {
        submitData.firmware_version = formData.firmware_version.trim()
      }

      await devicesApi.update(deviceId, submitData)
      navigate(`/devices/${deviceId}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update device')
    } finally {
      setIsSubmitting(false)
    }
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

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              to={`/devices/${deviceId}`}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="flex items-center">
              <Server className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Device
                </h1>
                <p className="text-sm text-gray-600">{deviceName}</p>
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
            {/* Device Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Device Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Raspberry Pi - Office"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="error">Error</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* IP Address */}
            <div>
              <label
                htmlFor="ip_address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                IP Address
              </label>
              <input
                id="ip_address"
                name="ip_address"
                type="text"
                value={formData.ip_address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="e.g., 192.168.1.100"
              />
            </div>

            {/* Firmware Version */}
            <div>
              <label
                htmlFor="firmware_version"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Firmware Version
              </label>
              <input
                id="firmware_version"
                name="firmware_version"
                type="text"
                value={formData.firmware_version}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., v1.2.3"
              />
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only the fields you want to update need
                to be filled. Empty fields will not be updated.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <Link
              to={`/devices/${deviceId}`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Device'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
