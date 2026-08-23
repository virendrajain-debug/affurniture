import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Sidebar({ isOpen, onClose, profileImage, onLogout }) {
  const [open, setOpen] = useState('')
  const toggle = (m) => setOpen(open === m ? '' : m)

  // Reusable SVG Component for clean code
  const Icon = ({ path }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px' }}>
      <path d={path} />
    </svg>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          {profileImage ? (
            <img src={profileImage} alt="Admin" className="sidebar-logo" style={{ objectFit: 'cover' }} />
          ) : (
            <img src="/serthkuyghj.png" alt="AF Furniture" className="sidebar-logo" />
          )}
          <span className="sidebar-brand">AF Furniture</span>
        </div>

        <nav className="sidebar-nav">
          
          {/* Dashboard */}
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            <span>Dashboard</span>
          </NavLink>

          {/* Project Management */}
          <div className={`sidebar-link ${open === 'proj' ? 'active' : ''}`} onClick={() => toggle('proj')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              <span>Product Management</span>
            </div>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>{open === 'proj' ? '▼' : '▶'}</span>
          </div>
          {open === 'proj' && <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavLink to="/dashboard/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Categories</NavLink>
            <NavLink to="/dashboard/subcategories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Subcategories</NavLink>
            <NavLink to="/dashboard/add-product" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Add Product</NavLink>
            <NavLink to="/dashboard/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Product List</NavLink>
          </div>}

          {/* Advertisement Management */}
          <div className={`sidebar-link ${open === 'banner' ? 'active' : ''}`} onClick={() => toggle('banner')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <span>Ads Management</span>
            </div>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>{open === 'banner' ? '▼' : '▶'}</span>
          </div>
          {open === 'banner' && <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavLink to="/dashboard/ad-campaign" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Ad Campaign</NavLink>
            <NavLink to="/dashboard/slider" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Slider (Banner)</NavLink>
          </div>}

          {/* Enquiry Management */}
          <div className={`sidebar-link ${open === 'enquiry' ? 'active' : ''}`} onClick={() => toggle('enquiry')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              <span>Enquiry Management</span>
            </div>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>{open === 'enquiry' ? '▼' : '▶'}</span>
          </div>
          {open === 'enquiry' && <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavLink to="/dashboard/active-enquiry" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Active Enquiry</NavLink>
            <NavLink to="/dashboard/past-enquiry" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Past Enquiry</NavLink>
            <NavLink to="/dashboard/winz-quotes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>WinZ Quotes</NavLink>
          </div>}

          {/* Pages and Media */}
          <div className={`sidebar-link ${open === 'pages' ? 'active' : ''}`} onClick={() => toggle('pages')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <span>Pages and Media</span>
            </div>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>{open === 'pages' ? '▼' : '▶'}</span>
          </div>
          {open === 'pages' && <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavLink to="/dashboard/about" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>About Us</NavLink>
            <NavLink to="/dashboard/terms" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Terms & Condition</NavLink>
            <NavLink to="/dashboard/privacy-policy" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Privacy Policy</NavLink>
            <NavLink to="/dashboard/contact" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Contact Us</NavLink>
            <NavLink to="/dashboard/social-links" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Social Links</NavLink>
          </div>}

          {/* Discount & Promotion */}
          <div className={`sidebar-link ${open === 'disc' ? 'active' : ''}`} onClick={() => toggle('disc')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon path="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              <span>Discount & Promo</span>
            </div>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>{open === 'disc' ? '▼' : '▶'}</span>
          </div>
          {open === 'disc' && <div style={{ paddingLeft: '32px', marginBottom: '8px' }}>
            <NavLink to="/dashboard/discount-list" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>Discount List</NavLink>
          </div>}

          {/* Edit Profile */}
          <NavLink to="/dashboard/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <span>Edit Profile</span>
          </NavLink>

          {/* Logout Button */}
          <div className="sidebar-link" onClick={onLogout} style={{ cursor: 'pointer', color: '#EF4444' }}>
            <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            <span>Logout</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <p>AF Furniture Admin</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar