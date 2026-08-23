import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const navCategories = [
  {
    label: 'Bedroom',
    href: '#bedroom-products',
    subcategories: [
      { label: 'All Bedroom', href: '#bedroom-products' },
      { label: 'Bed Frames', href: '#bedroom-products' },
      { label: 'Mattresses', href: '#bedroom-products' },
      { label: 'Bedroom Sets', href: '#bedroom-products' },
    ],
  },
  {
    label: 'Dining',
    href: '#dining-products',
    subcategories: [
      { label: 'All Dining', href: '#dining-products' },
      { label: 'Dining Suites', href: '#dining-products' },
      { label: 'Dining Tables', href: '#dining-products' },
      { label: 'Dining Chairs', href: '#dining-products' },
    ],
  },
  {
    label: 'Living',
    href: '#sofas',
    subcategories: [
      { label: 'All Living', href: '#sofas' },
      { label: 'Coffee Tables', href: '#sofas' },
      { label: 'Console Tables', href: '#sofas' },
      { label: 'Bar Stools', href: '#sofas' },
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
      if (isHome) {
        const el = document.getElementById('sofas')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/#sofas')
      }
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
          <Link to="/about">About</Link>
          <a className="sale-link" href="#deals" onClick={(e) => { e.preventDefault(); handleNavClick('#deals') }}>On Sale!</a>
        </nav>

        <div className="header-tools">
          <form className="header-search-bar-desktop" onSubmit={handleSearch}>
            <input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>
          <button className="header-search-toggle" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <a href="#deals" className="btn-finance" onClick={(e) => { e.preventDefault(); handleNavClick('#deals') }}>Apply for finance</a>
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
            <a className="mobile-nav-finance" href="#deals" onClick={(e) => { e.preventDefault(); handleNavClick('#deals') }}>APPLY FOR FINANCE</a>
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
            <a className="mobile-nav-item" href="/about" onClick={(e) => { e.preventDefault(); handleNavClick('/about') }}>ABOUT</a>
            <a className="mobile-nav-sale" href="#deals" onClick={(e) => { e.preventDefault(); handleNavClick('#deals') }}>ON SALE!</a>
          </div>
          <div className="mobile-nav-backdrop" onClick={() => { setMenuOpen(false); setExpandedCat(null) }} />
        </div>
      )}
    </>
  )
}

export default Header
