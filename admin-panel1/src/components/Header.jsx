// ============================================================
// Premium Dynamic Header Component (Dual-Mode Theme Engine)
// ============================================================
// Features: 10 professional themes with instant Dark/Light mode 
// toggle switch, synchronized global variables, live notification
// polling, and theme-aware notification dropdown.
// API: GET /api/enquiries/notifications, PUT /api/enquiries/mark-read
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE } from '../config'

// 10 Professional Themes
const THEMES = [
  { id: 'slate', name: 'Slate', border: '#ff7eb3' },
  { id: 'navy', name: 'Navy', border: '#38bdf8' },
  { id: 'midnight', name: 'Midnight', border: '#bd93f9' },
  { id: 'charcoal', name: 'Charcoal', border: '#f97316' },
  { id: 'teal', name: 'Teal', border: '#06b6d4' },
  { id: 'crypto', name: 'Crypto', border: '#3b82f6' },
  { id: 'purple', name: 'Purple', border: '#818cf8' },
  { id: 'nalika', name: 'Nalika', border: '#10b981' },
  { id: 'classic', name: 'Classic', border: '#00c0ef' },
  { id: 'bloom', name: 'Bloom', border: '#60a5fa' },
]

function Header({ onMenuToggle, profileImage, token }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [notifCount, setNotifCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('admin-theme') || 'slate')
  const [isDark, setIsDark] = useState(localStorage.getItem('admin-dark-mode') !== 'false')

  // Apply theme and mode globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-mode', isDark ? 'dark' : 'light')
    localStorage.setItem('admin-theme', theme)
    localStorage.setItem('admin-dark-mode', isDark)
  }, [theme, isDark])

  const getPageTitle = (path) => {
    if (path.includes('categories')) return 'Category Management'
    if (path.includes('subcategories')) return 'Subcategories'
    if (path.includes('add-product')) return 'Add New Product'
    if (path.includes('products')) return 'Product Catalog'
    if (path.includes('active-enquiry')) return 'Active Enquiries'
    if (path.includes('past-enquiry')) return 'Past Enquiries'
    if (path.includes('winz-quotes')) return 'WinZ Quotes'
    if (path.includes('finance-applications')) return 'Finance Applications'
    if (path.includes('store-locations')) return 'Store Locations'
    if (path.includes('ad-campaign')) return 'Ad Campaigns'
    if (path.includes('slider')) return 'Slider Management'
    if (path.includes('discount-list')) return 'Discount & Promos'
    if (path.includes('about')) return 'Dynamic Pages: About Us'
    if (path.includes('terms')) return 'Terms & Conditions'
    if (path.includes('privacy')) return 'Privacy Policy'
    if (path.includes('contact')) return 'Contact Us Setup'
    if (path.includes('social-links')) return 'Social Media Links'
    if (path.includes('showrooms')) return 'Showroom Locations'
    if (path.includes('delivery-info')) return 'Delivery Information'
    if (path.includes('shop-furniture')) return 'Shop Furniture Setup'
    if (path.includes('returns')) return 'Returns Policy'
    if (path.includes('banners')) return 'Page Banners'
    if (path.includes('profile')) return 'Edit Profile'
    if (path.includes('settings')) return 'Site Colors & Settings'
    if (path === '/dashboard' || path === '/dashboard/') return 'Dashboard Overview'
    return 'Control Panel'
  }

  const pageTitle = getPageTitle(location.pathname)

  let userEmail = 'admin@gmail.com'
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userEmail = payload.email || userEmail
    }
  } catch {}

  const fetchNotifications = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotifCount(data.total ?? data.count ?? (Array.isArray(data) ? data.length : 0))
      }
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [token])

  const handleBellClick = async () => {
    setShowThemeMenu(false)
    if (!showNotif) {
      setLoadingNotifs(true)
      try {
        const res = await fetch(`${API_BASE}/api/enquiries?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setNotifications(data.slice(0, 5))
          }
        }
      } catch {}
      finally {
        setLoadingNotifs(false)
      }
    }
    setShowNotif(!showNotif)
  }

  const handleNotifClick = (item) => {
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
    <header className="premium-header">
      <style>{`
        :root {
          --font-family: 'Inter', sans-serif;
          --card-radius: 12px;
          --card-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        body {
          font-family: var(--font-family);
        }

        /* --- SLATE --- */
        :root[data-theme="slate"][data-mode="dark"] {
          --page-bg: #1a1e29; --header-bg: #222736; --sidebar-bg: #2a3142; --sidebar-header: #222736;
          --text-primary: #ffffff; --text-secondary: #a6b0cf; --accent-color: #ff7eb3; --accent-hover: #ff758c;
          --border-color: rgba(255, 255, 255, 0.08); --hover-bg: rgba(255, 255, 255, 0.03); --active-bg: #222736;
        }
        :root[data-theme="slate"][data-mode="light"] {
          --page-bg: #f1f5f9; --header-bg: #ffffff; --sidebar-bg: #f8fafc; --sidebar-header: #ffffff;
          --text-primary: #0f172a; --text-secondary: #64748b; --accent-color: #ff7eb3; --accent-hover: #ff758c;
          --border-color: #e2e8f0; --hover-bg: #f1f5f9; --active-bg: rgba(255, 126, 179, 0.1);
        }

        /* --- NAVY --- */
        :root[data-theme="navy"][data-mode="dark"] {
          --page-bg: #050b14; --header-bg: #08111D; --sidebar-bg: #0A1424; --sidebar-header: #08111D;
          --text-primary: #F8F4E6; --text-secondary: #8BA6D3; --accent-color: #38bdf8; --accent-hover: #0284c7;
          --border-color: rgba(248, 244, 230, 0.08); --hover-bg: rgba(248, 244, 230, 0.05); --active-bg: rgba(248, 244, 230, 0.08);
        }
        :root[data-theme="navy"][data-mode="light"] {
          --page-bg: #f0f4f8; --header-bg: #ffffff; --sidebar-bg: #f7fafc; --sidebar-header: #ffffff;
          --text-primary: #1a202c; --text-secondary: #4a5568; --accent-color: #0284c7; --accent-hover: #0369a1;
          --border-color: #e2e8f0; --hover-bg: #edf2f7; --active-bg: rgba(2, 132, 199, 0.1);
        }

        /* --- MIDNIGHT --- */
        :root[data-theme="midnight"][data-mode="dark"] {
          --page-bg: #11121d; --header-bg: #191a2a; --sidebar-bg: #282a36; --sidebar-header: #191a2a;
          --text-primary: #f8f8f2; --text-secondary: #b9badd; --accent-color: #bd93f9; --accent-hover: #ff79c6;
          --border-color: rgba(255, 255, 255, 0.05); --hover-bg: rgba(255, 255, 255, 0.05); --active-bg: #1e1e2e;
        }
        :root[data-theme="midnight"][data-mode="light"] {
          --page-bg: #f3f4f6; --header-bg: #ffffff; --sidebar-bg: #f9fafb; --sidebar-header: #ffffff;
          --text-primary: #111827; --text-secondary: #4b5563; --accent-color: #8b5cf6; --accent-hover: #7c3aed;
          --border-color: #e5e7eb; --hover-bg: #f3f4f6; --active-bg: rgba(139, 92, 246, 0.1);
        }

        /* --- CHARCOAL --- */
        :root[data-theme="charcoal"][data-mode="dark"] {
          --page-bg: #15171e; --header-bg: #1f2229; --sidebar-bg: #181a1f; --sidebar-header: #1f2229;
          --text-primary: #f3f4f6; --text-secondary: #9ca3af; --accent-color: #f97316; --accent-hover: #ea580c;
          --border-color: rgba(255, 255, 255, 0.08); --hover-bg: rgba(255, 255, 255, 0.04); --active-bg: rgba(249, 115, 22, 0.1);
        }
        :root[data-theme="charcoal"][data-mode="light"] {
          --page-bg: #f9fafb; --header-bg: #ffffff; --sidebar-bg: #f3f4f6; --sidebar-header: #ffffff;
          --text-primary: #1f2937; --text-secondary: #6b7280; --accent-color: #ea580c; --accent-hover: #c2410c;
          --border-color: #e5e7eb; --hover-bg: #e5e7eb; --active-bg: rgba(234, 88, 12, 0.1);
        }

        /* --- TEAL --- */
        :root[data-theme="teal"][data-mode="dark"] {
          --page-bg: #09151a; --header-bg: #0e1f26; --sidebar-bg: #0b181d; --sidebar-header: #0e1f26;
          --text-primary: #e6fffa; --text-secondary: #81e6d9; --accent-color: #06b6d4; --accent-hover: #0891b2;
          --border-color: rgba(6, 182, 212, 0.2); --hover-bg: rgba(6, 182, 212, 0.08); --active-bg: rgba(6, 182, 212, 0.15);
        }
        :root[data-theme="teal"][data-mode="light"] {
          --page-bg: #f0fdfa; --header-bg: #ffffff; --sidebar-bg: #f5fcfb; --sidebar-header: #ffffff;
          --text-primary: #134e4a; --text-secondary: #0f766e; --accent-color: #0d9488; --accent-hover: #0f766e;
          --border-color: #ccfbf1; --hover-bg: #99f6e4; --active-bg: rgba(13, 148, 136, 0.1);
        }

        /* --- CRYPTO --- */
        :root[data-theme="crypto"][data-mode="dark"] {
          --page-bg: #070a12; --header-bg: #0c101b; --sidebar-bg: #111827; --sidebar-header: #0c101b;
          --text-primary: #ffffff; --text-secondary: #9ca3af; --accent-color: #3b82f6; --accent-hover: #2563eb;
          --border-color: rgba(255, 255, 255, 0.08); --hover-bg: rgba(255, 255, 255, 0.04); --active-bg: rgba(59, 130, 246, 0.15);
        }
        :root[data-theme="crypto"][data-mode="light"] {
          --page-bg: #f8fafc; --header-bg: #ffffff; --sidebar-bg: #f1f5f9; --sidebar-header: #ffffff;
          --text-primary: #0f172a; --text-secondary: #475569; --accent-color: #2563eb; --accent-hover: #1d4ed8;
          --border-color: #cbd5e1; --hover-bg: #e2e8f0; --active-bg: rgba(37, 99, 235, 0.1);
        }

        /* --- PURPLE --- */
        :root[data-theme="purple"][data-mode="dark"] {
          --page-bg: #17153a; --header-bg: #1e1b4b; --sidebar-bg: #312e81; --sidebar-header: #1e1b4b;
          --text-primary: #e0e7ff; --text-secondary: #a5b4fc; --accent-color: #818cf8; --accent-hover: #6366f1;
          --border-color: rgba(255, 255, 255, 0.1); --hover-bg: rgba(255, 255, 255, 0.06); --active-bg: rgba(129, 140, 248, 0.2);
        }
        :root[data-theme="purple"][data-mode="light"] {
          --page-bg: #faf5ff; --header-bg: #ffffff; --sidebar-bg: #f3e8ff; --sidebar-header: #ffffff;
          --text-primary: #581c87; --text-secondary: #7e22ce; --accent-color: #9333ea; --accent-hover: #7e22ce;
          --border-color: #f3e8ff; --hover-bg: #e9d5ff; --active-bg: rgba(147, 51, 234, 0.1);
        }

        /* --- NALIKA --- */
        :root[data-theme="nalika"][data-mode="dark"] {
          --page-bg: #0b0f17; --header-bg: #111827; --sidebar-bg: #1f2937; --sidebar-header: #111827;
          --text-primary: #f9fafb; --text-secondary: #9ca3af; --accent-color: #10b981; --accent-hover: #059669;
          --border-color: rgba(255, 255, 255, 0.08); --hover-bg: rgba(255, 255, 255, 0.04); --active-bg: rgba(16, 185, 129, 0.15);
        }
        :root[data-theme="nalika"][data-mode="light"] {
          --page-bg: #ecfdf5; --header-bg: #ffffff; --sidebar-bg: #f0fdf4; --sidebar-header: #ffffff;
          --text-primary: #064e3b; --text-secondary: #047857; --accent-color: #059669; --accent-hover: #047857;
          --border-color: #d1fae5; --hover-bg: #a7f3d0; --active-bg: rgba(5, 150, 105, 0.1);
        }

        /* --- CLASSIC --- */
        :root[data-theme="classic"][data-mode="dark"] {
          --page-bg: #1b2838; --header-bg: #2a3f5f; --sidebar-bg: #171a21; --sidebar-header: #2a3f5f;
          --text-primary: #ffffff; --text-secondary: #c7d5e0; --accent-color: #66c0f4; --accent-hover: #417a9b;
          --border-color: rgba(255, 255, 255, 0.1); --hover-bg: rgba(255, 255, 255, 0.05); --active-bg: rgba(102, 192, 244, 0.2);
        }
        :root[data-theme="classic"][data-mode="light"] {
          --page-bg: #ecf0f5; --header-bg: #3c8dbc; --sidebar-bg: #222d32; --sidebar-header: #367fa9;
          --text-primary: #ffffff; --text-secondary: #b8c7ce; --accent-color: #00c0ef; --accent-hover: #00acd6;
          --border-color: rgba(255, 255, 255, 0.1); --hover-bg: rgba(0, 0, 0, 0.2); --active-bg: rgba(0, 0, 0, 0.3);
        }

        /* --- BLOOM --- */
        :root[data-theme="bloom"][data-mode="dark"] {
          --page-bg: #0f172a; --header-bg: #1e293b; --sidebar-bg: #111827; --sidebar-header: #1e293b;
          --text-primary: #ffffff; --text-secondary: #94a3b8; --accent-color: #60a5fa; --accent-hover: #3b82f6;
          --border-color: rgba(255, 255, 255, 0.1); --hover-bg: rgba(255, 255, 255, 0.05); --active-bg: rgba(96, 165, 250, 0.15);
        }
        :root[data-theme="bloom"][data-mode="light"] {
          --page-bg: #eff6ff; --header-bg: #1e40af; --sidebar-bg: #1d4ed8; --sidebar-header: #1e3a8a;
          --text-primary: #ffffff; --text-secondary: #93c5fd; --accent-color: #60a5fa; --accent-hover: #3b82f6;
          --border-color: rgba(255, 255, 255, 0.12); --hover-bg: rgba(255, 255, 255, 0.08); --active-bg: rgba(255, 255, 255, 0.15);
        }

        .premium-header {
          height: 72px; box-sizing: border-box; display: flex; justify-content: space-between;
          align-items: center; padding: 0 32px; background-color: var(--header-bg);
          color: var(--text-primary); position: sticky; top: 0; z-index: 900;
          border-bottom: 1px solid var(--border-color); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          transition: background-color 0.4s ease;
        }

        .header-left { display: flex; align-items: center; gap: 20px; }
        
        .premium-menu-toggle {
          background: transparent; border: none; color: var(--text-secondary); cursor: pointer;
          display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 8px; transition: all 0.2s ease;
        }
        .premium-menu-toggle:hover { background: var(--hover-bg); color: var(--text-primary); }
        
        .header-title-dynamic { font-size: 1.25rem; font-weight: 600; letter-spacing: 0.5px; margin: 0; display: flex; align-items: center; gap: 8px; }
        .title-accent { color: var(--text-secondary); font-weight: 400; }

        .header-right { display: flex; align-items: center; gap: 20px; }
        
        .action-btn-premium {
          background: var(--hover-bg); color: var(--text-secondary); border: 1px solid var(--border-color);
          border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s ease; position: relative;
        }
        .action-btn-premium:hover { background: var(--border-color); color: var(--text-primary); transform: translateY(-1px); }
        
        .notif-badge-premium {
          position: absolute; top: -2px; right: -2px; background: var(--accent-color); color: #ffffff;
          font-size: 0.65rem; font-weight: bold; min-width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; border: 2px solid var(--header-bg);
        }

        .premium-dropdown {
          position: absolute; top: 54px; right: 0; width: 260px; background: var(--sidebar-bg); color: var(--text-primary);
          border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); overflow: hidden;
          border: 1px solid var(--border-color); animation: slideDown 0.2s ease-out; z-index: 1000;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .p-drop-header { padding: 12px 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 0.85rem; background: var(--header-bg); }
        
        .p-mode-toggle-wrap { padding: 12px 16px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; font-weight: 600; }
        .p-switch { position: relative; display: inline-block; width: 38px; height: 20px; }
        .p-switch input { opacity: 0; width: 0; height: 0; }
        .p-slider { position: absolute; cursor: pointer; inset: 0; background-color: var(--border-color); transition: .3s; border-radius: 20px; }
        .p-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .p-slider { background-color: var(--accent-color); }
        input:checked + .p-slider:before { transform: translateX(18px); }

        .theme-list { max-height: 240px; overflow-y: auto; }
        .theme-list::-webkit-scrollbar { width: 4px; }
        .theme-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

        .p-theme-item { padding: 10px 16px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: background 0.2s; }
        .p-theme-item:hover { background: var(--hover-bg); }
        .p-theme-color-dot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

        .notif-dropdown-content { width: 320px; background: var(--sidebar-bg); color: var(--text-primary); }
        .p-notif-item { padding: 14px 18px; border-bottom: 1px solid var(--border-color); display: flex; gap: 12px; cursor: pointer; transition: background 0.2s; }
        .p-notif-item:hover { background: var(--hover-bg); }
        .p-notif-avatar { width: 36px; height: 36px; background: var(--active-bg); color: var(--accent-color); border: 1px solid var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
        .p-notif-info strong { display: block; font-size: 0.9rem; margin-bottom: 2px; color: var(--text-primary); }
        .p-notif-info p { margin: 0; font-size: 0.8rem; color: var(--text-secondary); }
        .p-notif-info span { font-size: 0.7rem; color: var(--text-secondary); opacity: 0.8; display: block; margin-top: 4px; }

        .premium-user { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px 12px; border-radius: 50px; transition: background 0.2s ease; border: 1px solid transparent; }
        .premium-user:hover { background: var(--hover-bg); border-color: var(--border-color); }
        
        .premium-avatar {
          width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--border-color);
          display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          color: #ffffff; font-weight: 700; overflow: hidden;
        }
        .premium-email { font-size: 0.9rem; font-weight: 500; letter-spacing: 0.3px; color: var(--text-secondary); }
        
        @media (max-width: 768px) { .premium-header { padding: 0 20px; } .premium-email { display: none; } }
      `}</style>

      <div className="header-left">
        <button className="premium-menu-toggle" onClick={onMenuToggle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="header-title-dynamic">
          <span className="title-accent">Admin /</span> {pageTitle}
        </h1>
      </div>

      <div className="header-right">
        {/* Theme Switcher */}
        <div style={{ position: 'relative' }}>
          <button className="action-btn-premium" onClick={() => { setShowThemeMenu(!showThemeMenu); setShowNotif(false); }} title="Change Theme">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.504 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
            </svg>
          </button>
          
          {showThemeMenu && (
            <div className="premium-dropdown">
              <div className="p-drop-header"><span>Select Theme</span></div>
              
              <div className="p-mode-toggle-wrap">
                <span>Dark Mode</span>
                <label className="p-switch">
                  <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
                  <span className="p-slider"></span>
                </label>
              </div>

              <div className="theme-list">
                {THEMES.map(t => (
                  <div key={t.id} className="p-theme-item" onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}>
                    <div className="p-theme-color-dot" style={{ background: t.border, borderColor: theme === t.id ? '#fff' : 'transparent' }}></div>
                    <span style={{ color: theme === t.id ? 'var(--accent-color)' : 'var(--text-primary)' }}>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button className="action-btn-premium" onClick={handleBellClick} title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {notifCount > 0 && <span className="notif-badge-premium">{notifCount}</span>}
          </button>

          {showNotif && (
            <div className="premium-dropdown notif-dropdown-content">
              <div className="p-drop-header">
                <span>Recent Enquiries</span>
                {notifCount > 0 && (
                  <button onClick={markAsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>
              {loadingNotifs ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Checking enquiries...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No new notifications
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-notif-item" onClick={() => handleNotifClick(n)}>
                    <div className="p-notif-avatar">{n.name?.charAt(0)?.toUpperCase()}</div>
                    <div className="p-notif-info">
                      <strong>{n.name}</strong>
                      <p>{n.product_name ? `Enquiry about ${n.product_name}` : 'New general enquiry'}</p>
                      <span>{n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}</span>
                    </div>
                  </div>
                ))
              )}
              {notifications.length > 0 && (
                <div
                  onClick={() => { setShowNotif(false); navigate('/dashboard/active-enquiry') }}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    background: 'var(--header-bg)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--accent-color)',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  View all active enquiries →
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Link */}
        <div className="premium-user" onClick={() => navigate('/dashboard/profile')}>
          <span className="premium-email">{userEmail}</span>
          <div className="premium-avatar">
            {profileImage ? (
              <img src={profileImage} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              userEmail.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header