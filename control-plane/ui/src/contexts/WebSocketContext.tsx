import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'

interface WebSocketMessage {
  type: 'device_update' | 'task_update' | 'notification'
  data: any
  timestamp: string
}

interface WebSocketContextType {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (message: any) => void
  subscribe: (type: string, callback: (data: any) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [subscribers, setSubscribers] = useState<
    Map<string, Set<(data: any) => void>>
  >(new Map())
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  const connect = useCallback(() => {
    try {
      // WebSocket URL - adjust based on your backend
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`

      console.log('Connecting to WebSocket:', wsUrl)
      const websocket = new WebSocket(wsUrl)

      websocket.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setReconnectAttempt(0)

        // Authenticate with token
        const token = localStorage.getItem('access_token')
        if (token) {
          websocket.send(
            JSON.stringify({
              type: 'auth',
              token: token,
            })
          )
        }
      }

      websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('WebSocket message received:', message)
          setLastMessage(message)

          // Notify subscribers
          const typeSubscribers = subscribers.get(message.type)
          if (typeSubscribers) {
            typeSubscribers.forEach((callback) => callback(message.data))
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      websocket.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setWs(null)

        // Auto-reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000)
        console.log(`Reconnecting in ${delay}ms...`)
        setTimeout(() => {
          setReconnectAttempt((prev) => prev + 1)
          connect()
        }, delay)
      }

      setWs(websocket)
    } catch (error) {
      console.error('Error creating WebSocket:', error)
    }
  }, [reconnectAttempt])

  useEffect(() => {
    connect()

    return () => {
      if (ws) {
        console.log('Closing WebSocket')
        ws.close()
      }
    }
  }, [])

  const sendMessage = useCallback(
    (message: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      } else {
        console.warn('WebSocket is not connected')
      }
    },
    [ws]
  )

  const subscribe = useCallback(
    (type: string, callback: (data: any) => void) => {
      setSubscribers((prev) => {
        const newSubscribers = new Map(prev)
        if (!newSubscribers.has(type)) {
          newSubscribers.set(type, new Set())
        }
        newSubscribers.get(type)!.add(callback)
        return newSubscribers
      })

      // Return unsubscribe function
      return () => {
        setSubscribers((prev) => {
          const newSubscribers = new Map(prev)
          const typeSubscribers = newSubscribers.get(type)
          if (typeSubscribers) {
            typeSubscribers.delete(callback)
            if (typeSubscribers.size === 0) {
              newSubscribers.delete(type)
            }
          }
          return newSubscribers
        })
      }
    },
    []
  )

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        lastMessage,
        sendMessage,
        subscribe,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
