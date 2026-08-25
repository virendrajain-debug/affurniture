import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import EnquiryModal from '../components/EnquiryModal'

const fallbackImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'

const sampleReviews = [
  { name: 'Talia M.', stars: 5, text: 'This lounge is incredibly comfortable. We love the recliners and it fits our family space perfectly.' },
  { name: 'Sina F.', stars: 5, text: 'The AF team made choosing the right layout very easy. It looks beautiful in our home.' },
  { name: 'Jordan K.', stars: 5, text: 'Soft, supportive and easy to keep clean. Exactly what we needed.' },
]

function ProductDetail() {
  const { id } = useParams()
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

  useEffect(() => {
    setLoading(true)
    setError(null)
    setSelectedImg(0)
    fetch(`${API_BASE}/api/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Product not found')
        return r.json()
      })
      .then(data => {
        setProduct(data)
        setLoading(false)
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
  }, [id])

  const getImages = (p) => {
    if (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) return p.images
    return [fallbackImg]
  }

  if (loading) return <><Header /><main className="product-detail-page" style={{ textAlign: 'center', padding: '200px 20px' }}><p>Loading...</p></main><Footer /></>
  if (error || !product) return <><Header /><main className="product-detail-page" style={{ textAlign: 'center', padding: '200px 20px' }}><h2>Product not found</h2><Link to="/" className="primary" style={{ marginTop: 20, display: 'inline-block' }}>Back to Home</Link></main><Footer /></>

  const images = getImages(product)
  const weekly = product.selling_price ? Math.ceil(Number(product.selling_price) / 52) : null
  const hasDiscount = product.selling_price && product.mrp && Number(product.selling_price) < Number(product.mrp)

  return (
    <>
      <Header />
      <main className="product-detail-page">

        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link> / <Link to={product.category_name === 'Bedroom' ? '/#bedroom' : product.category_name === 'Dining' ? '/#dining' : '/#sofas'}>{product.category_name || 'Products'}</Link> / <span>{product.name}</span>
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

            <div className="pd-rating-row">
              <span className="pd-rating-stars-inline">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span className="pd-rating-link">4.8 &middot; 24 customer reviews</span>
            </div>

            <p className="pd-desc">{product.description || 'A comfortable piece designed for long evenings, slow Sundays and everyday family living.'}</p>

            {/* Configuration Selector */}
            <div className="pd-option-group">
              <label>Choose a configuration</label>
              <div className="pd-option-pills">
                {['3 + 2 + 1', '3 + 2', 'Single recliner'].map(cfg => (
                  <button key={cfg} className={`pd-pill ${selectedConfig === cfg ? 'active' : ''}`} onClick={() => setSelectedConfig(cfg)}>{cfg}</button>
                ))}
              </div>
            </div>

            {/* Colour Selector */}
            <div className="pd-option-group">
              <label>Choose a colour</label>
              <div className="pd-colour-swatches">
                {[
                  { name: 'Beige', color: '#c9b99a' },
                  { name: 'Grey', color: '#a0a0a0' },
                  { name: 'Black', color: '#2d2d2d' },
                ].map(c => (
                  <button key={c.name} className={`pd-swatch ${selectedColor === c.name ? 'active' : ''}`} style={{ background: c.color }} onClick={() => setSelectedColor(c.name)} title={c.name}>
                    {selectedColor === c.name && <span className="pd-swatch-check">&#10003;</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Payment Guide */}
            <div className="pd-payment-guide">
              <div className="pd-payment-left">
                <span className="pd-payment-label">Weekly payment guide</span>
                <div className="pd-payment-price">
                  <span className="pd-payment-dollar">${weekly || '00'}</span>
                  <span className="pd-payment-period">per week</span>
                </div>
              </div>
              <a href="#order-details" className="pd-order-details-link">Order details</a>
            </div>

            {/* Enquiry Button */}
            <button className="pd-enquiry-btn" onClick={() => setShowModal(true)}>
              ADD TO ENQUIRY
            </button>

            {/* Trust Checkmarks */}
            <div className="pd-trust-row">
              <span>&#10003; Friendly assistance</span>
              <span>&#10003; Delivery options available</span>
              <span>&#10003; Enquire for availability</span>
            </div>
          </div>
        </div>

        {/* Order Details Section */}
        <section className="pd-order-details" id="order-details">
          <div className="pd-order-inner">
            <div className="pd-order-content">
              <span className="pd-section-label">ORDER DETAILS</span>
              <h2>Comfort that works<br/>for your home.</h2>
              <p>{product.description || 'The ' + product.name + ' combines generous cushioning, supportive design and smooth finishing. The flexible configuration lets you choose a setup that makes sense for your room.'}</p>

              <div className="pd-specs-table">
                <div className="pd-spec-row">
                  <strong>What's included</strong>
                  <span>Selected configuration, seat cushions and care guide.</span>
                </div>
                <div className="pd-spec-row">
                  <strong>Materials</strong>
                  <span>{product.material || 'Easy-care upholstery'}{product.color ? ` - ${product.color}` : ''}. {product.warranty || 'Supportive foam and solid internal frame.'}</span>
                </div>
                <div className="pd-spec-row">
                  <strong>Delivery</strong>
                  <span>{product.delivery_info || 'Our team will confirm delivery options after your enquiry.'}</span>
                </div>
              </div>
            </div>

            <div className="pd-help-card">
              <h3>Need help choosing?</h3>
              <p>Share your room measurements with us and we'll help you decide on the right configuration.</p>
              <a href="mailto:affurnishings@gmail.com" className="pd-help-link">Email the AF team</a>
              <a href="tel:12345667890" className="pd-help-call">Call 12345667890</a>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="pd-reviews">
          <span className="pd-section-label">CUSTOMER REVIEWS</span>
          <h2>Loved in real homes.</h2>
          <div className="pd-reviews-rating">
            <span className="pd-rating-num">4.8</span>
            <div className="pd-rating-stars">
              <span>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span className="pd-rating-count">Based on 24 reviews</span>
            </div>
          </div>

          <div className="pd-reviews-grid">
            {sampleReviews.map((review, i) => (
              <div key={i} className="pd-review-card">
                <p className="pd-review-text">"{review.text}"</p>
                <div className="pd-review-author">
                  <span>— {review.name}. </span>
                  <span className="pd-review-stars">{'★'.repeat(review.stars)}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="pd-review-btn" onClick={() => setShowModal(true)}>WRITE A REVIEW</button>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="pd-related">
            <span className="pd-section-label">YOU MAY ALSO LIKE</span>
            <h2>Complete your {product.category_name?.toLowerCase() || 'space'}.</h2>
            <div className="pd-related-grid">
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="pd-related-card">
                  <div className="pd-related-img">
                    <img src={getImages(p)[0]} alt={p.name} />
                  </div>
                  <div className="pd-related-info">
                    <h3>{p.name}</h3>
                    <span className="pd-related-desc">{p.description ? p.description.substring(0, 60) + '...' : 'Quality furniture piece.'}</span>
                    <span className="pd-related-link">View product &rarr;</span>
                  </div>
                </Link>
              ))}
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
                    <Link to={prev ? `/product/${prev.id}` : '#'} className={`pd-nav-btn pd-nav-prev${!prev ? ' disabled' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      <span>Previous</span>
                    </Link>
                    <div className="pd-nav-pages">
                      <span className="pd-nav-current">Product {idx + 1} of {totalPages}</span>
                    </div>
                    <Link to={next ? `/product/${next.id}` : '#'} className={`pd-nav-btn pd-nav-next${!next ? ' disabled' : ''}`}>
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
