// ============================================================
// Premium Brand Sidebar Component (Theme Engine Enabled)
// ============================================================
// Features: Full navigation tree, dynamic route matching,
// seamless header background integration, and mobile drawer support.
// ============================================================

import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Sidebar({ isOpen, onClose, profileImage, userName = 'Admin', onLogout }) {
  const [open, setOpen] = useState('products')
  const toggle = (section) => setOpen(open === section ? '' : section)

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

  const SubLink = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `p-sub-link ${isActive ? 'active' : ''}`}
      onClick={() => window.innerWidth < 1025 && onClose()}
    >
      {children}
    </NavLink>
  )

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : 'A'

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .premium-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
            z-index: 999; opacity: ${isOpen ? '1' : '0'}; visibility: ${isOpen ? 'visible' : 'hidden'};
            transition: all 0.3s ease;
          }
        }

        .premium-sidebar {
          position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
          background-color: var(--sidebar-bg); color: var(--text-secondary); z-index: 1000;
          display: flex; flex-direction: column; transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'};
          will-change: transform; transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.4s ease;
          box-shadow: ${isOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none'}; border-right: none;
        }

        .p-sidebar-header {
          height: 72px; min-height: 72px; background-color: var(--header-bg);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px; box-sizing: border-box; transition: background-color 0.4s ease;
        }
        
        .p-brand-wrap { display: flex; align-items: center; gap: 10px; }
        .p-sidebar-logo { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; background: #fff; padding: 2px; }
        .p-sidebar-brand { font-size: 1.05rem; font-weight: 700; letter-spacing: 0.5px; color: var(--text-primary); text-transform: uppercase; transition: color 0.4s ease; }
        
        .p-sidebar-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 6px; display: flex; transition: all 0.2s ease; }
        .p-sidebar-close:hover { color: var(--text-primary); transform: translateX(-3px); }

        .p-profile-section { padding: 28px 20px 20px; text-align: center; }
        .p-profile-link { text-decoration: none; display: block; transition: transform 0.2s ease; }
        .p-profile-link:hover { transform: scale(1.03); }

        .p-profile-avatar-wrap {
          width: 86px; height: 86px; margin: 0 auto 12px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover)); padding: 3px;
          transition: background 0.4s ease;
        }
        .p-profile-avatar {
          width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
          border: 3px solid var(--sidebar-bg); background: var(--header-bg);
          display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 1.8rem;
          transition: border-color 0.4s ease, background-color 0.4s ease;
        }
        .p-profile-name { color: var(--text-primary); font-weight: 600; font-size: 1.05rem; margin: 0; transition: color 0.4s ease; }

        .p-profile-divider { height: 2px; width: 120px; margin: 20px auto 0; background: linear-gradient(90deg, var(--accent-color), var(--text-secondary)); border-radius: 2px; opacity: 0.5; transition: background 0.4s ease; }

        .p-sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 10px 0; display: flex; flex-direction: column; }
        .p-sidebar-nav::-webkit-scrollbar { width: 4px; }
        .p-sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .p-sidebar-nav::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
        .p-sidebar-nav::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }

        .p-sidebar-link {
          display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; color: var(--text-secondary);
          text-decoration: none; font-size: 0.95rem; font-weight: 400; transition: all 0.2s ease; cursor: pointer; border-left: 3px solid transparent;
        }
        .p-sidebar-link:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-sidebar-link.active { background: var(--active-bg); color: var(--text-primary); border-left-color: var(--accent-color); }
        
        .p-link-content { display: flex; align-items: center; gap: 16px; }
        
        .p-nav-arrow { font-size: 0.7rem; transition: transform 0.3s ease; opacity: 0.6; }
        .p-nav-arrow.open { transform: rotate(90deg); opacity: 1; color: var(--accent-color); }

        .p-submenu { display: flex; flex-direction: column; background: rgba(0,0,0,0.15); padding: 6px 0; margin: 0; }
        .p-sub-link { color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; padding: 10px 24px 10px 60px; display: block; transition: all 0.2s ease; }
        .p-sub-link:hover { color: var(--text-primary); }
        .p-sub-link.active { color: var(--accent-color); font-weight: 500; background: var(--hover-bg); }
        
        .p-sidebar-footer { padding: 16px 20px; border-top: 1px solid var(--border-color); font-size: 0.72rem; color: var(--text-secondary); text-align: center; transition: border-color 0.4s ease; }
      `}</style>

      <div className="premium-overlay" onClick={onClose} />

      <aside className="premium-sidebar">
        {/* Top Header */}
        <div className="p-sidebar-header">
          <div className="p-brand-wrap">
            <img src="/serthkuyghj.png" alt="Logo" className="p-sidebar-logo" />
            <span className="p-sidebar-brand">AF Furnishing</span>
          </div>

          <button className="p-sidebar-close" onClick={onClose} title="Collapse Sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Centered Profile Area */}
        <div className="p-profile-section">
          <NavLink
            to="/dashboard/profile"
            className="p-profile-link"
            onClick={() => window.innerWidth < 1025 && onClose()}
          >
            <div className="p-profile-avatar-wrap">
              {profileImage ? (
                <img src={profileImage} alt={userName} className="p-profile-avatar" />
              ) : (
                <div className="p-profile-avatar">{firstLetter}</div>
              )}
            </div>
            <h4 className="p-profile-name">{userName}</h4>
          </NavLink>

          <div className="p-profile-divider"></div>
        </div>

        {/* Navigation List */}
        <nav className="p-sidebar-nav">
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

          {/* Catalog Group */}
          <div className={`p-sidebar-link ${open === 'products' ? 'active' : ''}`} onClick={() => toggle('products')}>
            <div className="p-link-content">
              <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              <span>Catalog</span>
            </div>
            <Arrow section="products" />
          </div>
          {open === 'products' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/categories">Category</SubLink>
              <SubLink to="/dashboard/subcategories">Subcategory</SubLink>
              <SubLink to="/dashboard/add-product">Add Product</SubLink>
              <SubLink to="/dashboard/products">Product List</SubLink>
            </div>
          )}

          {/* Advertisement Group */}
          <div className={`p-sidebar-link ${open === 'ads' ? 'active' : ''}`} onClick={() => toggle('ads')}>
            <div className="p-link-content">
              <Icon path="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              <span>Advertisement</span>
            </div>
            <Arrow section="ads" />
          </div>
          {open === 'ads' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/slider">Hero Sliders</SubLink>
              <SubLink to="/dashboard/banners">Page Banners</SubLink>
              <SubLink to="/dashboard/ad-campaign">Ad Campaign</SubLink>
              <SubLink to="/dashboard/discount-list">Discount Codes</SubLink>
            </div>
          )}

          {/* Customer Requests Group */}
          <div className={`p-sidebar-link ${open === 'enquiries' ? 'active' : ''}`} onClick={() => toggle('enquiries')}>
            <div className="p-link-content">
              <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              <span>Customer Requests</span>
            </div>
            <Arrow section="enquiries" />
          </div>
          {open === 'enquiries' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/active-enquiry">Active Enquiries</SubLink>
              <SubLink to="/dashboard/past-enquiry">Past Enquiries</SubLink>
              <SubLink to="/dashboard/winz-quotes">WinZ Quotes</SubLink>
              <SubLink to="/dashboard/finance-applications">Finance Applications</SubLink>
            </div>
          )}

          {/* Store Content Group */}
          <div className={`p-sidebar-link ${open === 'pages' ? 'active' : ''}`} onClick={() => toggle('pages')}>
            <div className="p-link-content">
              <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <span>Store Content</span>
            </div>
            <Arrow section="pages" />
          </div>
          {open === 'pages' && (
            <div className="p-submenu">
              <SubLink to="/dashboard/about">About Us</SubLink>
              <SubLink to="/dashboard/terms">Terms and Conditions</SubLink>
              <SubLink to="/dashboard/privacy-policy">Privacy Policy</SubLink>
              <SubLink to="/dashboard/store-locations">Store Locations</SubLink>
              <SubLink to="/dashboard/showrooms">Showrooms</SubLink>
              <SubLink to="/dashboard/delivery-info">Delivery Info</SubLink>
              <SubLink to="/dashboard/shop-furniture">Shop Furniture</SubLink>
              <SubLink to="/dashboard/returns">Returns Policy</SubLink>
              <SubLink to="/dashboard/contact">Contact Setup</SubLink>
              <SubLink to="/dashboard/social-links">Social Links</SubLink>
              <SubLink to="/dashboard/settings">Site Colors & Settings</SubLink>
            </div>
          )}

          {/* Logout Button */}
          <div className="p-sidebar-link" onClick={onLogout} style={{ marginTop: '10px', cursor: 'pointer' }}>
            <div className="p-link-content">
              <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              <span style={{ color: '#f46a6a' }}>Logout</span>
            </div>
          </div>
        </nav>

        <div className="p-sidebar-footer">
          <p>© {new Date().getFullYear()} AF Furnishing</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar