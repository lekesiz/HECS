import { useState, useEffect } from 'react'
import { tasksApi, Task, TaskStats } from '../api'

export function useTasks(params?: {
  status?: string
  device_id?: string
  task_type?: string
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tasksApi.list(params)
      setTasks(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [params?.status, params?.device_id, params?.task_type])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  }
}

export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tasksApi.stats()
      setStats(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch task stats')
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
