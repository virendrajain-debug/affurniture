// ============================================================
// Centralized API & Authentication Utility with 401 Interceptor
// ============================================================
import { API_BASE } from '../config'

export const getAuthToken = (explicitToken) => {
  const rawToken =
    explicitToken ||
    localStorage.getItem('token') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('af_admin_token') ||
    ''

  if (typeof rawToken === 'string') {
    const cleanToken = rawToken.replace(/^"|"$/g, '').trim()
    if (cleanToken === 'undefined' || cleanToken === 'null' || !cleanToken) {
      return ''
    }
    return cleanToken
  }
  return ''
}

export const clearAdminSession = () => {
  localStorage.removeItem('af_admin_token')
  localStorage.removeItem('token')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('admin_user')
  localStorage.removeItem('adminAvatar')
  localStorage.removeItem('adminProfileImage')
  localStorage.removeItem('adminName')
  localStorage.removeItem('adminEmail')
  localStorage.removeItem('site_logo')
  localStorage.removeItem('af_reset_email')
  localStorage.removeItem('af_reset_token')
  window.dispatchEvent(new Event('admin-logout'))
}

export const getAuthHeaders = (explicitToken, isJson = true) => {
  const token = getAuthToken(explicitToken)
  const headers = {}
  if (isJson) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export const apiFetch = async (endpoint, options = {}, explicitToken) => {
  const token = getAuthToken(explicitToken)
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const headers = {
    ...(options.headers || {}),
  }

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Global 401 Interceptor: catch unauthorized/expired session
  if (response.status === 401) {
    console.warn('Session expired or unauthorized request. Logging out...')
    clearAdminSession()
  }

  return response
}
