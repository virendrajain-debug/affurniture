import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'
import { stripHtml } from '../utils'
import Header from '../components/Header'
import Footer from '../components/Footer'

function WinzPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/winz-products?active_only=true`, { cache: 'no-store', signal: controller.signal })
        const data = await res.json()
        if (Array.isArray(data)) setProducts(data)
      } catch (err) {
        if (err && err.name === 'AbortError') return
        setProducts([])
      }
      setLoading(false)
    }
    fetchProducts()
    return () => controller.abort()
  }, [])

  // Strip HTML once per products update instead of twice per card per render.
  const displayProducts = useMemo(() => products.map((p) => ({
    ...p,
    descriptionText: stripHtml(p.description),
  })), [products])

  const getImg = (p) => {
    if (p.image) return getAssetUrl(p.image)
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  }

  return (
    <>
      <Header />
      <main className="winz-page">
        <section className="winz-hero-banner">
          <div className="winz-hero-banner-inner">
            <span>AF FURNISHINGS</span>
            <h1>WINZ CATALOG</h1>
          </div>
        </section>

        <section className="winz-grid-section">
          {loading ? (
            <div className="winz-loading">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="winz-empty">
              <h3>No products available</h3>
              <p>Check back later for new WinZ catalogue items.</p>
            </div>
          ) : (
            <div className="winz-grid">
              {displayProducts.map(p => (
                <article key={p.id} className="winz-product-card">
                  <div className="winz-product-img">
                    <img src={getImg(p)} alt={p.name} loading="lazy" />
                    <div className="winz-product-title-bar">
                      <h3>{p.name}</h3>
                    </div>
                  </div>
                  <div className="winz-product-info">
                    {p.descriptionText && <p>{p.descriptionText}</p>}
                    <Link
                      to={`/winz-quote?product=${encodeURIComponent(p.name)}`}
                      className="winz-quote-btn"
                    >
                      Get a Quote
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

export default WinzPage
