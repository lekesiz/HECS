import { useEffect } from 'react'
import { useWebSocket } from '../contexts/WebSocketContext'
import { Task } from '../api/tasks'

interface TaskUpdateCallback {
  (task: Task): void
}

export function useTaskUpdates(callback: TaskUpdateCallback) {
  const { subscribe } = useWebSocket()

  useEffect(() => {
    const unsubscribe = subscribe('task_update', (data: Task) => {
      callback(data)
    })

    return () => {
      unsubscribe()
    }
  }, [callback, subscribe])
}
