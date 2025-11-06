import apiClient from './client'

export interface Task {
  id: string
  device_id: string
  name: string
  task_type: string
  status: string
  payload: Record<string, any>
  result?: Record<string, any>
  scheduled_at?: string
  started_at?: string
  completed_at?: string
  error_message?: string
  retry_count: number
  max_retries: number
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  name: string
  task_type: string
  device_id: string
  payload?: Record<string, any>
  scheduled_at?: string
}

export interface TaskUpdate {
  status?: string
  result?: Record<string, any>
  error_message?: string
}

export interface TaskStats {
  total_tasks: number
  pending_tasks: number
  running_tasks: number
  completed_tasks: number
  failed_tasks: number
  completion_rate: number
}

export const tasksApi = {
  // List tasks
  list: async (params?: {
    skip?: number
    limit?: number
    status?: string
    device_id?: string
    task_type?: string
  }): Promise<Task[]> => {
    const response = await apiClient.get('/api/v1/tasks', { params })
    return response.data
  },

  // Get task by ID
  get: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get(`/api/v1/tasks/${taskId}`)
    return response.data
  },

  // Create task
  create: async (data: TaskCreate): Promise<Task> => {
    const response = await apiClient.post('/api/v1/tasks', data)
    return response.data
  },

  // Update task
  update: async (taskId: string, data: TaskUpdate): Promise<Task> => {
    const response = await apiClient.put(`/api/v1/tasks/${taskId}`, data)
    return response.data
  },

  // Delete task
  delete: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/tasks/${taskId}`)
  },

  // Retry task
  retry: async (taskId: string): Promise<Task> => {
    const response = await apiClient.post(`/api/v1/tasks/${taskId}/retry`)
    return response.data
  },

  // Get task statistics
  stats: async (): Promise<TaskStats> => {
    const response = await apiClient.get('/api/v1/tasks/stats/summary')
    return response.data
  },
}
