import apiClient from './client'

export interface Customer {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  haguenau_customer_id?: string
  subscription_tier: string
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CustomerCreate {
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  haguenau_customer_id?: string
  subscription_tier?: string
}

export interface CustomerUpdate {
  name?: string
  company?: string
  email?: string
  phone?: string
  address?: string
  haguenau_customer_id?: string
  subscription_tier?: string
  is_active?: boolean
}

export interface CustomerStats {
  total_customers: number
  active_customers: number
  inactive_customers: number
}

export const customersApi = {
  // List customers
  list: async (params?: {
    skip?: number
    limit?: number
    is_active?: boolean
  }): Promise<Customer[]> => {
    const response = await apiClient.get('/api/v1/customers', { params })
    return response.data
  },

  // Get customer by ID
  get: async (customerId: string): Promise<Customer> => {
    const response = await apiClient.get(`/api/v1/customers/${customerId}`)
    return response.data
  },

  // Create customer
  create: async (data: CustomerCreate): Promise<Customer> => {
    const response = await apiClient.post('/api/v1/customers', data)
    return response.data
  },

  // Update customer
  update: async (customerId: string, data: CustomerUpdate): Promise<Customer> => {
    const response = await apiClient.put(`/api/v1/customers/${customerId}`, data)
    return response.data
  },

  // Delete customer
  delete: async (customerId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/customers/${customerId}`)
  },

  // Get customer statistics
  stats: async (): Promise<CustomerStats> => {
    const response = await apiClient.get('/api/v1/customers/stats/summary')
    return response.data
  },
}
