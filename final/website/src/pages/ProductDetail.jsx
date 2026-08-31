import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import EnquiryModal from '../components/EnquiryModal'

const fallbackImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'

function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem('af_recently_viewed') || '[]') } catch { return [] }
}

function addToRecentlyViewed(product) {
  const list = getRecentlyViewed().filter(p => p.id !== product.id)
  list.unshift({ id: product.id, slug: product.slug, name: product.name, mrp: product.mrp, selling_price: product.selling_price, images: product.images, category_name: product.category_name })
  localStorage.setItem('af_recently_viewed', JSON.stringify(list.slice(0, 8)))
}

const colorMap = {
  'White': '#FFFFFF', 'Black': '#1a1a1a', 'Grey': '#808080', 'Charcoal': '#36454F',
  'Beige': '#F5F5DC', 'Cream': '#FFFDD0', 'Brown': '#6B4226', 'Walnut': '#5B4332',
  'Oak': '#C19A6B', 'Tan': '#D2B48C', 'Red': '#C0392B', 'Navy Blue': '#1B2A4A',
  'Blue': '#2E86C1', 'Green': '#27AE60', 'Teal': '#1ABC9C', 'Gold': '#AA7A3E',
}
function getColorHex(raw) {
  if (!raw) return '#ccc'
  const hexMatch = raw.match(/#([0-9A-Fa-f]{6})/)
  if (hexMatch) return hexMatch[0]
  for (const [name, hex] of Object.entries(colorMap)) {
    if (raw.toLowerCase().includes(name.toLowerCase())) return hex
  }
  return '#ccc'
}
function getColorName(raw) {
  if (!raw) return ''
  const hexMatch = raw.match(/#([0-9A-Fa-f]{6})/)
  if (hexMatch) return raw.replace(hexMatch[0], '').replace(/[()]/g, '').trim()
  return raw
}

function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [related, setRelated] = useState([])
  const [allCategoryProducts, setAllCategoryProducts] = useState([])
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedConfig, setSelectedConfig] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [adCampaigns, setAdCampaigns] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState(getRecentlyViewed())

  useEffect(() => {
    setLoading(true)
    setError(null)
    setSelectedImg(0)
    fetch(`${API_BASE}/api/products/by-slug/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Product not found')
        return r.json()
      })
      .then(data => {
        setProduct(data)
        setLoading(false)
        addToRecentlyViewed(data)
        setRecentlyViewed(getRecentlyViewed())
        if (data.category_name) {
          fetch(`${API_BASE}/api/products?category=${encodeURIComponent(data.category_name)}&limit=50`)
            .then(r => r.json())
            .then(items => {
              const list = Array.isArray(items) ? items : []
              setRelated(list.filter(p => p.id !== data.id).slice(0, 3))
              setAllCategoryProducts(list)
            })
            .catch(() => {})
        }
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
    fetch(`${API_BASE}/api/ad-campaigns/active?position=product_detail`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAdCampaigns(data) })
      .catch(() => {})
  }, [slug])

  const getImages = (p) => {
    if (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) return p.images
    return [fallbackImg]
  }

  if (loading) return <><Header /><main className="product-detail-page" style={{ textAlign: 'center', padding: '200px 20px' }}><p>Loading...</p></main><Footer /></>
  if (error || !product) return <><Header /><main className="product-detail-page" style={{ textAlign: 'center', padding: '200px 20px' }}><h2>Product not found</h2><Link to="/" className="primary" style={{ marginTop: 20, display: 'inline-block' }}>Back to Home</Link></main><Footer /></>

  const images = getImages(product)
  const hasDiscount = product.selling_price && product.mrp && Number(product.selling_price) < Number(product.mrp)
  const discountPct = hasDiscount ? Math.round(((Number(product.mrp) - Number(product.selling_price)) / Number(product.mrp)) * 100) : 0
  const savings = hasDiscount ? Number(product.mrp) - Number(product.selling_price) : 0
  const activePrice = product.selling_price || product.mrp
  const weeklyPrice = activePrice ? Math.ceil(Number(activePrice) / 52) : null

  return (
    <>
      <Header />
      <main className="product-detail-page">

        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link> / <Link to={`/category/${product.category_name?.toLowerCase()?.replace(/\s+/g, '-')}`}>{product.category_name || 'Products'}</Link> / <span>{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="pd-grid">
          {/* Image Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-image">
              <img src={images[selectedImg] || images[0]} alt={product.name} />
              {hasDiscount && <span className="product-badge">SALE</span>}
              <button className="pd-zoom-btn" onClick={() => { setZoomOpen(true); setZoomScale(1) }} title="Zoom image">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
            </div>
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, i) => (
                  <button key={i} className={`pd-thumb ${i === selectedImg ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="pd-info">
            <span className="pd-category">{product.category_name}</span>
            <h1>{product.name}</h1>

            {product.brand && <p className="pd-brand">Brand: {product.brand}</p>}

            {/* Pay Weekly */}
            {weeklyPrice && (
              <p className="pd-pay-weekly">PAY WEEKLY FROM <strong>${weeklyPrice}*</strong></p>
            )}

            {/* Pricing */}
            <div className="pd-pricing-block">
              {hasDiscount ? (
                <>
                  <div className="pd-price-row">
                    <span className="pd-selling-price">${Number(product.selling_price).toLocaleString()}</span>
                    <span className="pd-mrp">${Number(product.mrp).toLocaleString()}</span>
                    <span className="pd-discount-badge">-{discountPct}%</span>
                  </div>
                  <p className="pd-savings">You save ${savings.toLocaleString()}</p>
                </>
              ) : (
                <div className="pd-price-row">
                  <span className="pd-selling-price">${Number(product.mrp || product.selling_price).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Colour */}
            {product.color && (
              <div className="pd-option-group">
                <label>Colour</label>
                <div className="pd-colour-options">
                  {product.color.split(',').map(c => c.trim()).filter(Boolean).map((c, i) => (
                    <div key={i} className="pd-colour-item">
                      <span className="pd-colour-dot" style={{ background: getColorHex(c) }} />
                      <span className="pd-colour-name">{getColorName(c)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials & Details */}
            {(product.material || product.color || product.warranty) && (
              <div className="pd-details-list">
                {product.material && <div className="pd-detail-item"><strong>Material:</strong> {product.material}</div>}
                {product.color && <div className="pd-detail-item"><strong>Colour:</strong> {product.color}</div>}
                {product.warranty && <div className="pd-detail-item"><strong>Warranty:</strong> {product.warranty}</div>}
                {product.delivery_info && <div className="pd-detail-item"><strong>Delivery:</strong> {product.delivery_info}</div>}
              </div>
            )}

            {/* Enquiry Button */}
            <button className="pd-enquiry-btn" onClick={() => setShowModal(true)}>
              ENQUIRE NOW
            </button>

            <p className="pd-or-call">or call us at <strong>0800 222 548</strong></p>

            <Link to="/apply-for-finance" className="pd-finance-btn">APPLY FOR FINANCE</Link>

            {/* Trust Checkmarks */}
            <div className="pd-trust-row">
              <span>&#10003; Friendly assistance</span>
              <span>&#10003; Delivery options available</span>
              <span>&#10003; Enquire for availability</span>
            </div>
          </div>
        </div>

        {/* Full Width Description */}
        {product.description && (
          <div className="pd-desc-full">
            <h2 className="pd-desc-heading">Description</h2>
            {product.description.split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        {/* Ad Campaign Banners */}
        {adCampaigns.length > 0 && adCampaigns.map(ad => (
          <a key={ad.id} href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="pd-ad-banner">
            <img src={ad.image} alt={ad.name} />
          </a>
        ))}

        {/* Related Products */}
        {related.length > 0 && (
          <section className="pd-related">
            <span className="pd-section-label">RELATED PRODUCTS</span>
            <h2>You may also like.</h2>
            <div className="pd-related-grid">
              {related.map(p => {
                const pImg = getImages(p)[0]
                const pHasDiscount = p.selling_price && p.mrp && Number(p.selling_price) < Number(p.mrp)
                const pDiscount = pHasDiscount ? Math.round(((Number(p.mrp) - Number(p.selling_price)) / Number(p.mrp)) * 100) : 0
                return (
                  <Link key={p.id} to={`/product/${p.slug || p.id}`} className="pd-related-card">
                    <div className="pd-related-img">
                      <img src={pImg} alt={p.name} />
                      {pHasDiscount && <span className="product-badge">-{pDiscount}%</span>}
                    </div>
                    <div className="pd-related-info">
                      <h3>{p.name}</h3>
                      <div className="product-pricing">
                        {p.selling_price && <span className="product-price">${Number(p.selling_price).toLocaleString()}</span>}
                        {p.mrp && p.selling_price && Number(p.mrp) !== Number(p.selling_price) && <span className="product-mrp">${Number(p.mrp).toLocaleString()}</span>}
                        {!p.selling_price && p.mrp && <span className="product-price">${Number(p.mrp).toLocaleString()}</span>}
                      </div>
                      <span className="pd-related-link">View product &rarr;</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Product Navigation */}
        {allCategoryProducts.length > 1 && (
          <section className="pd-product-nav">
            <div className="pd-nav-inner">
              {(() => {
                const idx = allCategoryProducts.findIndex(p => p.id === product.id)
                const prev = idx > 0 ? allCategoryProducts[idx - 1] : null
                const next = idx < allCategoryProducts.length - 1 ? allCategoryProducts[idx + 1] : null
                const totalPages = allCategoryProducts.length
                return (
                  <>
                    <Link to={prev ? `/product/${prev.slug || prev.id}` : '#'} className={`pd-nav-btn pd-nav-prev${!prev ? ' disabled' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      <span>Previous</span>
                    </Link>
                    <div className="pd-nav-pages">
                      <span className="pd-nav-current">Product {idx + 1} of {totalPages}</span>
                    </div>
                    <Link to={next ? `/product/${next.slug || next.id}` : '#'} className={`pd-nav-btn pd-nav-next${!next ? ' disabled' : ''}`}>
                      <span>Next</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  </>
                )
              })()}
            </div>
          </section>
        )}
      </main>

      {/* Recently Viewed */}
      {recentlyViewed.length > 1 && (
        <section className="pd-recently-viewed">
          <div className="pd-rv-inner">
            <span className="pd-section-label">RECENTLY VIEWED</span>
            <h2>You might also like.</h2>
            <div className="pd-rv-grid">
              {recentlyViewed.filter(p => p.id !== product.id).slice(0, 4).map(p => {
                const img = (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) ? p.images[0] : fallbackImg
                const pHasDiscount = p.selling_price && p.mrp && Number(p.selling_price) < Number(p.mrp)
                return (
                  <Link key={p.id} to={`/product/${p.slug || p.id}`} className="pd-rv-card">
                    <div className="pd-rv-img"><img src={img} alt={p.name} loading="lazy" /></div>
                    <div className="pd-rv-info">
                      <h3>{p.name}</h3>
                      <div className="product-pricing">
                        {p.selling_price && <span className="product-price">${Number(p.selling_price).toLocaleString()}</span>}
                        {p.mrp && p.selling_price && Number(p.mrp) !== Number(p.selling_price) && <span className="product-mrp">${Number(p.mrp).toLocaleString()}</span>}
                        {!p.selling_price && p.mrp && <span className="product-price">${Number(p.mrp).toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
      {showModal && <EnquiryModal product={product} onClose={() => setShowModal(false)} />}

      {/* Zoom Overlay */}
      {zoomOpen && (
        <div className="pd-zoom-overlay" onClick={() => setZoomOpen(false)}>
          <div className="pd-zoom-controls" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomScale(s => Math.max(1, s - 0.5))}>&#8722;</button>
            <span>{Math.round(zoomScale * 100)}%</span>
            <button onClick={() => setZoomScale(s => Math.min(4, s + 0.5))}>+</button>
            <button className="pd-zoom-close" onClick={() => setZoomOpen(false)}>&times;</button>
          </div>
          <div className="pd-zoom-img-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={images[selectedImg] || images[0]} alt={product.name} style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.3s ease' }} />
          </div>
        </div>
      )}
    </>
  )
}

export default ProductDetail
