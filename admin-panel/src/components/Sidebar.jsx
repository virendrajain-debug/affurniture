import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Sidebar({ isOpen, onClose, profileImage, onLogout }) {
  const [open, setOpen] = useState('')
  const toggle = (m) => setOpen(open === m ? '' : m)

  const Icon = ({ d }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px' }}>
      <path d={d} />
    </svg>
  )

  const Arrow = ({ section }) => (
    <span style={{ fontSize: '11px', opacity: 0.5, transition: 'transform 0.2s', transform: open === section ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
  )

  const SectionLabel = ({ text }) => (
    <div style={{ padding: '16px 16px 6px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{text}</div>
  )

  const SubLink = ({ to, children }) => (
    <NavLink to={to} className={({ isActive }) => `sidebar-link sub-link ${isActive ? 'active' : ''}`} onClick={onClose}>
      {children}
    </NavLink>
  )

  return (
    <>
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
            <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            <span>Dashboard</span>
          </NavLink>

          {/* E-COMMERCE */}
          <SectionLabel text="E-Commerce" />

          {/* Catalog */}
          <div className={`sidebar-link ${open === 'catalog' ? 'active' : ''}`} onClick={() => toggle('catalog')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              <span>Catalog</span>
            </div>
            <Arrow section="catalog" />
          </div>
          {open === 'catalog' && (
            <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <SubLink to="/dashboard/categories">Categories</SubLink>
              <SubLink to="/dashboard/subcategories">Subcategories</SubLink>
              <SubLink to="/dashboard/add-product">Add Product</SubLink>
              <SubLink to="/dashboard/products">Product List</SubLink>
            </div>
          )}

          {/* Enquiries */}
          <div className={`sidebar-link ${open === 'enquiry' ? 'active' : ''}`} onClick={() => toggle('enquiry')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              <span>Enquiries</span>
            </div>
            <Arrow section="enquiry" />
          </div>
          {open === 'enquiry' && (
            <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <SubLink to="/dashboard/active-enquiry">Active Enquiry</SubLink>
              <SubLink to="/dashboard/past-enquiry">Past Enquiry</SubLink>
              <SubLink to="/dashboard/winz-quotes">WinZ Quotes</SubLink>
            </div>
          )}

          {/* MARKETING & CMS */}
          <SectionLabel text="Marketing & CMS" />

          {/* Marketing */}
          <div className={`sidebar-link ${open === 'marketing' ? 'active' : ''}`} onClick={() => toggle('marketing')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              <span>Marketing</span>
            </div>
            <Arrow section="marketing" />
          </div>
          {open === 'marketing' && (
            <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <SubLink to="/dashboard/ad-campaign">Ads Management</SubLink>
              <SubLink to="/dashboard/discount-list">Discount & Promo</SubLink>
            </div>
          )}

          {/* Dynamic Pages */}
          <div className={`sidebar-link ${open === 'dynamic' ? 'active' : ''}`} onClick={() => toggle('dynamic')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
              <span>Dynamic Pages</span>
            </div>
            <Arrow section="dynamic" />
          </div>
          {open === 'dynamic' && (
            <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <SubLink to="/dashboard/about">About Us</SubLink>
            </div>
          )}

          {/* Static Pages */}
          <div className={`sidebar-link ${open === 'static' ? 'active' : ''}`} onClick={() => toggle('static')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <span>Static Pages</span>
            </div>
            <Arrow section="static" />
          </div>
          {open === 'static' && (
            <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <SubLink to="/dashboard/terms">Terms & Condition</SubLink>
              <SubLink to="/dashboard/privacy-policy">Privacy Policy</SubLink>
              <SubLink to="/dashboard/contact">Contact Us</SubLink>
              <SubLink to="/dashboard/social-links">Social Links</SubLink>
              <SubLink to="/dashboard/showrooms">Showrooms</SubLink>
              <SubLink to="/dashboard/delivery-info">Delivery Info</SubLink>
              <SubLink to="/dashboard/shop-furniture">Shop Furniture</SubLink>
              <SubLink to="/dashboard/returns">Returns</SubLink>
            </div>
          )}

          {/* Pages and Media */}
          <div className={`sidebar-link ${open === 'media' ? 'active' : ''}`} onClick={() => toggle('media')} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <span>Pages and Media</span>
            </div>
            <Arrow section="media" />
          </div>
          {open === 'media' && (
            <div style={{ paddingLeft: '32px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <SubLink to="/dashboard/banners">Page Banners</SubLink>
            </div>
          )}

          {/* Finance Applications */}
          <NavLink to="/dashboard/finance-applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Icon d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            <span>Finance Applications</span>
          </NavLink>

          {/* Store Locations */}
          <NavLink to="/dashboard/store-locations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <span>Store Locations</span>
          </NavLink>

          {/* ACCOUNT */}
          <SectionLabel text="Account" />

          <NavLink to="/dashboard/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <span>Edit Profile</span>
          </NavLink>

          <div className="sidebar-link" onClick={onLogout} style={{ cursor: 'pointer', color: '#EF4444' }}>
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
