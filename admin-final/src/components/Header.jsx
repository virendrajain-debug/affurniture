// ============================================================
// Premium Dynamic Header Component (Dual-Mode Theme Engine)
// ============================================================
// Features: 10 professional themes with instant Dark/Light mode 
// toggle switch, synchronized global variables, live notification
// polling, and theme-aware notification dropdown.
// API: GET /api/enquiries/notifications, PUT /api/enquiries/mark-read
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

// 10 Executive Luxury Themes
const THEMES = [
  { id: 'obsidian', name: 'Obsidian & Gold', border: '#d4af37' },
  { id: 'royal', name: 'Midnight Royal', border: '#38bdf8' },
  { id: 'titanium', name: 'Titanium Slate', border: '#22d3ee' },
  { id: 'emerald', name: 'Nordic Emerald', border: '#34d399' },
  { id: 'amethyst', name: 'Deep Amethyst', border: '#c084fc' },
  { id: 'monochrome', name: 'Monochrome Pro', border: '#e2e8f0' },
  { id: 'crimson', name: 'Carbon Crimson', border: '#f87171' },
  { id: 'arctic', name: 'Arctic Frost', border: '#0284c7' },
  { id: 'ivory', name: 'Ivory Luxe', border: '#aa7a3e' },
  { id: 'minimal', name: 'Modern Minimal', border: '#2563eb' },
]

function Header({ onMenuToggle, profileImage, token, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [avatar, setAvatar] = useState(() => {
    const cached = localStorage.getItem('adminAvatar') || localStorage.getItem('site_logo') || profileImage
    return cached ? getAssetUrl(cached) : '/aeryp.png'
  })
  
  const [notifCount, setNotifCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  const [theme, setTheme] = useState(localStorage.getItem('admin-theme') || 'obsidian')
  const [isDark, setIsDark] = useState(localStorage.getItem('admin-dark-mode') !== 'false')

  const headerRef = useRef(null)

  // Synchronize avatar with global storage and custom update events
  useEffect(() => {
    const updateAvatar = () => {
      const newAvatar = localStorage.getItem('adminAvatar') || localStorage.getItem('site_logo') || profileImage
      setAvatar(newAvatar ? getAssetUrl(newAvatar) : '/aeryp.png')
    }
    window.addEventListener('logo-updated', updateAvatar)
    window.addEventListener('avatar-updated', updateAvatar)
    window.addEventListener('storage', updateAvatar)
    return () => {
      window.removeEventListener('logo-updated', updateAvatar)
      window.removeEventListener('avatar-updated', updateAvatar)
      window.removeEventListener('storage', updateAvatar)
    }
  }, [profileImage])

  // Listen for clicks outside dropdown menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setShowThemeMenu(false)
        setShowNotif(false)
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load user's theme and dark mode from backend profile on mount
  useEffect(() => {
    if (!token) return
    const fetchUserPreferences = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.theme) {
            setTheme(data.theme)
            localStorage.setItem('admin-theme', data.theme)
          }
          if (data.dark_mode !== undefined && data.dark_mode !== null) {
            const dark = Boolean(data.dark_mode)
            setIsDark(dark)
            localStorage.setItem('admin-dark-mode', String(dark))
          }
        }
      } catch {}
    }
    fetchUserPreferences()
  }, [token])

  // Apply theme and mode globally & persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-mode', isDark ? 'dark' : 'light')
    localStorage.setItem('admin-theme', theme)
    localStorage.setItem('admin-dark-mode', String(isDark))

    // Persist to backend
    if (token) {
      fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme, dark_mode: isDark ? 1 : 0 }),
      }).catch(() => {})
    }
  }, [theme, isDark, token])

  const getPageTitle = (path) => {
    if (path.includes('banners')) return 'Banners'
    if (path.includes('/pages') || path === '/dashboard/pages') return 'CMS Pages'
    if (path.includes('/pages/home')) return 'Home Page Media'
    if (path.includes('/pages/about') || path === '/dashboard/about') return 'About Us Page Media'
    if (path.includes('/pages/delivery-info') || path === '/dashboard/delivery-info') return 'Delivery Information'
    if (path.includes('/pages/returns') || path === '/dashboard/returns') return 'Returns & Refund Policy'
    if (path.includes('/pages/terms') || path === '/dashboard/terms') return 'Terms & Conditions'
    if (path.includes('/pages/privacy-policy') || path === '/dashboard/privacy-policy') return 'Privacy Policy'
    if (path.includes('/pages/shop-furniture') || path === '/dashboard/shop-furniture') return 'Shop Furniture Guide'
    if (path.includes('/pages/contact') || path === '/dashboard/contact') return 'Contact Us Setup'
    if (path.includes('/pages/store-locations')) return 'Store Locations & Showrooms'
    if (path.includes('/pages/winz-finance') || path === '/dashboard/winz-finance') return 'WinZ & Finance Guide'
    if (path.includes('/page-banners')) return 'Pages & Media Gallery'
    if (path.includes('categories')) return 'Collection Structure'
    if (path.includes('subcategories')) return 'Subcategories'
    if (path.includes('add-product')) return 'Add New Product'
    if (path.includes('products')) return 'Product List'
    if (path.includes('customer-enquiries') || path.includes('active-enquiry') || path.includes('past-enquiry')) return 'Customer Enquiries'
    if (path.includes('contact-enquiries')) return 'Contact Enquiries'
    if (path.includes('winz-quotes')) return 'WinZ Quotes'
    if (path.includes('finance-applications')) return 'Finance Applications'
    if (path.includes('store-locations') || path.includes('showrooms')) return 'Store Locations & Showrooms'
    if (path.includes('ad-campaign')) return 'Ad Campaigns'
    if (path.includes('profile')) return 'Edit Profile'
    if (path.includes('settings')) return 'Site Settings'
    if (path.includes('dynamic-pages')) return 'Dynamic Pages'
    if (path === '/dashboard' || path === '/dashboard/') return 'Dashboard Overview'
    return 'Dashboard'
  }

  const pageTitle = getPageTitle(location.pathname)

  let userEmail = 'admin@gmail.com'
  let userName = 'Admin'
  try {
    const activeToken = getAuthToken(token)
    if (activeToken) {
      const payload = JSON.parse(atob(activeToken.split('.')[1]))
      userEmail = payload.email || userEmail
      userName = payload.name || payload.email?.split('@')[0] || userName
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
    setShowProfileMenu(false)
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
    navigate('/dashboard/customer-enquiries')
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
    <header className="premium-header" ref={headerRef}>
      <style>{`
        :root {
          --font-family: 'Inter', system-ui, -apple-system, sans-serif;
          --card-radius: 12px;
          --card-shadow: 0 4px 15px rgba(0,0,0,0.05);
          --page-bg: #1a1e29;
          --header-bg: #222736;
          --sidebar-bg: #2a3142;
          --sidebar-header: #222736;
          --text-primary: #ffffff;
          --text-secondary: #a6b0cf;
          --accent-color: #d4af37;
          --accent-hover: #e5c158;
          --accent-glow: rgba(212, 175, 55, 0.35);
          --border-color: rgba(255, 255, 255, 0.08);
          --border-hover: rgba(212, 175, 55, 0.35);
          --hover-bg: rgba(255, 255, 255, 0.03);
          --active-bg: #222736;
        }

        body {
          font-family: var(--font-family);
          background-color: var(--page-bg);
          color: var(--text-primary);
        }

        /* --- 1. OBSIDIAN & GOLD --- */
        :root[data-theme="obsidian"][data-mode="dark"] {
          --page-bg: #0d0f12; --header-bg: #141820; --sidebar-bg: #10141b; --sidebar-header: #141820;
          --text-primary: #ffffff; --text-secondary: #c5a880; --accent-color: #d4af37; --accent-hover: #e5c158;
          --border-color: rgba(212, 175, 55, 0.18); --hover-bg: rgba(212, 175, 55, 0.06); --active-bg: rgba(212, 175, 55, 0.14);
        }
        :root[data-theme="obsidian"][data-mode="light"] {
          --page-bg: #faf7f2; --header-bg: #ffffff; --sidebar-bg: #f5efe6; --sidebar-header: #ffffff;
          --text-primary: #29241e; --text-secondary: #8c7355; --accent-color: #aa7a3e; --accent-hover: #93652f;
          --border-color: #e8ded1; --hover-bg: #f4ecdf; --active-bg: rgba(170, 122, 62, 0.12);
        }

        /* --- 2. MIDNIGHT ROYAL --- */
        :root[data-theme="royal"][data-mode="dark"] {
          --page-bg: #060b14; --header-bg: #0a1222; --sidebar-bg: #0d172e; --sidebar-header: #0a1222;
          --text-primary: #f0f6fc; --text-secondary: #8ba6d3; --accent-color: #38bdf8; --accent-hover: #0284c7;
          --border-color: rgba(56, 189, 248, 0.18); --hover-bg: rgba(56, 189, 248, 0.06); --active-bg: rgba(56, 189, 248, 0.14);
        }
        :root[data-theme="royal"][data-mode="light"] {
          --page-bg: #f0f4f8; --header-bg: #ffffff; --sidebar-bg: #f7fafc; --sidebar-header: #ffffff;
          --text-primary: #1a202c; --text-secondary: #4a5568; --accent-color: #0284c7; --accent-hover: #0369a1;
          --border-color: #e2e8f0; --hover-bg: #edf2f7; --active-bg: rgba(2, 132, 199, 0.1);
        }

        /* --- 3. TITANIUM SLATE --- */
        :root[data-theme="titanium"][data-mode="dark"] {
          --page-bg: #0f141c; --header-bg: #161d28; --sidebar-bg: #1a2230; --sidebar-header: #161d28;
          --text-primary: #f1f5f9; --text-secondary: #94a3b8; --accent-color: #22d3ee; --accent-hover: #06b6d4;
          --border-color: rgba(34, 211, 238, 0.18); --hover-bg: rgba(34, 211, 238, 0.06); --active-bg: rgba(34, 211, 238, 0.14);
        }
        :root[data-theme="titanium"][data-mode="light"] {
          --page-bg: #f8fafc; --header-bg: #ffffff; --sidebar-bg: #f1f5f9; --sidebar-header: #ffffff;
          --text-primary: #0f172a; --text-secondary: #475569; --accent-color: #0891b2; --accent-hover: #0e7490;
          --border-color: #e2e8f0; --hover-bg: #e2e8f0; --active-bg: rgba(8, 145, 178, 0.1);
        }

        /* --- 4. NORDIC EMERALD --- */
        :root[data-theme="emerald"][data-mode="dark"] {
          --page-bg: #07120e; --header-bg: #0c1f17; --sidebar-bg: #0f291f; --sidebar-header: #0c1f17;
          --text-primary: #f0fdf4; --text-secondary: #86efac; --accent-color: #34d399; --accent-hover: #10b981;
          --border-color: rgba(52, 211, 153, 0.18); --hover-bg: rgba(52, 211, 153, 0.06); --active-bg: rgba(52, 211, 153, 0.14);
        }
        :root[data-theme="emerald"][data-mode="light"] {
          --page-bg: #f0fdf4; --header-bg: #ffffff; --sidebar-bg: #f7fee7; --sidebar-header: #ffffff;
          --text-primary: #064e3b; --text-secondary: #047857; --accent-color: #059669; --accent-hover: #047857;
          --border-color: #d1fae5; --hover-bg: #dcfce7; --active-bg: rgba(5, 150, 105, 0.1);
        }

        /* --- 5. DEEP AMETHYST --- */
        :root[data-theme="amethyst"][data-mode="dark"] {
          --page-bg: #0f0a1a; --header-bg: #171026; --sidebar-bg: #1f1533; --sidebar-header: #171026;
          --text-primary: #faf5ff; --text-secondary: #d8b4fe; --accent-color: #c084fc; --accent-hover: #a855f7;
          --border-color: rgba(192, 132, 252, 0.18); --hover-bg: rgba(192, 132, 252, 0.06); --active-bg: rgba(192, 132, 252, 0.14);
        }
        :root[data-theme="amethyst"][data-mode="light"] {
          --page-bg: #faf5ff; --header-bg: #ffffff; --sidebar-bg: #f5f3ff; --sidebar-header: #ffffff;
          --text-primary: #3b0764; --text-secondary: #7e22ce; --accent-color: #9333ea; --accent-hover: #7e22ce;
          --border-color: #ede9fe; --hover-bg: #f3e8ff; --active-bg: rgba(147, 51, 234, 0.1);
        }

        /* --- 6. MONOCHROME PRO --- */
        :root[data-theme="monochrome"][data-mode="dark"] {
          --page-bg: #000000; --header-bg: #111111; --sidebar-bg: #0a0a0a; --sidebar-header: #111111;
          --text-primary: #ffffff; --text-secondary: #a1a1aa; --accent-color: #f4f4f5; --accent-hover: #e4e4e7;
          --border-color: rgba(255, 255, 255, 0.15); --hover-bg: rgba(255, 255, 255, 0.06); --active-bg: rgba(255, 255, 255, 0.15);
        }
        :root[data-theme="monochrome"][data-mode="light"] {
          --page-bg: #f4f4f5; --header-bg: #ffffff; --sidebar-bg: #fafafa; --sidebar-header: #ffffff;
          --text-primary: #09090b; --text-secondary: #52525b; --accent-color: #18181b; --accent-hover: #27272a;
          --border-color: #e4e4e7; --hover-bg: #e4e4e7; --active-bg: rgba(24, 24, 27, 0.1);
        }

        /* --- 7. CARBON CRIMSON --- */
        :root[data-theme="crimson"][data-mode="dark"] {
          --page-bg: #12090b; --header-bg: #1c0e12; --sidebar-bg: #241217; --sidebar-header: #1c0e12;
          --text-primary: #fef2f2; --text-secondary: #fca5a5; --accent-color: #f87171; --accent-hover: #ef4444;
          --border-color: rgba(248, 113, 113, 0.18); --hover-bg: rgba(248, 113, 113, 0.06); --active-bg: rgba(248, 113, 113, 0.14);
        }
        :root[data-theme="crimson"][data-mode="light"] {
          --page-bg: #fff1f2; --header-bg: #ffffff; --sidebar-bg: #ffe4e6; --sidebar-header: #ffffff;
          --text-primary: #881337; --text-secondary: #be123c; --accent-color: #e11d48; --accent-hover: #be123c;
          --border-color: #fecdd3; --hover-bg: #fecdd3; --active-bg: rgba(225, 29, 72, 0.1);
        }

        /* --- 8. ARCTIC FROST --- */
        :root[data-theme="arctic"][data-mode="dark"] {
          --page-bg: #091824; --header-bg: #0e2436; --sidebar-bg: #122d42; --sidebar-header: #0e2436;
          --text-primary: #f0f9ff; --text-secondary: #7dd3fc; --accent-color: #38bdf8; --accent-hover: #0284c7;
          --border-color: rgba(56, 189, 248, 0.18); --hover-bg: rgba(56, 189, 248, 0.06); --active-bg: rgba(56, 189, 248, 0.14);
        }
        :root[data-theme="arctic"][data-mode="light"] {
          --page-bg: #f0f7ff; --header-bg: #ffffff; --sidebar-bg: #f8fbff; --sidebar-header: #ffffff;
          --text-primary: #0c4a6e; --text-secondary: #0369a1; --accent-color: #0284c7; --accent-hover: #0369a1;
          --border-color: #e0f2fe; --hover-bg: #bae6fd; --active-bg: rgba(2, 132, 199, 0.12);
        }

        /* --- 9. IVORY LUXE --- */
        :root[data-theme="ivory"][data-mode="dark"] {
          --page-bg: #14120e; --header-bg: #1c1813; --sidebar-bg: #211d17; --sidebar-header: #1c1813;
          --text-primary: #fdfbf7; --text-secondary: #d4c5b2; --accent-color: #d97706; --accent-hover: #b45309;
          --border-color: rgba(217, 119, 6, 0.18); --hover-bg: rgba(217, 119, 6, 0.06); --active-bg: rgba(217, 119, 6, 0.14);
        }
        :root[data-theme="ivory"][data-mode="light"] {
          --page-bg: #faf8f5; --header-bg: #ffffff; --sidebar-bg: #f5f0ea; --sidebar-header: #ffffff;
          --text-primary: #29241e; --text-secondary: #786248; --accent-color: #aa7a3e; --accent-hover: #8f6530;
          --border-color: #ebdcd0; --hover-bg: #f5ece1; --active-bg: rgba(170, 122, 62, 0.12);
        }

        /* --- 10. MODERN MINIMAL --- */
        :root[data-theme="minimal"][data-mode="dark"] {
          --page-bg: #111418; --header-bg: #181c22; --sidebar-bg: #1e232b; --sidebar-header: #181c22;
          --text-primary: #ffffff; --text-secondary: #94a3b8; --accent-color: #3b82f6; --accent-hover: #2563eb;
          --border-color: rgba(255, 255, 255, 0.1); --hover-bg: rgba(255, 255, 255, 0.04); --active-bg: rgba(59, 130, 246, 0.14);
        }
        :root[data-theme="minimal"][data-mode="light"] {
          --page-bg: #f8fafc; --header-bg: #ffffff; --sidebar-bg: #ffffff; --sidebar-header: #ffffff;
          --text-primary: #0f172a; --text-secondary: #64748b; --accent-color: #2563eb; --accent-hover: #1d4ed8;
          --border-color: #e2e8f0; --hover-bg: #f1f5f9; --active-bg: rgba(37, 99, 235, 0.1);
        }

        .premium-header {
          height: 70px; box-sizing: border-box; display: flex; justify-content: space-between;
          align-items: center; padding: 0 32px; background-color: var(--header-bg);
          color: var(--text-primary); position: sticky; top: 0; z-index: 900;
          border-bottom: 1px solid var(--border-color); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          transition: background-color 0.4s ease, border-color 0.4s ease;
        }

        .header-brand-logo-wrap {
          width: 40px; height: 40px; min-width: 40px; border-radius: 10px;
          background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; flex-shrink: 0; padding: 3px; box-sizing: border-box;
          cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .header-brand-logo-wrap:hover {
          transform: scale(1.04); border-color: var(--accent-color, #d4af37);
        }
        .header-brand-logo-img {
          width: 100%; height: 100%; object-fit: contain; display: block; border-radius: 6px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .premium-menu-toggle {
          display: flex !important;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          padding: 7px 10px;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .premium-menu-toggle:hover {
          background: var(--hover-bg);
          color: var(--accent-color);
          border-color: var(--accent-color);
          transform: translateY(-1px);
        }
        
        .header-title-dynamic {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .title-accent {
          color: var(--text-secondary);
          font-weight: 400;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

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
          animation: pulseGlow 2s infinite ease-in-out;
        }

        .premium-dropdown {
          position: absolute; top: 54px; right: 0; width: 260px; background: var(--sidebar-bg); color: var(--text-primary);
          border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); overflow: hidden;
          border: 1px solid var(--border-color); animation: dropdownFade 160ms cubic-bezier(0.16, 1, 0.3, 1); z-index: 1000;
        }

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

        .premium-user { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 5px 10px; border-radius: 50px; transition: background 0.2s ease; border: 1px solid transparent; }
        .premium-user:hover { background: var(--hover-bg); border-color: var(--border-color); }
        
        .premium-avatar {
          width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(212, 175, 55, 0.45);
          display: flex; align-items: center; justify-content: center; background: #ffffff;
          color: #1a2744; font-weight: 700; overflow: hidden; font-size: 0.95rem; flex-shrink: 0;
        }
        .premium-email { font-size: 0.88rem; font-weight: 500; letter-spacing: 0.3px; color: var(--text-secondary); }

        .profile-dropdown-content { width: 250px; background: var(--sidebar-bg); }
        .p-profile-card-header {
          padding: 16px; border-bottom: 1px solid var(--border-color);
          display: flex; align-items: center; gap: 12px; background: var(--header-bg);
        }
        .p-profile-card-avatar {
          width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(212, 175, 55, 0.45);
          display: flex; align-items: center; justify-content: center; background: #ffffff;
          color: #1a2744; font-weight: 700; font-size: 1.1rem; overflow: hidden; flex-shrink: 0;
        }
        .p-profile-card-info { overflow: hidden; }
        .p-profile-card-name { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
        .p-profile-card-role { font-size: 0.72rem; color: var(--accent-color); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .p-profile-menu-list { padding: 6px 0; }
        .p-profile-menu-item {
          display: flex; align-items: center; gap: 12px; padding: 12px 18px;
          color: var(--text-primary); text-decoration: none; font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease;
        }
        .p-profile-menu-item:hover { background: var(--hover-bg); color: var(--accent-color); }
        .p-profile-menu-item.logout-item { color: #ef4444; border-top: 1px solid var(--border-color); margin-top: 4px; padding-top: 12px; }
        .p-profile-menu-item.logout-item:hover { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
        
        @media (max-width: 768px) {
          .premium-header {
            height: 60px;
            padding: 0 14px;
            gap: 10px;
          }
          .header-left {
            gap: 10px;
            min-width: 0;
            flex: 1;
            overflow: hidden;
          }
          .header-title-dynamic {
            font-size: 0.95rem;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
            flex: 1;
          }
          .header-right {
            gap: 8px;
            flex-shrink: 0;
          }
          .action-btn-premium {
            width: 36px;
            height: 36px;
            min-width: 36px;
          }
          .premium-avatar {
            width: 34px;
            height: 34px;
            min-width: 34px;
          }
          .premium-user {
            padding: 2px 4px;
          }
          .premium-email {
            display: none;
          }
          .notif-dropdown-content {
            width: 290px;
            right: -45px;
          }
          .profile-dropdown-content {
            width: 230px;
            right: 0;
          }
          .premium-dropdown {
            top: 48px;
          }
        }
      `}</style>

      <div className="header-left">
        <button className="premium-menu-toggle" onClick={onMenuToggle} title="Open / Close Sidebar (3 Horizontal Lines)" aria-label="Toggle Sidebar">
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

        {/* Profile Avatar & Interactive Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <div
            className="premium-user"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu)
              setShowThemeMenu(false)
              setShowNotif(false)
            }}
            title="Account Menu"
          >
            <span className="premium-email">{userEmail}</span>
            <div className="premium-avatar">
              <img 
                src={avatar} 
                alt="Admin" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                onError={(e) => {
                  if (e.target.src !== '/aeryp.png') e.target.src = '/aeryp.png'
                }}
              />
            </div>
          </div>

          {showProfileMenu && (
            <div className="premium-dropdown profile-dropdown-content">
              <div className="p-profile-card-header">
                <div className="p-profile-card-avatar">
                  <img 
                    src={avatar} 
                    alt="Admin" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    onError={(e) => {
                      if (e.target.src !== '/aeryp.png') e.target.src = '/aeryp.png'
                    }}
                  />
                </div>
                <div className="p-profile-card-info">
                  <div className="p-profile-card-name">{userName}</div>
                  <div className="p-profile-card-role">Administrator</div>
                </div>
              </div>

              <div className="p-profile-menu-list">
                <div
                  className="p-profile-menu-item"
                  onClick={() => {
                    setShowProfileMenu(false)
                    navigate('/dashboard/profile')
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Edit Profile</span>
                </div>

                <div
                  className="p-profile-menu-item logout-item"
                  onClick={() => {
                    setShowProfileMenu(false)
                    if (onLogout) onLogout()
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header