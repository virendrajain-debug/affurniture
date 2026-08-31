import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'

function PromoPoster({ promo, ad }) {
  const [data, setData] = useState(promo || ad || null)

  useEffect(() => {
    // Dynamically fetch active ad campaign from backend
    fetch(`${API_BASE}/api/ad-campaigns`)
      .then(r => r.json())
      .then(d => {
        if (d && typeof d === 'object') setData(d)
      })
      .catch(() => {})
  }, [])

  const current = data || promo || ad || {}
  const image = current.image ? getAssetUrl(current.image) : 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85'
  const badge = current.badge || 'AF WEEKLY SPECIAL'
  const title = current.title || 'Bring comfort home.'
  const subtitle = current.subtitle || current.description || 'Explore our latest living-room arrivals, all priced at $00.'
  const btnText = current.button_text || current.cta_text || 'VIEW'
  const btnLink = current.button_link || current.cta_link || '/category/living'

  const isExternal = btnLink.startsWith('http')

  return (
    <section className="promo-poster">
      <img src={image} alt={title} />
      <div>
        <span>{badge}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {isExternal ? (
          <a className="primary" href={btnLink} target="_blank" rel="noopener noreferrer">
            {btnText}
          </a>
        ) : (
          <Link className="primary" to={btnLink}>
            {btnText}
          </Link>
        )}
      </div>
    </section>
  )
}

export default PromoPoster;
