import { useWebSocket } from '../contexts/WebSocketContext'
import { Wifi, WifiOff } from 'lucide-react'

export default function WebSocketStatus() {
  const { isConnected } = useWebSocket()

  return (
    <div className="flex items-center">
      {isConnected ? (
        <div
          className="flex items-center text-xs text-green-600"
          title="Real-time updates active"
        >
          <Wifi className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Live</span>
        </div>
      ) : (
        <div
          className="flex items-center text-xs text-gray-400"
          title="Reconnecting..."
        >
          <WifiOff className="w-4 h-4 mr-1 animate-pulse" />
          <span className="hidden sm:inline">Connecting...</span>
        </div>
      )}
    </div>
  )
}
