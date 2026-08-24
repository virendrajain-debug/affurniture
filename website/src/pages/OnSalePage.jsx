import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function OnSalePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products?on_sale=true`)
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch { setProducts([]) }
      setLoading(false)
    }
    fetchSaleProducts()
  }, [])

  const getImg = (p) => {
    if (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) return p.images[0]
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  }

  const getWeekly = (price) => price ? Math.ceil(Number(price) / 52) : null

  const getDiscount = (mrp, price) => {
    if (!mrp || !price) return 0
    return Math.round(((mrp - price) / mrp) * 100)
  }

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=2000&q=85" alt="On Sale" />
          <div className="terms-hero-overlay">
            <span>DEALS</span>
            <h1>On Sale!</h1>
            <p>Great deals on quality furniture</p>
          </div>
        </section>

        <section className="category-catalogue">
          <div className="category-catalogue-header">
            <div className="category-catalogue-info">
              <h2>Sale Items</h2>
              <p>Grab these deals before they're gone!</p>
              <span className="category-product-count">{products.length} items on sale</span>
            </div>
          </div>

          {loading ? (
            <div className="category-loading">
              <div className="loading-spinner"></div>
              <p>Loading sale items...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="category-empty">
              <h3>No sale items right now</h3>
              <p>Check back soon for amazing deals!</p>
              <Link to="/" className="primary">Back to Home</Link>
            </div>
          ) : (
            <div className="category-product-grid">
              {products.map(p => {
                const imgSrc = getImg(p)
                const weekly = getWeekly(p.discounted_price || p.selling_price || p.mrp)
                const price = p.discounted_price || p.selling_price || p.mrp
                const discount = getDiscount(p.mrp, price)
                return (
                  <article key={p.id} className="category-product-card">
                    <Link to={`/product/${p.id}`} className="category-product-img">
                      <img src={imgSrc} alt={p.name} loading="lazy" />
                      {discount > 0 && <span className="product-badge">{discount}% OFF</span>}
                    </Link>
                    <div className="category-product-body">
                      <Link to={`/product/${p.id}`}>
                        <h3>{p.name}</h3>
                      </Link>
                      <div className="product-pricing">
                        <span className="product-price">${Number(price).toLocaleString()}</span>
                        {p.mrp && Number(p.mrp) !== Number(price) && <span className="product-mrp">${Number(p.mrp).toLocaleString()}</span>}
                      </div>
                      {weekly && <p className="product-weekly">Or just <strong>${weekly}/week</strong> on finance</p>}
                      {p.material && <p className="product-meta">{p.material}{p.color ? ` - ${p.color}` : ''}</p>}
                      <Link to={`/product/${p.id}`} className="btn-shop-now">Shop Now</Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

export default OnSalePage
