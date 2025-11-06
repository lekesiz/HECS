import { useState, useEffect } from 'react'
import { devicesApi, Device, DeviceStats } from '../api'

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = async (params?: {
    skip?: number
    limit?: number
    status?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const data = await devicesApi.list(params)
      setDevices(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  return {
    devices,
    loading,
    error,
    refetch: fetchDevices,
  }
}

export function useDeviceStats() {
  const [stats, setStats] = useState<DeviceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await devicesApi.stats()
      setStats(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch device stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
