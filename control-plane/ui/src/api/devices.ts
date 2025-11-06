import apiClient from './client'

export interface Device {
  id: string
  name: string
  device_id: string
  hardware_id?: string
  customer_id: string
  status: string
  ip_address?: string
  mac_address?: string
  firmware_version?: string
  last_seen?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DeviceCreate {
  name: string
  device_id: string
  customer_id: string
  hardware_id?: string
  ip_address?: string
  mac_address?: string
}

export interface DeviceUpdate {
  name?: string
  status?: string
  ip_address?: string
  firmware_version?: string
  metadata?: Record<string, any>
}

export interface DeviceStats {
  total_devices: number
  online_devices: number
  offline_devices: number
  online_percentage: number
}

export const devicesApi = {
  // List devices
  list: async (params?: {
    skip?: number
    limit?: number
    status?: string
    customer_id?: string
  }): Promise<Device[]> => {
    const response = await apiClient.get('/api/v1/devices', { params })
    return response.data
  },

  // Get device by ID
  get: async (deviceId: string): Promise<Device> => {
    const response = await apiClient.get(`/api/v1/devices/${deviceId}`)
    return response.data
  },

  // Create device
  create: async (data: DeviceCreate): Promise<Device> => {
    const response = await apiClient.post('/api/v1/devices', data)
    return response.data
  },

  // Update device
  update: async (deviceId: string, data: DeviceUpdate): Promise<Device> => {
    const response = await apiClient.put(`/api/v1/devices/${deviceId}`, data)
    return response.data
  },

  // Delete device
  delete: async (deviceId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/devices/${deviceId}`)
  },

  // Device heartbeat
  heartbeat: async (deviceId: string): Promise<Device> => {
    const response = await apiClient.post(`/api/v1/devices/${deviceId}/heartbeat`)
    return response.data
  },

  // Get device statistics
  stats: async (): Promise<DeviceStats> => {
    const response = await apiClient.get('/api/v1/devices/stats/summary')
    return response.data
  },
}
