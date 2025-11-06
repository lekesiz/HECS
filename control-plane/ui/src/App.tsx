import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
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
        <WebSocketProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Device Management Routes */}
          <Route
            path="/devices"
            element={
              <ProtectedRoute>
                <Layout>
                  <DeviceListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateDevicePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices/:deviceId"
            element={
              <ProtectedRoute>
                <Layout>
                  <DeviceDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices/:deviceId/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditDevicePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Task Management Routes */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <TaskListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateTaskPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <ProtectedRoute>
                <Layout>
                  <TaskDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
