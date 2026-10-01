import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'
import { getJson } from '../api'
import { stripHtml } from '../utils'
import Header from '../components/Header'
import Footer from '../components/Footer'

const defaultColors = ['Beige', 'Brown', 'Grey', 'Tan', 'White', 'Black', 'Cream', 'Walnut', 'Oak']
const defaultSizes = ['Small', 'Medium', 'Large', 'Extra Large']

function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const subSlug = searchParams.get('sub') || ''
  const subId = searchParams.get('sub_id') || searchParams.get('subcategory_id') || ''
  const currentPage = parseInt(searchParams.get('page')) || 1

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('default')
  const [selectedColors, setSelectedColors] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 9999 })
  const [showFilters, setShowFilters] = useState({ categories: true, price: true, color: true, size: true })
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [adCampaigns, setAdCampaigns] = useState([])
  const [apiSubcategories, setApiSubcategories] = useState([])
  const [dbCategory, setDbCategory] = useState(null)

  const displayTitle = dbCategory?.name || slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Our Collection'
  const displaySubtitle = dbCategory?.description || 'Quality furniture for your home'
  const displayImage = dbCategory?.image
  const apiCategory = dbCategory?.name || slug

  const PER_PAGE = 12

  useEffect(() => {
    getJson('/api/categories')
      .then(data => {
        if (Array.isArray(data)) {
          const match = data.find(c => {
            const cSlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
            return cSlug === slug || c.name.toLowerCase().replace(/\s+/g, '-') === slug
          })
          if (match) {
            setDbCategory(match)
            if (match.subcategories) setApiSubcategories(match.subcategories)
          }
        }
      })
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    const controller = new AbortController()
    const fetchProducts = async () => {
      setLoading(true)
      try {
        let url = `${API_BASE}/api/products?category=${encodeURIComponent(apiCategory)}&page=${currentPage}&per_page=${PER_PAGE}`
        if (subId) url += `&subcategory_id=${subId}`
        else if (subSlug) url += `&subcategory=${subSlug}`
        const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
        const data = await res.json()
        if (data.products) {
          setProducts(data.products)
          setPagination(data.pagination)
        } else {
          setProducts(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (err && err.name === 'AbortError') return
        setProducts([])
      }
      setLoading(false)
    }
    fetchProducts()
    window.scrollTo(0, 0)
    return () => controller.abort()
  }, [apiCategory, subSlug, subId, currentPage])

  // Ad campaigns are position-wide (not per category/page) - load once per mount.
  useEffect(() => {
    let cancelled = false
    getJson('/api/ad-campaigns/active?position=category_detail')
      .then(data => { if (!cancelled && Array.isArray(data)) setAdCampaigns(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    let list = products
    if (selectedColors.length > 0) {
      list = list.filter(p => selectedColors.includes(p.color))
    }
    if (priceRange.min > 0 || priceRange.max < 9999) {
      list = list.filter(p => {
        const price = p.selling_price || p.mrp || 0
        return price >= priceRange.min && price <= priceRange.max
      })
    }

    if (sortBy === 'price-low') list = [...list].sort((a, b) => (a.selling_price || a.mrp) - (b.selling_price || b.mrp))
    else if (sortBy === 'price-high') list = [...list].sort((a, b) => (b.selling_price || b.mrp) - (a.selling_price || a.mrp))
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))

    return list
  }, [products, selectedColors, priceRange, sortBy])

  // Strip HTML once per products/filter change instead of on every keystroke.
  const visibleProducts = useMemo(() => filtered.map((p) => {
    const desc = stripHtml(p.description)
    return {
      ...p,
      shortDesc: desc
        ? (desc.length > 80 ? desc.substring(0, 80) + '...' : desc)
        : `Comfortable ${p.category_name || 'furniture'} piece.`,
    }
  }), [filtered])

  const getImg = (p) => {
    if (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) return getAssetUrl(p.images[0])
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  }

  const getColorHex = (raw) => {
    if (!raw) return '#ccc'
    const hexMatch = raw.match(/#([0-9A-Fa-f]{6})/)
    if (hexMatch) return hexMatch[0]
    const map = { 'White': '#FFFFFF', 'Black': '#1a1a1a', 'Grey': '#808080', 'Charcoal': '#36454F', 'Beige': '#F5F5DC', 'Cream': '#FFFDD0', 'Brown': '#6B4226', 'Walnut': '#5B4332', 'Oak': '#C19A6B', 'Tan': '#D2B48C', 'Natural': '#C19A6B' }
    for (const [name, hex] of Object.entries(map)) {
      if (raw.toLowerCase().includes(name.toLowerCase())) return hex
    }
    return '#ccc'
  }
  const getColorName = (raw) => {
    if (!raw) return ''
    const hexMatch = raw.match(/#([0-9A-Fa-f]{6})/)
    if (hexMatch) return raw.replace(hexMatch[0], '').replace(/[()]/g, '').trim()
    return raw
  }

  const toggleColor = (color) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
  }

  const clearFilters = () => {
    setSelectedColors([])
    setPriceRange({ min: 0, max: 9999 })
  }

  const handleSubcatClick = (subSlug, subCategoryId) => {
    if (subCategoryId) {
      const params = new URLSearchParams(searchParams)
      params.set('sub_id', subCategoryId)
      params.delete('sub')
      setSearchParams(params)
    } else if (subSlug) {
      const params = new URLSearchParams(searchParams)
      params.set('sub', subSlug)
      params.delete('sub_id')
      setSearchParams(params)
    } else {
      setSearchParams({})
    }
  }

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams)
    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', page)
    }
    setSearchParams(params)
  }

  const subcategories = useMemo(() => (
    apiSubcategories.length > 0
      ? [{ name: `All ${displayTitle}`, id: null, slug: '' }, ...apiSubcategories.map(s => ({ name: s.name, id: s.id, slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))]
      : []
  ), [apiSubcategories, displayTitle])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="catalog-hero" style={displayImage ? { backgroundImage: `url(${getAssetUrl(displayImage)})` } : undefined}>
          <div className="catalog-hero-inner">
            <span className="catalog-hero-label">{displayTitle.toUpperCase()}</span>
            <h1>{displayTitle}</h1>
            {displaySubtitle && <p>{displaySubtitle}</p>}
          </div>
        </section>

        <section className="catalog-page">
          <div className="catalog-page-header">
            <div className="catalog-page-header-left">
              <button className="mobile-filter-toggle" onClick={() => setMobileFilterOpen(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="12" y2="18"/>
                </svg>
                Filters
              </button>
              <span className="catalog-count">{pagination.total || filtered.length} products</span>
            </div>
            <div className="catalog-sort">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          <div className={`mobile-filter-overlay${mobileFilterOpen ? ' open' : ''}`} onClick={() => setMobileFilterOpen(false)} />

          <div className="catalog-layout">
            <aside className={`catalog-sidebar${mobileFilterOpen ? ' mobile-open' : ''}`}>
              <div className="mobile-filter-header">
                <h3>Filters</h3>
                <button className="mobile-filter-close" onClick={() => setMobileFilterOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="filter-section">
                <h3 className="filter-title" onClick={() => setShowFilters(s => ({...s, categories: !s.categories}))}>
                  CATEGORIES
                  <span>{showFilters.categories ? '−' : '+'}</span>
                </h3>
                {showFilters.categories && (
                  <div className="filter-content">
                    {subcategories.length > 0 ? subcategories.map((sub) => {
                      const isActive = sub.id ? String(subId) === String(sub.id) : (sub.slug ? subSlug === sub.slug : !subSlug && !sub.slug)
                      return (
                        <label
                          key={sub.slug || sub.id || 'all'}
                          className={`filter-option${isActive ? ' active' : ''}`}
                          onClick={() => handleSubcatClick(sub.slug, sub.id)}
                        >
                          {sub.name}
                        </label>
                      )
                    }) : (
                      <label className="filter-option active">{displayTitle}</label>
                    )}
                  </div>
                )}
              </div>

              <div className="filter-section">
                <h3 className="filter-title" onClick={() => setShowFilters(s => ({...s, price: !s.price}))}>
                  PRICE
                  <span>{showFilters.price ? '−' : '+'}</span>
                </h3>
                {showFilters.price && (
                  <div className="filter-content">
                    <label className="filter-label">Min</label>
                    <input type="number" className="filter-input" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})} />
                    <label className="filter-label">Max</label>
                    <input type="number" className="filter-input" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})} />
                  </div>
                )}
              </div>

              <div className="filter-section">
                <h3 className="filter-title" onClick={() => setShowFilters(s => ({...s, color: !s.color}))}>
                  COLOUR
                  <span>{showFilters.color ? '−' : '+'}</span>
                </h3>
                {showFilters.color && (
                  <div className="filter-content">
                    {defaultColors.map(color => (
                      <label key={color} className="filter-checkbox">
                        <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => toggleColor(color)} />
                        <span className="color-dot" style={{ background: getColorHex(color) }}></span>
                        {getColorName(color)}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="filter-section">
                <h3 className="filter-title" onClick={() => setShowFilters(s => ({...s, size: !s.size}))}>
                  SIZE
                  <span>{showFilters.size ? '−' : '+'}</span>
                </h3>
                {showFilters.size && (
                  <div className="filter-content">
                    {defaultSizes.map(size => (
                      <label key={size} className="filter-checkbox">
                        <input type="checkbox" checked={false} onChange={() => {}} />
                        {size}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button className="filter-clear-btn" onClick={clearFilters}>Clear Filters</button>
            </aside>

            <div className="catalog-main">
              {loading ? (
                <div className="category-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading products...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="category-empty">
                  <h3>No products found</h3>
                  <p>Check back later for new arrivals in this category.</p>
                  <button className="primary" onClick={clearFilters}>Clear Filters</button>
                </div>
              ) : (
                <>
                  <div className="catalog-grid">
                    {visibleProducts.map(p => {
                      const imgSrc = getImg(p)
                      const hasDiscount = p.selling_price && p.mrp && Number(p.selling_price) < Number(p.mrp)
                      const price = p.selling_price || p.mrp
                      const shortDesc = p.shortDesc
                      return (
                        <article key={p.id} className="catalog-card">
                          <Link to={`/product/${p.slug || p.id}`} className="catalog-card-image">
                            <img src={imgSrc} alt={p.name} loading="lazy" />
                          </Link>
                          <div className="catalog-card-body">
                            <Link to={`/product/${p.slug || p.id}`} className="catalog-card-title">{p.name}</Link>
                            <p className="catalog-card-desc">{shortDesc}</p>
                            <div className="catalog-card-pricing">
                              {hasDiscount ? (
                                <>
                                  <span className="catalog-price">${Number(p.selling_price).toLocaleString()}</span>
                                  <span className="catalog-from" style={{ textDecoration: 'line-through', opacity: 0.6 }}>${Number(p.mrp).toLocaleString()}</span>
                                </>
                              ) : (
                                <span className="catalog-price">${Number(price).toLocaleString()}</span>
                              )}
                            </div>
                            <Link to={`/product/${p.slug || p.id}`} className="catalog-enquire-btn">Enquire Now</Link>
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  {adCampaigns.length > 0 && (
                    <div className="category-ad-banners">
                      {adCampaigns.map(ad => (
                        <a key={ad.id} href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="home-ad-banner">
                          <img src={getAssetUrl(ad.image)} alt={ad.name} />
                        </a>
                      ))}
                    </div>
                  )}

                  {pagination.total_pages > 1 && (
                    <div className="catalog-pagination">
                      <button
                        className="page-arrow"
                        disabled={currentPage <= 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"/>
                        </svg>
                      </button>
                      {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`page-num${page === currentPage ? ' active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        className="page-arrow"
                        disabled={currentPage >= pagination.total_pages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default CategoryPage
