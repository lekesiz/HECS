import { useState, useEffect } from 'react'
import { Activity, Server, Zap } from 'lucide-react'
import './App.css'

interface APIStatus {
  name?: string
  version?: string
  status?: string
  timestamp?: string
}

function App() {
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAPIStatus()
  }, [])

  const fetchAPIStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/')
      if (!response.ok) {
        throw new Error('Failed to fetch API status')
      }
      const data = await response.json()
      setApiStatus(data)
      setError(null)
    } catch (err) {
      setError('Failed to connect to backend API')
      console.error('Error fetching API status:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              HECS Control Plane
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Haguenau Edge Control System - Dashboard
          </p>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Backend Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Server className="w-8 h-8 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">
                Backend API
              </h2>
            </div>
            {loading ? (
              <div className="flex items-center text-gray-500">
                <Activity className="w-5 h-5 mr-2 animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : error ? (
              <div className="text-red-500">
                <p className="font-medium">Offline</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <div className="text-green-600">
                <p className="font-medium text-lg">● Online</p>
                <p className="text-sm text-gray-600 mt-2">
                  Version: {apiStatus?.version}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {apiStatus?.status}
                </p>
              </div>
            )}
          </div>

          {/* Devices */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-8 h-8 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Devices</h2>
            </div>
            <div className="text-gray-600">
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm mt-2">Active Devices</p>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Zap className="w-8 h-8 text-purple-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
            </div>
            <div className="text-gray-600">
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm mt-2">Pending Tasks</p>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome to HECS! 🚀
          </h2>
          <p className="text-gray-600 mb-6">
            The Haguenau Edge Control System is now running. This is a minimal
            MVP to get started.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                ✅ Backend Ready
              </h3>
              <p className="text-sm text-gray-600">
                FastAPI server is running on port 8000
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                ✅ Frontend Ready
              </h3>
              <p className="text-sm text-gray-600">
                React dashboard is running on port 3000
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                🚧 Agent Pending
              </h3>
              <p className="text-sm text-gray-600">
                Go agent code to be implemented
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-600">
          <p>
            HECS v1.0.0-alpha | Built with ❤️ by Netz Informatique
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
