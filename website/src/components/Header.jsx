import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'
import { getJson } from '../api'

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedCat, setExpandedCat] = useState(null)
  const [hoveredMenu, setHoveredMenu] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [panelTop, setPanelTop] = useState(98)
  const [allCategories, setAllCategories] = useState([])
  const [headerCatIds, setHeaderCatIds] = useState([])
  const [settings, setSettings] = useState({})
  const [logoUrl, setLogoUrl] = useState('/logo.webp')
  const [socialLinks, setSocialLinks] = useState([])
  const headerRef = useRef(null)
  const searchRef = useRef(null)
  const searchTimerRef = useRef(null)
  const searchControllerRef = useRef(null)
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

  useEffect(() => {
    const loadAll = () => {
      Promise.all([
        getJson('/api/categories').catch(() => []),
        getJson('/api/settings').catch(() => ({})),
        getJson('/api/social').catch(() => []),
      ]).then(([cats, settingsData, socials]) => {
        if (Array.isArray(cats)) {
          const all = cats.map((cat) => {
            const catSlug = slugify(cat.name)
            const allSub = { label: `All ${cat.name}`, href: `/category/${catSlug}` }
            const subs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0
              ? cat.subcategories.map(s => ({
                  label: s.name,
                  href: `/category/${catSlug}?sub_id=${s.id}`,
                }))
              : []
            return {
              id: cat.id,
              label: cat.name,
              href: `/category/${catSlug}`,
              subcategories: [allSub, ...subs],
            }
          })
          setAllCategories(all)
        }
        if (settingsData) {
          setSettings(settingsData)
          if (settingsData.site_logo) {
            setLogoUrl(getAssetUrl(settingsData.site_logo))
          }
          if (settingsData.header_categories) {
            try {
              const ids = JSON.parse(settingsData.header_categories)
              setHeaderCatIds(Array.isArray(ids) ? ids : [])
            } catch {}
          }
        }
        if (Array.isArray(socials)) setSocialLinks(socials)
      })
    }
    loadAll()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (searchControllerRef.current) searchControllerRef.current.abort()
    if (searchQuery.trim().length >= 1) {
      setSearchLoading(true)
      searchTimerRef.current = setTimeout(() => {
        const controller = new AbortController()
        searchControllerRef.current = controller
        fetch(`${API_BASE}/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6`, { cache: 'no-store', signal: controller.signal })
          .then(r => r.json())
          .then(data => {
            const products = data.products || (Array.isArray(data) ? data : [])
            setSearchSuggestions(products.slice(0, 6))
            setShowSuggestions(true)
            setSearchLoading(false)
          })
          .catch((err) => {
            if (err && err.name === 'AbortError') return
            setSearchSuggestions([])
            setSearchLoading(false)
          })
      }, 300)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
      setSearchLoading(false)
    }
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      if (searchControllerRef.current) searchControllerRef.current.abort()
    }
  }, [searchQuery])

  const isHome = location.pathname === '/'

  const topCategories = headerCatIds.length > 0
    ? headerCatIds.map(id => allCategories.find(c => c.id === id)).filter(Boolean)
    : allCategories

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
      setShowSuggestions(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getSocialIcon = (platform) => {
    const key = (platform || '').toLowerCase()
    if (key === 'instagram') return <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="20" height="20" />
    if (key === 'facebook') return <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="20" height="20" />
    return null
  }

  return (
    <>
      <div className="announcement-bar">
        {settings.announcement_bar_text || 'Welcome to AF Furnishings'}
      </div>
      <header ref={headerRef} className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          &#9776;
        </button>
        <Link className="logo" to="/">
          <img src={logoUrl} alt="AF Furnishings" />
        </Link>

        <nav className="desktop-nav">
          {allCategories.map((cat) => (
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
            <div className="header-social-icons">
              {socialLinks.filter(link => ['instagram', 'facebook'].includes((link.platform || '').toLowerCase())).map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="header-social-icon" title={link.platform}>
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
            <Link to="/apply-for-finance" className="btn-finance">Apply for Finance</Link>
          </div>
          <div className="header-tools-bottom">
          <div className="header-search-wrapper" ref={searchRef}>
              <form className="header-search-bar-desktop" onSubmit={handleSearch}>
                <input type="search" placeholder="Search Here..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => { if (searchQuery.trim().length >= 1 && searchSuggestions.length > 0) setShowSuggestions(true) }} />
                <button type="submit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </form>
              {showSuggestions && (searchSuggestions.length > 0 || searchLoading) && (
                <div className="search-suggestions-dropdown">
                  {searchLoading ? (
                    <div className="search-suggestion-loading">Searching...</div>
                  ) : (
                    searchSuggestions.map(p => {
                      const imgSrc = (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) ? getAssetUrl(p.images[0]) : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'
                      return (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug || p.id}`}
                          className="search-suggestion-item"
                          onClick={() => { setShowSuggestions(false); setSearchQuery('') }}
                        >
                          <img src={imgSrc} alt={p.name} className="search-suggestion-img" />
                          <div className="search-suggestion-info">
                            <span className="search-suggestion-name">{p.name}</span>
                            <span className="search-suggestion-price">${Number(p.selling_price || p.mrp || 0).toLocaleString()}</span>
                          </div>
                        </Link>
                      )
                    })
                  )}
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    className="search-suggestion-all"
                    onClick={() => { setShowSuggestions(false) }}
                  >
                    View all results for &quot;{searchQuery.trim()}&quot;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="header-search-bar">
            <form onSubmit={handleSearch}>
              <input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus onFocus={() => { if (searchQuery.trim().length >= 1 && searchSuggestions.length > 0) setShowSuggestions(true) }} />
              <button type="submit">Search</button>
            </form>
            {showSuggestions && (searchSuggestions.length > 0 || searchLoading) && (
              <div className="search-suggestions-dropdown mobile">
                {searchLoading ? (
                  <div className="search-suggestion-loading">Searching...</div>
                ) : (
                    searchSuggestions.map(p => {
                      const imgSrc = (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) ? getAssetUrl(p.images[0]) : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'
                    return (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug || p.id}`}
                        className="search-suggestion-item"
                        onClick={() => { setShowSuggestions(false); setSearchQuery(''); setSearchOpen(false) }}
                      >
                        <img src={imgSrc} alt={p.name} className="search-suggestion-img" />
                        <div className="search-suggestion-info">
                          <span className="search-suggestion-name">{p.name}</span>
                          <span className="search-suggestion-price">${Number(p.selling_price || p.mrp || 0).toLocaleString()}</span>
                        </div>
                      </Link>
                    )
                  })
                )}
                <Link
                  to={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                  className="search-suggestion-all"
                  onClick={() => { setShowSuggestions(false); setSearchOpen(false) }}
                >
                  View all results for &quot;{searchQuery.trim()}&quot;
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="mobile-nav-overlay">
          <div className="mobile-nav-panel" style={{ top: panelTop + 'px', maxHeight: `calc(100vh - ${panelTop}px)` }}>
            <Link className="mobile-nav-finance" to="/apply-for-finance" onClick={() => setMenuOpen(false)}>APPLY FOR FINANCE</Link>
            {allCategories.map((cat) => (
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
