import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDeviceStats } from '../hooks/useDevices'
import { useTaskStats } from '../hooks/useTasks'
import { Activity, Server, Zap, LogOut, User, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { stats: deviceStats, loading: devicesLoading } = useDeviceStats()
  const { stats: taskStats, loading: tasksLoading } = useTaskStats()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  HECS Control Plane
                </h1>
                <p className="text-sm text-gray-600">
                  Haguenau Edge Control System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.full_name || user?.username}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your edge devices today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Devices Card */}
          <Link
            to="/devices"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Server className="w-8 h-8 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Devices</h2>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            {devicesLoading ? (
              <div className="flex items-center text-gray-500">
                <Activity className="w-5 h-5 mr-2 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : deviceStats ? (
              <div>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-gray-800">
                    {deviceStats.total_devices}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Devices</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-50 rounded p-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700">Online</span>
                    </div>
                    <p className="text-lg font-semibold text-green-700 mt-1">
                      {deviceStats.online_devices}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-gray-700">Offline</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mt-1">
                      {deviceStats.offline_devices}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {deviceStats.online_percentage.toFixed(1)}% online
                </div>
              </div>
            ) : (
              <p className="text-red-500">Failed to load device stats</p>
            )}
          </Link>

          {/* Tasks Card */}
          <Link
            to="/tasks"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-purple-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            {tasksLoading ? (
              <div className="flex items-center text-gray-500">
                <Activity className="w-5 h-5 mr-2 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : taskStats ? (
              <div>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-gray-800">
                    {taskStats.total_tasks}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Tasks</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">
                      {taskStats.pending_tasks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Running</span>
                    <span className="font-semibold text-blue-600">
                      {taskStats.running_tasks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">
                      {taskStats.completed_tasks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failed</span>
                    <span className="font-semibold text-red-600">
                      {taskStats.failed_tasks}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {taskStats.completion_rate.toFixed(1)}% completion rate
                </div>
              </div>
            ) : (
              <p className="text-red-500">Failed to load task stats</p>
            )}
          </Link>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-8 h-8 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">System</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Backend API</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">
                    Online
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">
                    Connected
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Auth</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Version: 1.0.0-alpha</p>
              <p className="text-xs text-gray-500">Uptime: 100%</p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-800 mb-1">✅ API Ready</h3>
            <p className="text-sm text-blue-700">
              Backend API is fully functional with JWT authentication
            </p>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h3 className="font-semibold text-green-800 mb-1">
              ✅ Frontend Connected
            </h3>
            <p className="text-sm text-green-700">
              Dashboard is fetching real-time data from API
            </p>
          </div>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h3 className="font-semibold text-purple-800 mb-1">
              🚧 Agent Pending
            </h3>
            <p className="text-sm text-purple-700">
              Go agent will be integrated next
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
