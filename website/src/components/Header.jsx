import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { API_BASE } from '../config'

const navCategories = [
  {
    label: 'Lounge Suite',
    href: '/category/lounge-suite',
    subcategories: [
      { label: 'All Lounge Suite', href: '/category/lounge-suite' },
      { label: 'Sofas', href: '/category/lounge-suite?sub=sofas' },
      { label: 'Armchairs', href: '/category/lounge-suite?sub=armchairs' },
      { label: 'Coffee Tables', href: '/category/lounge-suite?sub=coffee-tables' },
    ],
  },
  {
    label: 'Bedroom',
    href: '/category/bedroom',
    subcategories: [
      { label: 'All Bedroom', href: '/category/bedroom' },
      { label: 'Bed Frames', href: '/category/bedroom?sub=bed-frames' },
      { label: 'Mattresses', href: '/category/bedroom?sub=mattresses' },
      { label: 'Bedroom Sets', href: '/category/bedroom?sub=bedroom-sets' },
    ],
  },
  {
    label: 'Dining',
    href: '/category/dining',
    subcategories: [
      { label: 'All Dining', href: '/category/dining' },
      { label: 'Dining Suites', href: '/category/dining?sub=dining-suites' },
      { label: 'Dining Tables', href: '/category/dining?sub=dining-tables' },
      { label: 'Dining Chairs', href: '/category/dining?sub=dining-chairs' },
    ],
  },
  {
    label: 'Living',
    href: '/category/living',
    subcategories: [
      { label: 'All Living', href: '/category/living' },
      { label: 'Coffee Tables', href: '/category/living?sub=coffee-tables' },
      { label: 'Console Tables', href: '/category/living?sub=console-tables' },
      { label: 'Bar Stools', href: '/category/living?sub=bar-stools' },
    ],
  },
]

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedCat, setExpandedCat] = useState(null)
  const [hoveredMenu, setHoveredMenu] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [panelTop, setPanelTop] = useState(98)
  const headerRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        setPanelTop(rect.bottom)
      }
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isHome = location.pathname === '/'

  const handleNavClick = (href) => {
    setMenuOpen(false)
    setHoveredMenu(null)
    setExpandedCat(null)
    if (href.startsWith('/')) {
      navigate(href)
    } else if (isHome) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/' + href)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      <div className="announcement-bar">
        Welcome to AF Furnishings <span>&#8226;</span> Quality pieces for every home
      </div>
      <header ref={headerRef} className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          &#9776;
        </button>
        <Link className="logo" to="/">
          <img src="/logo.png" alt="AF Furnishings" />
        </Link>

        <nav className="desktop-nav">
          <Link to="/" onClick={() => { setHoveredMenu(null) }}>Home</Link>
          {navCategories.map((cat) => (
            <div
              key={cat.label}
              className="nav-dropdown"
              onMouseEnter={() => setHoveredMenu(cat.label)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <span className="nav-dropdown-trigger" onClick={() => handleNavClick(cat.href)}>
                {cat.label} <span className="dropdown-arrow">&#9662;</span>
              </span>
              {hoveredMenu === cat.label && (
                <div className="dropdown-menu">
                  {cat.subcategories.map((sub) => (
                    <a key={sub.label} href={sub.href} onClick={(e) => { e.preventDefault(); handleNavClick(sub.href) }}>
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/winz">WinZ</Link>
          <a className="sale-link" href="/on-sale" onClick={(e) => { e.preventDefault(); handleNavClick('/on-sale') }}>On Sale!</a>
        </nav>

        <div className="header-tools">
          <div className="header-tools-top">
            <button className="header-search-toggle" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <Link to="/apply-for-finance" className="btn-finance">Apply for Finance</Link>
          </div>
          <div className="header-tools-bottom">
            <form className="header-search-bar-desktop" onSubmit={handleSearch}>
              <input type="search" placeholder="Search Here..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </form>
            <div className="header-social-icons">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="header-social-icon" title="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="header-social-icon" title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="header-search-bar">
            <form onSubmit={handleSearch}>
              <input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              <button type="submit">Search</button>
            </form>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="mobile-nav-overlay">
          <div className="mobile-nav-panel" style={{ top: panelTop + 'px', maxHeight: `calc(100vh - ${panelTop}px)` }}>
            <Link className="mobile-nav-finance" to="/apply-for-finance" onClick={() => setMenuOpen(false)}>APPLY FOR FINANCE</Link>
            <a className="mobile-nav-item" href="/" onClick={(e) => { e.preventDefault(); handleNavClick('/') }}>HOME</a>
            {navCategories.map((cat) => (
              <div key={cat.label} className="mobile-nav-item-group">
                <div className="mobile-nav-item" onClick={() => setExpandedCat(expandedCat === cat.label ? null : cat.label)}>
                  <span>{cat.label.toUpperCase()}</span>
                  <span className={`mobile-nav-arrow ${expandedCat === cat.label ? 'open' : ''}`}>&#9662;</span>
                </div>
                {expandedCat === cat.label && (
                  <div className="mobile-nav-sub">
                    {cat.subcategories.map((sub) => (
                      <a key={sub.label} href={sub.href} onClick={(e) => { e.preventDefault(); handleNavClick(sub.href) }}>
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a className="mobile-nav-item" href="/winz" onClick={(e) => { e.preventDefault(); handleNavClick('/winz') }}>WINZ</a>
            <a className="mobile-nav-sale" href="/on-sale" onClick={(e) => { e.preventDefault(); handleNavClick('/on-sale') }}>ON SALE!</a>
          </div>
          <div className="mobile-nav-backdrop" onClick={() => { setMenuOpen(false); setExpandedCat(null) }} />
        </div>
      )}
    </>
  )
}

export default Header
