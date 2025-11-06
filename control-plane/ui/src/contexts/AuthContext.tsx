import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, User, LoginCredentials, RegisterData } from '../api'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser()
          setUser(currentUser)
        } catch (err) {
          localStorage.removeItem('access_token')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null)
      setLoading(true)

      const response = await authApi.login(credentials)
      localStorage.setItem('access_token', response.access_token)

      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setError(null)
      setLoading(true)

      const newUser = await authApi.register(data)

      // Auto-login after registration
      await login({
        username: data.username,
        password: data.password,
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('access_token')
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
