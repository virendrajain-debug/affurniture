import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) { setProducts([]); setLoading(false); return }
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/products?search=${encodeURIComponent(query)}`)
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch { setProducts([]) }
      setLoading(false)
    }
    fetchResults()
  }, [query])

  const getImg = (p) => {
    if (p.images && p.images.length > 0 && !String(p.images[0]).startsWith('[')) return p.images[0]
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  }

  const getWeekly = (price) => price ? Math.ceil(Number(price) / 52) : null

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85" alt="Search" />
          <div className="terms-hero-overlay">
            <span>SEARCH</span>
            <h1>Search Results</h1>
            {query && <p>Showing results for "{query}"</p>}
          </div>
        </section>

        <section className="category-catalogue">
          <div className="category-catalogue-header">
            <div className="category-catalogue-info">
              <h2>{query ? `Results for "${query}"` : 'Search Products'}</h2>
              <span className="category-product-count">{products.length} products found</span>
            </div>
          </div>

          {loading ? (
            <div className="category-loading">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          ) : !query.trim() ? (
            <div className="category-empty">
              <h3>Enter a search term</h3>
              <p>Use the search bar above to find products.</p>
              <Link to="/" className="primary">Back to Home</Link>
            </div>
          ) : products.length === 0 ? (
            <div className="category-empty">
              <h3>No results found for "{query}"</h3>
              <p>Try different keywords or browse our categories.</p>
              <Link to="/" className="primary">Back to Home</Link>
            </div>
          ) : (
            <div className="category-product-grid">
              {products.map(p => {
                const imgSrc = getImg(p)
                const weekly = getWeekly(p.selling_price || p.mrp)
                const hasDiscount = p.selling_price && p.mrp && Number(p.selling_price) < Number(p.mrp)
                return (
                  <article key={p.id} className="category-product-card">
                    <Link to={`/product/${p.slug || p.id}`} className="category-product-img">
                      <img src={imgSrc} alt={p.name} loading="lazy" />
                      {hasDiscount && <span className="product-badge">SALE</span>}
                    </Link>
                    <div className="category-product-body">
                      <Link to={`/product/${p.slug || p.id}`}><h3>{p.name}</h3></Link>
                      <div className="product-pricing">
                        {p.selling_price && <span className="product-price">${Number(p.selling_price).toLocaleString()}</span>}
                        {p.mrp && p.selling_price && Number(p.mrp) !== Number(p.selling_price) && <span className="product-mrp">${Number(p.mrp).toLocaleString()}</span>}
                        {!p.selling_price && p.mrp && <span className="product-price">${Number(p.mrp).toLocaleString()}</span>}
                      </div>
                      {weekly && <p className="product-weekly">Or just <strong>${weekly}/week</strong> on finance</p>}
                      {p.category_name && <p className="product-meta">{p.category_name}</p>}
                      <Link to={`/product/${p.slug || p.id}`} className="btn-shop-now">Shop Now</Link>
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

export default SearchPage
