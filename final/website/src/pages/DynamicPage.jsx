import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function DynamicPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/dynamic-pages/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Page not found')
        return r.json()
      })
      .then(data => { setPage(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
    window.scrollTo(0, 0)
  }, [slug])

  return (
    <>
      <Header />
      <main className="about-page">
        {page?.banner_image && (
          <section className="terms-hero-banner">
            <img src={page.banner_image} alt={page.title} />
            <div className="terms-hero-overlay">
              <span>{page.category?.toUpperCase()}</span>
              <h1>{page.title}</h1>
            </div>
          </section>
        )}

        {!page?.banner_image && (
          <section className="terms-hero-banner">
            <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85" alt={page?.title} />
            <div className="terms-hero-overlay">
              <span>{page?.category?.toUpperCase()}</span>
              <h1>{page?.title}</h1>
            </div>
          </section>
        )}

        {loading ? (
          <section className="terms-section">
            <div className="terms-content">
              <div className="terms-text">Loading...</div>
            </div>
          </section>
        ) : error ? (
          <section className="terms-section">
            <div className="terms-content">
              <div className="terms-text">
                <h2>Page not found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <Link to="/" className="primary" style={{ display: 'inline-block', marginTop: 20 }}>Back to Home</Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="terms-section">
            <div className="terms-content">
              <div className="terms-text" dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

export default DynamicPage
