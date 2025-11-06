import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DeviceListPage from './pages/DeviceListPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import CreateDevicePage from './pages/CreateDevicePage'
import EditDevicePage from './pages/EditDevicePage'
import TaskListPage from './pages/TaskListPage'
import TaskDetailPage from './pages/TaskDetailPage'
import CreateTaskPage from './pages/CreateTaskPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Device Management Routes */}
          <Route
            path="/devices"
            element={
              <ProtectedRoute>
                <DeviceListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices/new"
            element={
              <ProtectedRoute>
                <CreateDevicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices/:deviceId"
            element={
              <ProtectedRoute>
                <DeviceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices/:deviceId/edit"
            element={
              <ProtectedRoute>
                <EditDevicePage />
              </ProtectedRoute>
            }
          />

          {/* Task Management Routes */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TaskListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <ProtectedRoute>
                <CreateTaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <ProtectedRoute>
                <TaskDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
