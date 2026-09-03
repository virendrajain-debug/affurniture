// ============================================================
// Executive Luxury Sidebar (Manual Control Only)
// ============================================================
// Features:
//   - Never closes on category, subcategory, or navigation clicks
//   - Closes strictly when the Close button (X) on top is pressed
//   - Opens/closes with 3 horizontal lines hamburger menu
//   - 100% theme synchronized, live notification badge counters
// ============================================================

import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function Sidebar({ isOpen, onClose, profileImage, userName = 'Admin', userEmail = 'admin@gmail.com', onLogout }) {
  const location = useLocation()
  const [open, setOpen] = useState('catalog')
  const [badgeCounts, setBadgeCounts] = useState({
    customerEnquiries: 0,
    contactEnquiries: 0,
    winzQuotes: 0,
    financeApplications: 0,
  })

  const [siteLogo, setSiteLogo] = useState(() => {
    const cached = localStorage.getItem('site_logo') || localStorage.getItem('adminAvatar') || profileImage
    return cached ? getAssetUrl(cached) : '/aeryp.png'
  })
  const [siteName, setSiteName] = useState(() => {
    return localStorage.getItem('site_name') || 'AF Furnishings'
  })

  // Synchronize dynamic brand asset
  useEffect(() => {
    const updateAvatarAndLogo = () => {
      const activeLogo = localStorage.getItem('site_logo') || localStorage.getItem('adminAvatar') || profileImage
      setSiteLogo(activeLogo ? getAssetUrl(activeLogo) : '/aeryp.png')
      const activeName = localStorage.getItem('site_name')
      if (activeName) setSiteName(activeName)
    }

    window.addEventListener('logo-updated', updateAvatarAndLogo)
    window.addEventListener('avatar-updated', updateAvatarAndLogo)
    window.addEventListener('settings-updated', updateAvatarAndLogo)
    window.addEventListener('storage', updateAvatarAndLogo)

    return () => {
      window.removeEventListener('logo-updated', updateAvatarAndLogo)
      window.removeEventListener('avatar-updated', updateAvatarAndLogo)
      window.removeEventListener('settings-updated', updateAvatarAndLogo)
      window.removeEventListener('storage', updateAvatarAndLogo)
    }
  }, [profileImage])

  const toggle = (section) => setOpen(open === section ? '' : section)

  useEffect(() => {
    const p = location.pathname
    if (p.includes('/categories') || p.includes('/products') || p.includes('/winz-inventory')) {
      setOpen('catalog')
    } else if (p.includes('/home-manager') || p.includes('/pages') || p.includes('/store-locations') || p.includes('/testimonials')) {
      setOpen('content')
    } else if (p.includes('/ad-campaign') || p.includes('/deals')) {
      setOpen('')
    } else if (p.includes('/winz-quotes') || p.includes('/finance-applications')) {
      setOpen('requests')
    } else if (p.includes('/customer-enquiries') || p.includes('/contact-enquiries')) {
      setOpen('inquiries')
    }
  }, [location.pathname])

  // Fetch real-time badge counts with authorization token
  useEffect(() => {
    const fetchBadgeCounts = async () => {
      const activeToken = getAuthToken()
      if (!activeToken) return
      try {
        const res = await fetch(`${API_BASE}/api/notifications/badge-counts`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          setBadgeCounts({
            customerEnquiries: Number(data.customerEnquiries || 0),
            contactEnquiries: Number(data.contactEnquiries || 0),
            winzQuotes: Number(data.winzQuotes || 0),
            financeApplications: Number(data.financeApplications || 0),
          })
        }
      } catch {}
    }

    fetchBadgeCounts()
    const interval = setInterval(fetchBadgeCounts, 30000)
    window.addEventListener('badge-updated', fetchBadgeCounts)

    return () => {
      clearInterval(interval)
      window.removeEventListener('badge-updated', fetchBadgeCounts)
    }
  }, [])

  const requestsTotal = badgeCounts.winzQuotes + badgeCounts.financeApplications
  const inquiriesTotal = badgeCounts.customerEnquiries + badgeCounts.contactEnquiries

  const Icon = ({ path }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ minWidth: '20px' }}
    >
      <path d={path} />
    </svg>
  )

  const Arrow = ({ section }) => (
    <span className={`p-nav-arrow ${open === section ? 'open' : ''}`}>▶</span>
  )

  // SubLink without auto-closing navigation
  const SubLink = ({ to, badge, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `p-sub-link ${isActive ? 'active' : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{children}</span>
        {Boolean(badge && Number(badge) > 0) && (
          <span className="p-badge-pill">{badge}</span>
        )}
      </div>
    </NavLink>
  )

  return (
    <>
      <style>{`
        /* --- Backdrop Overlay (Mobile only) --- */
        .sidebar-backdrop,
        .premium-overlay {
          display: none;
        }

        @media (max-width: 991px) {
          .sidebar-backdrop,
          .premium-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 998;
            opacity: ${isOpen ? '1' : '0'};
            visibility: ${isOpen ? 'visible' : 'hidden'};
            pointer-events: ${isOpen ? 'auto' : 'none'};
            transition: opacity 0.25s ease, visibility 0.25s ease;
          }
        }

        /* --- Premium Sidebar (Manual close/open) --- */
        .premium-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 260px;
          height: 100vh;
          background-color: var(--sidebar-bg);
          color: var(--text-secondary);
          z-index: 999;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color);
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, border-color 0.3s ease;
          transform: ${isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)'};
          box-shadow: ${isOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none'};
        }

        @media (max-width: 991px) {
          .premium-sidebar {
            width: 280px;
            z-index: 1000;
          }
        }

        .p-sidebar-header {
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
          background: var(--sidebar-header, var(--header-bg));
          gap: 10px;
          flex-shrink: 0;
          overflow: hidden;
          box-sizing: border-box;
          width: 100%;
        }

        .p-brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }

        .p-brand-logo-box {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .p-brand-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .p-brand-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .p-brand-subtitle {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          opacity: 0.85;
          letter-spacing: 0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        /* Close Button Always Visible on Top of Sidebar */
        .p-sidebar-collapse-btn {
          display: flex;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .p-sidebar-collapse-btn:hover {
          color: #fff;
          background: rgba(239, 68, 68, 0.85);
          border-color: #ef4444;
        }

        .p-sidebar-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px 0;
          display: flex;
          flex-direction: column;
        }
        .p-sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .p-sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 10px;
        }

        .p-sidebar-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 20px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          border-left: 3px solid transparent;
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .p-sidebar-link:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        .p-sidebar-link.active {
          background: var(--active-bg);
          color: var(--text-primary);
          border-left-color: var(--accent-color);
          font-weight: 600;
        }
        
        .p-link-content {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
        }

        .p-nav-arrow {
          font-size: 0.65rem;
          color: var(--text-secondary);
          transition: transform 0.2s ease;
          display: inline-block;
          opacity: 0.7;
        }
        .p-nav-arrow.open {
          transform: rotate(90deg);
          color: var(--accent-color);
          opacity: 1;
        }

        .p-submenu {
          background: rgba(0, 0, 0, 0.15);
          border-left: 2px solid var(--border-color);
          margin: 4px 16px 8px 30px;
          border-radius: 0 8px 8px 0;
          padding: 4px 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .p-sub-link {
          padding: 8px 16px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 500;
          display: block;
          transition: all 0.15s ease;
          border-radius: 4px;
          margin: 0 4px;
        }
        .p-sub-link:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
          padding-left: 20px;
        }
        .p-sub-link.active {
          color: var(--accent-color);
          font-weight: 600;
          background: var(--active-bg);
          padding-left: 20px;
        }

        .p-badge-pill {
          background: var(--accent-color);
          color: #000;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 12px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .p-sidebar-footer {
          padding: 12px 18px;
          border-top: 1px solid var(--border-color);
          background: var(--sidebar-header, var(--header-bg));
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .p-footer-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--card-bg, #1f2937);
          color: var(--text-secondary);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .p-footer-icon-btn:hover {
          color: var(--text-primary);
          border-color: var(--accent-color);
          background: var(--hover-bg);
        }
        .p-footer-icon-btn.logout-btn:hover {
          color: #fff;
          background: rgba(239, 68, 68, 0.9);
          border-color: #ef4444;
        }
      `}</style>

      {/* Backdrop for click outside to close */}
      <div className="sidebar-backdrop premium-overlay" onClick={onClose} />

      <aside className="premium-sidebar">
        {/* Top Brand Header with Explicit Close Button (X) */}
        <div className="p-sidebar-header">
          <Link
            to="/dashboard"
            className="p-brand-link"
            title="Dashboard Overview"
          >
            <div className="p-brand-logo-box">
              <img 
                src={siteLogo} 
                alt={siteName} 
                className="p-brand-logo" 
                onError={(e) => {
                  if (e.target.src !== '/aeryp.png') e.target.src = '/aeryp.png'
                }}
              />
            </div>
            <div className="p-brand-text">
              <span className="p-brand-name">{siteName}</span>
              <span className="p-brand-subtitle">Furnishings &amp; Living</span>
            </div>
          </Link>

          {/* Close button with X icon */}
          <button
            className="p-sidebar-collapse-btn"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            title="Close Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Tree */}
        <nav className="p-sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `p-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="p-link-content">
              <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <div
            className={`p-sidebar-link ${open === 'catalog' ? 'active' : ''}`}
            onClick={() => toggle('catalog')}
          >
            <div className="p-link-content">
              <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              <span>Catalog</span>
            </div>
            <Arrow section="catalog" />
          </div>
          {open === 'catalog' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/categories">Collection Structure</SubLink>
              <SubLink to="/dashboard/products">Product Inventory</SubLink>
              <SubLink to="/dashboard/winz-inventory">WinZ Inventory</SubLink>
            </div>
          )}

          <div
            className={`p-sidebar-link ${open === 'content' ? 'active' : ''}`}
            onClick={() => toggle('content')}
          >
            <div className="p-link-content">
              <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <span>Content</span>
            </div>
            <Arrow section="content" />
          </div>
          {open === 'content' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/home-manager">Home Page Editor</SubLink>
              <SubLink to="/dashboard/pages">Pages & Content</SubLink>
              <SubLink to="/dashboard/store-locations">Store Locations</SubLink>
              <SubLink to="/dashboard/testimonials">Testimonials</SubLink>
            </div>
          )}

          <div
            className={`p-sidebar-link ${open === 'requests' ? 'active' : ''}`}
            onClick={() => toggle('requests')}
          >
            <div className="p-link-content">
              <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <span>Requests & Applications</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {requestsTotal > 0 && <span className="p-badge-pill">{requestsTotal}</span>}
              <Arrow section="requests" />
            </div>
          </div>
          {open === 'requests' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/finance-applications" badge={badgeCounts.financeApplications}>
                Finance Applications
              </SubLink>
              <SubLink to="/dashboard/winz-quotes" badge={badgeCounts.winzQuotes}>
                WinZ Quotes
              </SubLink>
            </div>
          )}

          <div
            className={`p-sidebar-link ${open === 'inquiries' ? 'active' : ''}`}
            onClick={() => toggle('inquiries')}
          >
            <div className="p-link-content">
              <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              <span>Inquiries</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {inquiriesTotal > 0 && <span className="p-badge-pill">{inquiriesTotal}</span>}
              <Arrow section="inquiries" />
            </div>
          </div>
          {open === 'inquiries' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/customer-enquiries" badge={badgeCounts.customerEnquiries}>
                Customer Enquiries
              </SubLink>
              <SubLink to="/dashboard/contact-enquiries" badge={badgeCounts.contactEnquiries}>
                Contact Enquiries
              </SubLink>
            </div>
          )}

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => `p-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="p-link-content">
              <Icon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <span>Site Settings</span>
            </div>
          </NavLink>
        </nav>

        {/* Anchored Sidebar Bottom Icon Actions */}
        <div className="p-sidebar-footer">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => `p-footer-icon-btn ${isActive ? 'active' : ''}`}
            title="Edit Profile"
            aria-label="Edit Profile"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </NavLink>

          <button
            type="button"
            className="p-footer-icon-btn logout-btn"
            onClick={onLogout}
            title="Log Out"
            aria-label="Log Out"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar;
