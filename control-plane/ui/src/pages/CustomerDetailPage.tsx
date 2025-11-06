import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { customersApi, Customer } from '../api/customers'
import {
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  Award,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchCustomer = async () => {
    if (!customerId) return

    setLoading(true)
    setError('')
    try {
      const data = await customersApi.get(customerId)
      setCustomer(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch customer')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomer()
  }, [customerId])

  const handleDelete = async () => {
    if (!customerId) return

    try {
      await customersApi.delete(customerId)
      navigate('/customers')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete customer')
      setShowDeleteModal(false)
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'text-green-600 bg-green-100'
      : 'text-gray-600 bg-gray-100'
  }

  const getTierColor = (tier: string) => {
    const colors = {
      basic: 'text-blue-600 bg-blue-100',
      professional: 'text-purple-600 bg-purple-100',
      enterprise: 'text-yellow-600 bg-yellow-100',
    }
    return colors[tier as keyof typeof colors] || colors.basic
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading customer...</p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Customer not found'}</p>
          <Link
            to="/customers"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Customers
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
                to="/customers"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.name}
                </h1>
                <p className="text-sm text-gray-600">{customer.company || 'No company'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/customers/${customerId}/edit`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center px-4 py-2 rounded-lg ${getStatusColor(
                    customer.is_active
                  )}`}
                >
                  {customer.is_active ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Inactive</span>
                    </>
                  )}
                </div>

                <div
                  className={`flex items-center px-4 py-2 rounded-lg ${getTierColor(
                    customer.subscription_tier
                  )}`}
                >
                  <Award className="w-5 h-5 mr-2" />
                  <span className="font-medium capitalize">
                    {customer.subscription_tier}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.email && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </div>
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-gray-900 hover:text-green-600"
                    >
                      {customer.email}
                    </a>
                  </div>
                )}

                {customer.phone && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </div>
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-gray-900 hover:text-green-600"
                    >
                      {customer.phone}
                    </a>
                  </div>
                )}

                {customer.company && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Building className="w-4 h-4 mr-2" />
                      Company
                    </div>
                    <p className="text-gray-900">{customer.company}</p>
                  </div>
                )}

                {customer.address && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </div>
                    <p className="text-gray-900">{customer.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {customer.haguenau_customer_id && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h2>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Haguenau Customer ID
                  </div>
                  <p className="text-gray-900 font-mono">
                    {customer.haguenau_customer_id}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            {customer.metadata && Object.keys(customer.metadata).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Metadata
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 overflow-x-auto">
                    {JSON.stringify(customer.metadata, null, 2)}
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
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </div>
                  <p className="text-gray-900 text-sm">
                    {formatDate(customer.created_at)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last Updated
                  </div>
                  <p className="text-gray-900 text-sm">
                    {formatDate(customer.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Info
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer ID</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {customer.id.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscription</span>
                  <span className="text-gray-900 capitalize">
                    {customer.subscription_tier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={customer.is_active ? 'text-green-600' : 'text-gray-600'}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </span>
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
              Delete Customer
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete customer{' '}
              <span className="font-semibold">{customer.name}</span>? This action
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
