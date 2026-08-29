import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../config'

const defaultProducts = [
  { id: 1, name: 'Marina Lounge Chair', mrp: 1299, selling_price: 1099, images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80'], material: 'Oak Wood', color: 'Grey', category_name: 'Living Room' },
  { id: 2, name: 'Haven Three Seat Sofa', mrp: 2499, selling_price: 2199, images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'], material: 'Pine Wood', color: 'Green', category_name: 'Living Room' },
  { id: 3, name: 'Ember Two Seat Sofa', mrp: 1899, selling_price: 1699, images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80'], material: 'Metal Frame', color: 'Charcoal', category_name: 'Living Room' },
  { id: 4, name: 'Harbour Corner Sofa', mrp: 3299, selling_price: 2899, images: ['https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80'], material: 'Oak Wood', color: 'Beige', category_name: 'Living Room' },
]

function getWishlist() {
  try { return JSON.parse(localStorage.getItem('af_wishlist') || '[]') } catch { return [] }
}
function toggleWishlist(id) {
  const list = getWishlist()
  const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
  localStorage.setItem('af_wishlist', JSON.stringify(next))
  return next
}

function ProductGrid({ sectionId, label, title, category, compact }) {
  const [products, setProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef(null)
  const [slidesPerView, setSlidesPerView] = useState(4)
  const [wishlist, setWishlist] = useState(getWishlist)

  useEffect(() => {
    const updateSPV = () => {
      if (window.innerWidth < 600) setSlidesPerView(1)
      else if (window.innerWidth < 900) setSlidesPerView(2)
      else setSlidesPerView(4)
    }
    updateSPV()
    window.addEventListener('resize', updateSPV)
    return () => window.removeEventListener('resize', updateSPV)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = category
          ? `${API_BASE}/api/products?category=${encodeURIComponent(category)}&limit=8`
          : `${API_BASE}/api/products?limit=8`
        const res = await fetch(url)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) setProducts(data)
      } catch {}
    }
    fetchProducts()
  }, [category])

  const displayProducts = products.length > 0 ? products : defaultProducts
  const maxSlide = Math.max(0, displayProducts.length - slidesPerView)

  const nextSlide = () => {
    const next = Math.min(currentSlide + 1, maxSlide)
    setCurrentSlide(next)
    scrollToSlide(next)
  }
  const prevSlide = () => {
    const prev = Math.max(currentSlide - 1, 0)
    setCurrentSlide(prev)
    scrollToSlide(prev)
  }

  const scrollToSlide = (index) => {
    if (!sliderRef.current) return
    const track = sliderRef.current
    const cardWidth = track.scrollWidth / displayProducts.length
    track.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!sliderRef.current) return
    const track = sliderRef.current
    const cardWidth = track.scrollWidth / displayProducts.length
    const idx = Math.round(track.scrollLeft / cardWidth)
    setCurrentSlide(Math.min(idx, maxSlide))
  }

  const getWeeklyPrice = (price) => {
    if (!price) return null
    return Math.ceil(Number(price) / 52)
  }

  const getImg = (p) => {
    if (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) return p.images[0]
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  }

  const getColorHex = (name) => {
    const map = {
      'White': '#FFFFFF', 'Black': '#1a1a1a', 'Grey': '#808080', 'Charcoal': '#36454F',
      'Beige': '#F5F5DC', 'Cream': '#FFFDD0', 'Brown': '#6B4226', 'Walnut': '#5B4332',
      'Oak': '#C19A6B', 'Tan': '#D2B48C', 'Red': '#C0392B', 'Navy Blue': '#1B2A4A',
      'Blue': '#2E86C1', 'Green': '#27AE60', 'Teal': '#1ABC9C', 'Gold': '#AA7A3E',
    }
    return map[name] || '#ccc'
  }

  const handleWishlist = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    const next = toggleWishlist(id)
    setWishlist(next)
  }

  return (
    <section className={`products ${compact ? 'compact' : ''}`} id={sectionId}>
      {label && (
        <div className="section-title">
          <span>{label}</span>
          {title && <h2>{title}</h2>}
        </div>
      )}

      <div className="product-slider-wrapper">
        <div className="product-slider" ref={sliderRef} onScroll={handleScroll}>
          {displayProducts.map((p) => {
            const imgSrc = getImg(p)
            const weekly = getWeeklyPrice(p.selling_price || p.mrp)
            const hasDiscount = p.selling_price && p.mrp && Number(p.selling_price) < Number(p.mrp)
            const isWished = wishlist.includes(p.id)
            return (
              <article key={p.id} className="product-card">
                <Link to={`/product/${p.slug || p.id}`} className="product-card-img">
                  <img src={imgSrc} alt={p.name} loading="lazy" />
                  {hasDiscount && <span className="product-badge">SALE</span>}
                  <button className={`wishlist-btn ${isWished ? 'active' : ''}`} onClick={(e) => handleWishlist(e, p.id)} title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isWished ? '#ef4444' : 'none'} stroke={isWished ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  </button>
                </Link>
                <div className="product-card-body">
                  <Link to={`/product/${p.slug || p.id}`} className="product-card-link">
                    <h3>{p.name}</h3>
                  </Link>
                  <p className="product-card-desc">{p.description ? p.description.substring(0, 80) + (p.description.length > 80 ? '...' : '') : ''}</p>
                  <div className="product-pricing">
                    {p.selling_price && (
                      <span className="product-price">${Number(p.selling_price).toLocaleString()}</span>
                    )}
                    {p.mrp && p.selling_price && Number(p.mrp) !== Number(p.selling_price) && (
                      <span className="product-mrp">${Number(p.mrp).toLocaleString()}</span>
                    )}
                    {!p.selling_price && p.mrp && (
                      <span className="product-price">${Number(p.mrp).toLocaleString()}</span>
                    )}
                    {hasDiscount && (
                      <span className="product-discount-tag">-{Math.round(((Number(p.mrp) - Number(p.selling_price)) / Number(p.mrp)) * 100)}%</span>
                    )}
                  </div>
                  <Link to={`/product/${p.slug || p.id}`} className="btn-shop-now">Enquire Now</Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className="slider-arrows-below">
        <button className="arrow-btn-below" onClick={prevSlide} disabled={currentSlide === 0}>&#8249;</button>
        <button className="arrow-btn-below" onClick={nextSlide} disabled={currentSlide >= maxSlide}>&#8250;</button>
      </div>

    </section>
  )
}

export default ProductGrid
