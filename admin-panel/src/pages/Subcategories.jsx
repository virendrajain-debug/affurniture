import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Subcategories() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/dashboard/categories', { replace: true }) }, [navigate])
  return null
}

export default Subcategories
