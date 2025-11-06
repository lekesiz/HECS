import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { customersApi, CustomerUpdate } from '../api/customers'
import { Users, ArrowLeft, AlertCircle, Loader, RefreshCw } from 'lucide-react'

export default function EditCustomerPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<CustomerUpdate>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    haguenau_customer_id: '',
    subscription_tier: 'basic',
    is_active: true,
  })

  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return

      setLoading(true)
      setError('')
      try {
        const customer = await customersApi.get(customerId)
        setCustomerName(customer.name)
        setFormData({
          name: customer.name,
          company: customer.company || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          haguenau_customer_id: customer.haguenau_customer_id || '',
          subscription_tier: customer.subscription_tier,
          is_active: customer.is_active,
        })
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch customer')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const validateForm = (): boolean => {
    if (formData.name && !formData.name.trim()) {
      setError('Customer name cannot be empty')
      return false
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setError('Invalid email format')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) return

    setError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData: CustomerUpdate = {}

      if (formData.name?.trim()) submitData.name = formData.name.trim()
      if (formData.company?.trim()) submitData.company = formData.company.trim()
      if (formData.email?.trim()) submitData.email = formData.email.trim()
      if (formData.phone?.trim()) submitData.phone = formData.phone.trim()
      if (formData.address?.trim()) submitData.address = formData.address.trim()
      if (formData.haguenau_customer_id?.trim())
        submitData.haguenau_customer_id = formData.haguenau_customer_id.trim()
      if (formData.subscription_tier)
        submitData.subscription_tier = formData.subscription_tier
      if (formData.is_active !== undefined)
        submitData.is_active = formData.is_active

      await customersApi.update(customerId, submitData)
      navigate(`/customers/${customerId}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update customer')
    } finally {
      setIsSubmitting(false)
    }
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

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              to={`/customers/${customerId}`}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
                <p className="text-sm text-gray-600">{customerName}</p>
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
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Customer Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Acme Corp"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., +33 1 23 45 67 89"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 123 Main St, Paris, France"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="haguenau_customer_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Haguenau Customer ID
                  </label>
                  <input
                    id="haguenau_customer_id"
                    name="haguenau_customer_id"
                    type="text"
                    value={formData.haguenau_customer_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                    placeholder="e.g., HAGU-12345"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subscription_tier"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subscription Tier
                  </label>
                  <select
                    id="subscription_tier"
                    name="subscription_tier"
                    value={formData.subscription_tier}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Customer is active
                  </label>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> Only the fields you want to update need to
                be filled. Empty fields will not be updated.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <Link
              to={`/customers/${customerId}`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
