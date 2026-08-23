import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'

function Header({ onMenuToggle, profileImage, token }) {
  const navigate = useNavigate()
  const [notifCount, setNotifCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])

  let userEmail = 'admin@gmail.com'
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userEmail = payload.email || userEmail
    }
  } catch {}

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotifCount(data.total || 0)
      }
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleBellClick = async () => {
    if (!showNotif) {
      try {
        const res = await fetch(`${API_BASE}/api/enquiries?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.slice(0, 5))
        }
      } catch {}
    }
    setShowNotif(!showNotif)
  }

  const handleNotifClick = (enq) => {
    setShowNotif(false)
    navigate('/dashboard/active-enquiry')
  }

  const markAsRead = async () => {
    try {
      await fetch(`${API_BASE}/api/enquiries/mark-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifCount(0)
      setShowNotif(false)
    } catch {}
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="header-title">Admin Panel</h1>
      </div>

      <div className="header-right">
        <div className="notif-wrapper">
          <button className="notif-bell" onClick={handleBellClick} title="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
          </button>

          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                {notifCount > 0 && <button onClick={markAsRead}>Mark all read</button>}
              </div>
              {notifications.length === 0 ? (
                <div className="notif-empty">No new notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="notif-item" onClick={() => handleNotifClick(n)}>
                    <div className="notif-item-avatar">{n.name?.charAt(0)?.toUpperCase()}</div>
                    <div className="notif-item-info">
                      <strong>{n.name}</strong>
                      <p>{n.product_name ? `Enquiry about ${n.product_name}` : 'New enquiry'}</p>
                      <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
              {notifications.length > 0 && (
                <div className="notif-dropdown-footer" onClick={() => { setShowNotif(false); navigate('/dashboard/active-enquiry') }}>
                  View all enquiries
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-user" onClick={() => navigate('/dashboard/profile')} style={{ cursor: 'pointer' }}>
          <div className="user-avatar">
            {profileImage ? (
              <img src={profileImage} alt="Admin" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              'A'
            )}
          </div>
          <span className="user-email">{userEmail}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
