import { useEffect } from 'react'
import { useWebSocket } from '../contexts/WebSocketContext'
import { Device } from '../api/devices'

interface DeviceUpdateCallback {
  (device: Device): void
}

export function useDeviceUpdates(callback: DeviceUpdateCallback) {
  const { subscribe } = useWebSocket()

  useEffect(() => {
    const unsubscribe = subscribe('device_update', (data: Device) => {
      callback(data)
    })

    return () => {
      unsubscribe()
    }
  }, [callback, subscribe])
}
