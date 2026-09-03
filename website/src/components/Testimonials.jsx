import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'

function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTestimonials(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const visibleCount = 3
  const maxIndex = Math.max(0, testimonials.length - visibleCount)

  const prev = () => setCurrentIndex(i => Math.max(0, i - 1))
  const next = () => setCurrentIndex(i => Math.min(maxIndex, i + 1))

  if (loading || testimonials.length === 0) return null

  const visible = testimonials.slice(currentIndex, currentIndex + visibleCount)

  return (
    <section className="testimonials">
      <div className="section-title fade-in">
        <span>FROM OUR CUSTOMERS</span>
        <h2>Homes made happier.</h2>
      </div>
      <div className="testimonial-grid">
        {visible.map((t) => (
          <blockquote key={t.id} className="testimonial-card fade-in">
            <div className="testimonial-stars">{'★'.repeat(t.rating || 5)}</div>
            <p>&ldquo;{t.quote}&rdquo;</p>
            <div className="testimonial-author">
              {t.avatar ? (
                <img src={getAssetUrl(t.avatar)} alt={t.name} className="testimonial-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="testimonial-avatar">{t.name?.charAt(0)}</div>
              )}
              <div>
                <cite>&mdash; {t.name}</cite>
                {t.location && <span className="testimonial-location">{t.location}</span>}
              </div>
            </div>
          </blockquote>
        ))}
      </div>
      {testimonials.length > visibleCount && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
          <button onClick={prev} disabled={currentIndex === 0} aria-label="Previous testimonials" style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--gold)', background: currentIndex === 0 ? 'transparent' : 'var(--gold)', color: currentIndex === 0 ? 'var(--gold)' : '#fff', cursor: currentIndex === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={next} disabled={currentIndex >= maxIndex} aria-label="Next testimonials" style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--gold)', background: currentIndex >= maxIndex ? 'transparent' : 'var(--gold)', color: currentIndex >= maxIndex ? 'var(--gold)' : '#fff', cursor: currentIndex >= maxIndex ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}
    </section>
  )
}

export default Testimonials
