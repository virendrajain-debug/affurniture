// ============================================================
// Centralized API & Authentication Utility
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

  return fetch(url, {
    ...options,
    headers,
  })
}
