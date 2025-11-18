import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialize user from localStorage on mount
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('subsentry_user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch (err) {
        console.error('Failed to parse stored user:', err)
        localStorage.removeItem('subsentry_user')
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = (userData) => {
    try {
      setUser(userData)
      localStorage.setItem('subsentry_user', JSON.stringify(userData))
      setError(null)
    } catch (err) {
      setError('Failed to login')
      console.error('Login error:', err)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('subsentry_user')
    setError(null)
  }

  const clearError = () => setError(null)

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
