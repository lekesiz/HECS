import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { devicesApi, DeviceCreate } from '../api/devices'
import { Server, ArrowLeft, AlertCircle, Loader } from 'lucide-react'

export default function CreateDevicePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<DeviceCreate>({
    name: '',
    device_id: '',
    customer_id: '',
    hardware_id: '',
    ip_address: '',
    mac_address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Device name is required')
      return false
    }
    if (!formData.device_id.trim()) {
      setError('Device ID is required')
      return false
    }
    if (!formData.customer_id.trim()) {
      setError('Customer ID is required')
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

    // Validate MAC address format if provided
    if (formData.mac_address && formData.mac_address.trim()) {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
      if (!macRegex.test(formData.mac_address.trim())) {
        setError('Invalid MAC address format (e.g., AA:BB:CC:DD:EE:FF)')
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
      // Remove empty optional fields
      const submitData: DeviceCreate = {
        name: formData.name.trim(),
        device_id: formData.device_id.trim(),
        customer_id: formData.customer_id.trim(),
      }

      if (formData.hardware_id?.trim()) {
        submitData.hardware_id = formData.hardware_id.trim()
      }
      if (formData.ip_address?.trim()) {
        submitData.ip_address = formData.ip_address.trim()
      }
      if (formData.mac_address?.trim()) {
        submitData.mac_address = formData.mac_address.trim()
      }

      const device = await devicesApi.create(submitData)
      navigate(`/devices/${device.id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create device')
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
              to="/devices"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="flex items-center">
              <Server className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Add New Device
                </h1>
                <p className="text-sm text-gray-600">
                  Register a new edge device
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
                {/* Device Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Device Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Raspberry Pi - Office"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    A friendly name for this device
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="e.g., RPI-001"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Unique identifier for the device
                  </p>
                </div>

                {/* Customer ID */}
                <div>
                  <label
                    htmlFor="customer_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Customer ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="customer_id"
                    name="customer_id"
                    type="text"
                    value={formData.customer_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="e.g., UUID or customer code"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    The customer this device belongs to
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
                {/* Hardware ID */}
                <div>
                  <label
                    htmlFor="hardware_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hardware ID
                  </label>
                  <input
                    id="hardware_id"
                    name="hardware_id"
                    type="text"
                    value={formData.hardware_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="e.g., Serial number or hardware identifier"
                  />
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

                {/* MAC Address */}
                <div>
                  <label
                    htmlFor="mac_address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    MAC Address
                  </label>
                  <input
                    id="mac_address"
                    name="mac_address"
                    type="text"
                    value={formData.mac_address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="e.g., AA:BB:CC:DD:EE:FF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <Link
              to="/devices"
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
                  Creating...
                </>
              ) : (
                'Create Device'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
