// ============================================================
// Premium Brand Sidebar Component (Dual-Mode Theme Engine Enabled)
// ============================================================
// Features: Full reorganized navigation tree covering all active routes,
// perfectly center-aligned Admin Profile Avatar, real-time unread notification
// badges with 30s polling and instant 'badge-updated' event listeners,
// collapsible header button, Audit Logs link, and smooth drawer transitions.
// API: GET /api/notifications/badge-counts
// ============================================================

import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { API_BASE } from '../config'

function Sidebar({ isOpen, onClose, profileImage, userName = 'Admin', userEmail = 'admin@gmail.com', onLogout }) {
  const location = useLocation()
  const [open, setOpen] = useState('catalog')
  const [badgeCounts, setBadgeCounts] = useState({
    customerEnquiries: 0,
    contactEnquiries: 0,
    winzQuotes: 0,
    financeApplications: 0,
  })

  const toggle = (section) => setOpen(open === section ? '' : section)

  // Auto-expand menu section matching current active route
  useEffect(() => {
    const p = location.pathname
    if (p.includes('/categories') || p.includes('/subcategories') || p.includes('/add-product') || p.includes('/products')) {
      setOpen('catalog')
    } else if (p.includes('/ad-campaign') || p.includes('/testimonials')) {
      setOpen('marketing')
    } else if (p.includes('/winz-quotes') || p.includes('/finance-applications')) {
      setOpen('requests')
    } else if (p.includes('/customer-enquiries') || p.includes('/contact-enquiries') || p.includes('/active-enquiry') || p.includes('/past-enquiry')) {
      setOpen('inquiries')
    } else if (p.includes('/pages/') || p.includes('/page-banners') || p.includes('/banners') || p.includes('/slider') || p.includes('/dynamic-pages')) {
      setOpen('pages')
    }
  }, [location.pathname])

  // Fetch real-time badge counts, poll every 30 seconds, and listen for instant badge updates
  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/notifications/badge-counts`)
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

  const SubLink = ({ to, badge, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `p-sub-link ${isActive ? 'active' : ''}`}
      onClick={() => window.innerWidth < 1025 && onClose()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{children}</span>
        {Boolean(badge && Number(badge) > 0) && (
          <span className="p-badge-pill">{badge}</span>
        )}
      </div>
    </NavLink>
  )

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : 'A'

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-backdrop,
          .premium-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 998; opacity: ${isOpen ? '1' : '0'}; visibility: ${isOpen ? 'visible' : 'hidden'};
            transition: opacity 260ms ease, visibility 260ms ease;
            pointer-events: ${isOpen ? 'auto' : 'none'};
          }
        }

        .premium-sidebar {
          position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
          background-color: var(--sidebar-bg); color: var(--text-secondary); z-index: 1000;
          display: flex; flex-direction: column; transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'};
          will-change: transform, width;
          transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), width 260ms cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease;
          box-shadow: ${isOpen ? '4px 0 28px rgba(0,0,0,0.3)' : 'none'}; border-right: 1px solid var(--border-color);
        }

        .p-profile-section {
          padding: 24px 20px 20px; text-align: center; position: relative;
          border-bottom: 1px solid var(--border-color); background: var(--header-bg);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }

        .p-sidebar-collapse-btn {
          position: absolute; top: 12px; right: 12px; background: var(--hover-bg); border: 1px solid var(--border-color);
          color: var(--text-secondary); cursor: pointer; padding: 6px; display: flex;
          align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s ease;
        }
        .p-sidebar-collapse-btn:hover { color: var(--text-primary); background: var(--border-color); }

        .p-profile-link {
          text-decoration: none; display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: transform 0.2s ease; width: 100%;
        }
        .p-profile-link:hover { transform: scale(1.02); }

        .p-profile-avatar-wrap {
          width: 76px; height: 76px; margin: 0 auto 10px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover)); padding: 3px;
          transition: background 0.4s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .p-profile-avatar {
          width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
          border: 3px solid var(--sidebar-bg); background: var(--header-bg);
          display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 1.6rem;
          transition: border-color 0.4s ease, background-color 0.4s ease;
        }
        .p-profile-name {
          color: var(--text-primary); font-weight: 600; font-size: 1.05rem; margin: 0 0 3px 0;
          transition: color 0.4s ease; text-align: center; width: 100%;
        }
        .p-profile-email {
          color: var(--text-secondary); font-size: 0.8rem; margin: 0;
          text-align: center; width: 100%; word-break: break-all; opacity: 0.85;
        }

        .p-sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 10px 0; display: flex; flex-direction: column; }
        .p-sidebar-nav::-webkit-scrollbar { width: 4px; }
        .p-sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .p-sidebar-nav::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
        .p-sidebar-nav::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }

        .p-sidebar-link {
          display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; color: var(--text-secondary);
          text-decoration: none; font-size: 0.92rem; font-weight: 400; cursor: pointer; border-left: 3px solid transparent;
          will-change: transform, background-color; transform: translateZ(0);
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .p-sidebar-link:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          transform: translateX(3px);
        }
        .p-sidebar-link.active {
          background: var(--active-bg);
          color: var(--text-primary);
          border-left-color: var(--accent-color);
          font-weight: 600;
        }
        
        .p-link-content { display: flex; align-items: center; gap: 16px; flex: 1; }
        .p-link-content svg {
          transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .p-sidebar-link:hover .p-link-content svg,
        .p-sidebar-link.active .p-link-content svg {
          transform: scale(1.06);
          color: var(--accent-color);
        }
        
        .p-nav-arrow { font-size: 0.7rem; transition: transform 0.3s ease; opacity: 0.6; }
        .p-nav-arrow.open { transform: rotate(90deg); opacity: 1; color: var(--accent-color); }

        .p-submenu {
          display: flex; flex-direction: column; background: rgba(0,0,0,0.12); padding: 4px 0; margin: 0;
          animation: slideDownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .p-sub-link {
          color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; padding: 9px 24px 9px 58px; display: block;
          will-change: transform, background-color; transform: translateZ(0);
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .p-sub-link:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
          transform: translateX(3px);
        }
        .p-sub-link.active {
          color: var(--accent-color);
          font-weight: 600;
          background: var(--hover-bg);
        }
        
        .p-badge-pill {
          background: var(--accent-color); color: #ffffff; font-size: 0.72rem; font-weight: 700;
          padding: 2px 7px; border-radius: 12px; line-height: 1.2;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
          display: inline-flex; align-items: center; justify-content: center; min-width: 18px;
          animation: pulseGlow 2s infinite ease-in-out;
        }

        .p-sidebar-footer { padding: 14px 20px; border-top: 1px solid var(--border-color); font-size: 0.72rem; color: var(--text-secondary); text-align: center; transition: border-color 0.4s ease; }
      `}</style>

      <div className="sidebar-backdrop premium-overlay" onClick={onClose} />

      <aside className="premium-sidebar">
        {/* Top Profile Header */}
        <div className="p-profile-section">
          <button
            className="p-sidebar-collapse-btn"
            style={{ zIndex: 20 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            title="Collapse Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <NavLink
            to="/dashboard/profile"
            className="p-profile-link"
            onClick={() => window.innerWidth < 1025 && onClose()}
            title="Edit Admin Profile"
          >
            <div className="p-profile-avatar-wrap">
              {profileImage ? (
                <img src={profileImage} alt={userName} className="p-profile-avatar" />
              ) : (
                <div className="p-profile-avatar">{firstLetter}</div>
              )}
            </div>
            <h4 className="p-profile-name">{userName}</h4>
            <p className="p-profile-email">{userEmail}</p>
          </NavLink>
        </div>

        {/* Navigation Tree with Live Badges */}
        <nav className="p-sidebar-nav">
          {/* Dashboard Overview */}
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `p-sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => window.innerWidth < 1025 && onClose()}
          >
            <div className="p-link-content">
              <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          {/* 1. Collections & Catalog */}
          <div
            className={`p-sidebar-link ${open === 'catalog' ? 'active' : ''}`}
            onClick={() => toggle('catalog')}
          >
            <div className="p-link-content">
              <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              <span>Collections & Catalog</span>
            </div>
            <Arrow section="catalog" />
          </div>
          {open === 'catalog' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/categories">Catalog Structure</SubLink>
              <SubLink to="/dashboard/products">Product Inventory</SubLink>
            </div>
          )}

          {/* 2. Promotion & Testimonial */}
          <div
            className={`p-sidebar-link ${open === 'marketing' ? 'active' : ''}`}
            onClick={() => toggle('marketing')}
          >
            <div className="p-link-content">
              <Icon path="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              <span>Promotion & Testimonial</span>
            </div>
            <Arrow section="marketing" />
          </div>
          {open === 'marketing' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/ad-campaign">Ad Campaigns</SubLink>
              <SubLink to="/dashboard/testimonials">Testimonials</SubLink>
            </div>
          )}

          {/* 3. Requests & Applications */}
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
              <SubLink to="/dashboard/winz-quotes" badge={badgeCounts.winzQuotes}>
                WinZ Quotes
              </SubLink>
              <SubLink to="/dashboard/finance-applications" badge={badgeCounts.financeApplications}>
                Finance Applications
              </SubLink>
            </div>
          )}

          {/* 4. Inquiries */}
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

          {/* 5. Pages & Media */}
          <div
            className={`p-sidebar-link ${open === 'pages' ? 'active' : ''}`}
            onClick={() => toggle('pages')}
          >
            <div className="p-link-content">
              <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <span>Pages & Media</span>
            </div>
            <Arrow section="pages" />
          </div>
          {open === 'pages' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/pages/home">Home Page</SubLink>
              <SubLink to="/dashboard/pages/about">About Us</SubLink>
              <SubLink to="/dashboard/pages/store-locations">Store Locations</SubLink>
              <SubLink to="/dashboard/pages/delivery-info">Delivery Info</SubLink>
              <SubLink to="/dashboard/pages/returns">Returns Policy</SubLink>
              <SubLink to="/dashboard/pages/terms">Terms & Conditions</SubLink>
              <SubLink to="/dashboard/pages/privacy-policy">Privacy Policy</SubLink>
              <SubLink to="/dashboard/pages/shop-furniture">Shop Furniture</SubLink>
              <SubLink to="/dashboard/pages/contact">Contact Us</SubLink>
              <SubLink to="/dashboard/pages/winz-finance">WinZ & Finance</SubLink>
            </div>
          )}

          {/* 6. Profile */}
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => `p-sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => window.innerWidth < 1025 && onClose()}
          >
            <div className="p-link-content">
              <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              <span>Edit Profile</span>
            </div>
          </NavLink>

          {/* 7. Site Settings */}
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => `p-sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => window.innerWidth < 1025 && onClose()}
          >
            <div className="p-link-content">
              <Icon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <span>Site Settings</span>
            </div>
          </NavLink>

          {/* Logout Button */}
          <div
            className="p-sidebar-link"
            onClick={onLogout}
            style={{ marginTop: '4px', cursor: 'pointer' }}
          >
            <div className="p-link-content">
              <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              <span style={{ color: '#f46a6a', fontWeight: 500 }}>Logout</span>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-sidebar-footer">
          <p>© {new Date().getFullYear()} AF Furnishings</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
