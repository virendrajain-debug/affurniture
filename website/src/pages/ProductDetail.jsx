import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import EnquiryModal from '../components/EnquiryModal'

const fallbackImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [related, setRelated] = useState([])
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Product not found')
        return r.json()
      })
      .then(data => {
        setProduct(data)
        setLoading(false)
        if (data.category_name) {
          fetch(`${API_BASE}/api/products?category=${encodeURIComponent(data.category_name)}&limit=4`)
            .then(r => r.json())
            .then(items => setRelated(items.filter(p => p.id !== data.id).slice(0, 3)))
            .catch(() => {})
        }
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const getImg = (p) => {
    if (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) return p.images[0]
    return fallbackImg
  }

  if (loading) return <><Header /><main className="product-detail-page" style={{textAlign:'center',padding:'200px 20px'}}><p>Loading...</p></main><Footer /></>
  if (error || !product) return <><Header /><main className="product-detail-page" style={{textAlign:'center',padding:'200px 20px'}}><h2>Product not found</h2><Link to="/" className="primary" style={{marginTop:20,display:'inline-block'}}>Back to Home</Link></main><Footer /></>

  const weekly = product.selling_price ? Math.ceil(Number(product.selling_price) / 52) : null
  const hasDiscount = product.selling_price && product.mrp && Number(product.selling_price) < Number(product.mrp)

  return (
    <>
      <Header />
      <main className="product-detail-page">
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link> / <Link to={product.category_name === 'Bedroom' ? '/#bedroom' : product.category_name === 'Dining' ? '/#dining' : '/#sofas'}>{product.category_name || 'Products'}</Link> / <span>{product.name}</span>
        </div>

        <div className="pd-grid">
          <div className="pd-image">
            <img src={getImg(product)} alt={product.name} />
            {hasDiscount && <span className="product-badge">SALE</span>}
            <button className="pd-zoom-btn" onClick={() => { setZoomOpen(true); setZoomScale(1) }} title="Zoom image">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
          </div>

          <div className="pd-info">
            <span className="pd-category">{product.category_name}</span>
            <h1>{product.name}</h1>

            <div className="pd-pricing">
              {product.selling_price && <span className="pd-price">${Number(product.selling_price).toLocaleString()}</span>}
              {hasDiscount && <span className="pd-mrp">${Number(product.mrp).toLocaleString()}</span>}
              {!product.selling_price && product.mrp && <span className="pd-price">${Number(product.mrp).toLocaleString()}</span>}
            </div>

            {weekly && <p className="pd-weekly">Or just <strong>${weekly}/week</strong> on flexible finance</p>}

            {product.description && <p className="pd-desc">{product.description}</p>}

            <div className="pd-meta-grid">
              {product.material && <div><strong>Material</strong><span>{product.material}</span></div>}
              {product.color && <div><strong>Color</strong><span>{product.color}</span></div>}
              {product.size && <div><strong>Size</strong><span>{product.size}</span></div>}
              {product.dimensions && <div><strong>Dimensions</strong><span>{product.dimensions}</span></div>}
              {product.weight && <div><strong>Weight</strong><span>{product.weight} kg</span></div>}
              {product.warranty && <div><strong>Warranty</strong><span>{product.warranty}</span></div>}
              {product.delivery_info && <div><strong>Delivery</strong><span>{product.delivery_info}</span></div>}
              <div><strong>Stock</strong><span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span></div>
            </div>

            <button className="pd-enquiry-btn" onClick={() => setShowModal(true)}>
              Enquire Now
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pd-related">
            <div className="section-title">
              <span>YOU MAY ALSO LIKE</span>
              <h2>Related products</h2>
            </div>
            <div className="pd-related-grid">
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="pd-related-card">
                  <img src={getImg(p)} alt={p.name} />
                  <h3>{p.name}</h3>
                  <span>{p.selling_price ? `$${Number(p.selling_price).toLocaleString()}` : p.mrp ? `$${Number(p.mrp).toLocaleString()}` : ''}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      {showModal && <EnquiryModal product={product} onClose={() => setShowModal(false)} />}

      {zoomOpen && (
        <div className="pd-zoom-overlay" onClick={() => setZoomOpen(false)}>
          <div className="pd-zoom-controls" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomScale(s => Math.max(1, s - 0.5))}>&#8722;</button>
            <span>{Math.round(zoomScale * 100)}%</span>
            <button onClick={() => setZoomScale(s => Math.min(4, s + 0.5))}>+</button>
            <button className="pd-zoom-close" onClick={() => setZoomOpen(false)}>&times;</button>
          </div>
          <div className="pd-zoom-img-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={getImg(product)} alt={product.name} style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.3s ease' }} />
          </div>
        </div>
      )}
    </>
  )
}

export default ProductDetail
