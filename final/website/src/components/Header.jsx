import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { API_BASE } from '../config'

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const HARDCODED_CATS = ['Bedroom', 'Dining', 'Living Room']

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
  const [hardcodedCats, setHardcodedCats] = useState([])
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [socialLinks, setSocialLinks] = useState([])
  const [settings, setSettings] = useState({})
  const API_URL = API_BASE
  const headerRef = useRef(null)
  const searchRef = useRef(null)
  const searchTimerRef = useRef(null)
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
        fetch(`${API_BASE}/api/categories`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/subcategories`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/settings`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/social`).then(r => r.json()).catch(() => []),
      ]).then(([cats, subs, fetchedSettings, socials]) => {
        if (fetchedSettings && typeof fetchedSettings === 'object') {
          setSettings(fetchedSettings)
        }
        if (Array.isArray(cats)) {
          const allSubs = Array.isArray(subs) ? subs : []
          const buildCat = (cat) => {
            const catSlug = slugify(cat.name)
            const catSubs = allSubs.filter(s => String(s.category_id) === String(cat.id))
            return {
              label: cat.name,
              href: `/category/${catSlug}`,
              subcategories: [
                { label: `All ${cat.name}`, href: `/category/${catSlug}` },
                ...catSubs.map(sub => ({
                  label: sub.name,
                  href: `/category/${catSlug}?sub_id=${sub.id}`,
                })),
              ],
            }
          }
          const all = cats.map(buildCat)
          setAllCategories(all)
          setHardcodedCats(all.filter(c => HARDCODED_CATS.includes(c.label)))
        }
        if (fetchedSettings?.site_logo) {
          const logo = fetchedSettings.site_logo.startsWith('http') ? fetchedSettings.site_logo : `${API_BASE}${fetchedSettings.site_logo}`
          setLogoUrl(logo)
          localStorage.setItem('site_logo', logo)
        }
        if (Array.isArray(socials)) setSocialLinks(socials)
      })
    }
    loadAll()
    const onLogoUpdate = () => {
      const cached = localStorage.getItem('site_logo')
      if (cached) setLogoUrl(cached)
      loadAll()
    }
    const logoInterval = setInterval(() => {
      fetch(`${API_BASE}/api/settings`).then(r => r.json()).then(d => {
        if (d && typeof d === 'object') {
          setSettings(d)
          if (d.site_logo) {
            const logo = d.site_logo.startsWith('http') ? d.site_logo : `${API_BASE}${d.site_logo}`
            if (logo !== localStorage.getItem('site_logo')) {
              localStorage.setItem('site_logo', logo)
              setLogoUrl(logo)
            }
          }
        }
      }).catch(() => {})
    }, 15000)
    window.addEventListener('logo-updated', onLogoUpdate)
    window.addEventListener('storage', onLogoUpdate)
    return () => {
      clearInterval(logoInterval)
      window.removeEventListener('logo-updated', onLogoUpdate)
      window.removeEventListener('storage', onLogoUpdate)
    }
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
    if (searchQuery.trim().length >= 1) {
      setSearchLoading(true)
      searchTimerRef.current = setTimeout(() => {
        fetch(`${API_BASE}/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6`)
          .then(r => r.json())
          .then(data => {
            const products = data.products || (Array.isArray(data) ? data : [])
            setSearchSuggestions(products.slice(0, 6))
            setShowSuggestions(true)
            setSearchLoading(false)
          })
          .catch(() => { setSearchSuggestions([]); setSearchLoading(false) })
      }, 300)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [searchQuery])

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
      setShowSuggestions(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getSocialIcon = (platform) => {
    const icons = {
      instagram: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
      facebook: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
      twitter: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    }
    return icons[platform?.toLowerCase()] || <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
  }

  return (
    <>
      <div className="announcement-bar">
        {settings?.announcement_bar || <>Welcome to AF Furnishings <span>&#8226;</span> Quality pieces for every home</>}
      </div>
      <header ref={headerRef} className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          &#9776;
        </button>
        <Link className="logo" to="/">
          <img src={logoUrl} alt={settings?.site_name || "AF Furnishings"} />
        </Link>

        <nav className="desktop-nav">
          <Link to="/" onClick={() => { setHoveredMenu(null) }}>Home</Link>
          {hardcodedCats.map((cat) => (
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
          <div
            className="nav-dropdown"
            onMouseEnter={() => setHoveredMenu('all-categories')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <span className="nav-dropdown-trigger">
              All Categories <span className="dropdown-arrow">&#9662;</span>
            </span>
            {hoveredMenu === 'all-categories' && (
              <div className="dropdown-menu">
                {allCategories.map((cat) => (
                  <a key={cat.label} href={cat.href} onClick={(e) => { e.preventDefault(); handleNavClick(cat.href) }}>
                    {cat.label}
                  </a>
                ))}
              </div>
            )}
          </div>
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
                      const imgSrc = (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) ? p.images[0] : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'
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
            <div className="header-social-icons">
              {socialLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="header-social-icon" title={link.platform}>
                  {getSocialIcon(link.platform)}
                </a>
              ))}
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
                    const imgSrc = (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) ? p.images[0] : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'
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
            <a className="mobile-nav-item" href="/" onClick={(e) => { e.preventDefault(); handleNavClick('/') }}>HOME</a>
            {hardcodedCats.map((cat) => (
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
            <div className="mobile-nav-item-group">
              <div className="mobile-nav-item" onClick={() => setExpandedCat(expandedCat === 'all-categories' ? null : 'all-categories')}>
                <span>ALL CATEGORIES</span>
                <span className={`mobile-nav-arrow ${expandedCat === 'all-categories' ? 'open' : ''}`}>&#9662;</span>
              </div>
              {expandedCat === 'all-categories' && (
                <div className="mobile-nav-sub">
                  {allCategories.map((cat) => (
                    <a key={cat.label} href={cat.href} onClick={(e) => { e.preventDefault(); handleNavClick(cat.href) }}>
                      {cat.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
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
