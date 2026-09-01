import { Navigate, Outlet } from 'react-router-dom'
import { getAuthToken } from '../utils/api'

function ProtectedRoute({ token, children }) {
  const activeToken = getAuthToken(token)

  if (!activeToken) {
    return <Navigate to="/" replace />
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute;
