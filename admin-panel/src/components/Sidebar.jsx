import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { API_BASE } from '../config'

function Sidebar({ isOpen, onClose, profileImage, userName = 'Admin', onLogout }) {
  const [open, setOpen] = useState('catalog')
  const [siteLogo, setSiteLogo] = useState(null)
  const toggle = (section) => setOpen(open === section ? '' : section)

  useEffect(() => {
    const loadLogo = () => {
      const cached = localStorage.getItem('site_logo')
      if (cached) setSiteLogo(cached)
      fetch(`${API_BASE}/api/settings`).then(r => r.ok ? r.json() : null).then(d => {
        if (d?.site_logo) {
          setSiteLogo(d.site_logo)
          localStorage.setItem('site_logo', d.site_logo)
        }
      }).catch(() => {})
    }
    loadLogo()
    window.addEventListener('logo-updated', loadLogo)
    return () => window.removeEventListener('logo-updated', loadLogo)
  }, [])

  const Icon = ({ d }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: 20 }}>
      {d.includes('M') && d.split('|').map((p, i) => <path key={i} d={p} />)}
    </svg>
  )

  const Arrow = ({ section }) => (
    <span style={{ fontSize: '0.7rem', transition: 'transform 0.3s', opacity: 0.6, transform: open === section ? 'rotate(90deg)' : 'none', color: open === section ? 'var(--accent-color)' : undefined }}>&#9654;</span>
  )

  const SubLink = ({ to, children }) => (
    <NavLink to={to} className={({ isActive }) => `sub-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 1025 && onClose()}>
      {children}
    </NavLink>
  )

  const navItem = (label, icon, onClick) => (
    <div className="sidebar-link" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Icon d={icon} />
        <span>{label}</span>
      </div>
    </div>
  )

  const navGroup = (label, icon, sectionKey, children) => (
    <>
      <div className={`sidebar-link ${open === sectionKey ? 'active' : ''}`} onClick={() => toggle(sectionKey)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Icon d={icon} />
          <span>{label}</span>
        </div>
        <Arrow section={sectionKey} />
      </div>
      {open === sectionKey && <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.15)', padding: '6px 0', margin: 0 }}>{children}</div>}
    </>
  )

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-overlay-dyn { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 999; transition: all 0.3s; }
        }
        .sidebar-overlay-dyn.hidden { display: none; }
      `}</style>

      <div className={`sidebar-overlay-dyn ${isOpen ? '' : 'hidden'}`} onClick={onClose} />

      <aside className="sidebar" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.4s cubic-bezier(0.25,1,0.5,1)', zIndex: 1001 }}>
        <div className="sidebar-header">
          <img src={siteLogo ? `${siteLogo}?t=${Date.now()}` : '/serthkuyghj.png'} alt="Logo" className="sidebar-logo" />
          <span className="sidebar-brand">AF Furnishings</span>
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>

        <div className="p-profile-section">
          <NavLink to="/dashboard/profile" className="p-profile-link" onClick={() => window.innerWidth < 1025 && onClose()}>
            <div className="p-profile-avatar-wrap">
              {profileImage ? (
                <img src={profileImage} alt={userName} className="p-profile-avatar" />
              ) : (
                <div className="p-profile-avatar">{userName?.charAt(0)?.toUpperCase() || 'A'}</div>
              )}
            </div>
            <h4 className="p-profile-name">{userName}</h4>
          </NavLink>
          <div className="p-profile-divider"></div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth < 1025 && onClose()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          {navGroup('Catalog', 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', 'catalog', (
            <>
              <SubLink to="/dashboard/categories">Categories & Subcategories</SubLink>
              <SubLink to="/dashboard/add-product">Add Product</SubLink>
              <SubLink to="/dashboard/products">Product List</SubLink>
            </>
          ))}

          {navGroup('Advertising', 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', 'ads', (
            <>
              <SubLink to="/dashboard/slider">Hero Sliders</SubLink>
              <SubLink to="/dashboard/banners">Page Banners</SubLink>
              <SubLink to="/dashboard/ad-campaign">Ad Campaigns</SubLink>
              <SubLink to="/dashboard/discount-list">Discount Codes</SubLink>
            </>
          ))}

          {navGroup('Customer Requests', 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', 'enquiries', (
            <>
              <SubLink to="/dashboard/active-enquiry">Active Enquiries</SubLink>
              <SubLink to="/dashboard/past-enquiry">Past Enquiries</SubLink>
              <SubLink to="/dashboard/winz-quotes">WinZ Quotes</SubLink>
              <SubLink to="/dashboard/finance-applications">Finance Applications</SubLink>
            </>
          ))}

          {navGroup('Dynamic Pages', 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'dynpages', (
            <>
              <SubLink to="/dashboard/about">About Us</SubLink>
            </>
          ))}

          {navGroup('Store Content', 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'pages', (
            <>
              <SubLink to="/dashboard/terms">Terms & Conditions</SubLink>
              <SubLink to="/dashboard/privacy-policy">Privacy Policy</SubLink>
              <SubLink to="/dashboard/store-locations">Store Locations</SubLink>
              <SubLink to="/dashboard/showrooms">Showrooms</SubLink>
              <SubLink to="/dashboard/delivery-info">Delivery Info</SubLink>
              <SubLink to="/dashboard/contact">Contact Setup</SubLink>
              <SubLink to="/dashboard/social-links">Social Links</SubLink>
              <SubLink to="/dashboard/settings">Site Settings</SubLink>
            </>
          ))}

          <div className="sidebar-link" onClick={onLogout} style={{ marginTop: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              <span style={{ color: '#f46a6a' }}>Logout</span>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <p>&copy; {new Date().getFullYear()} AF Furnishings</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
