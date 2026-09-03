import { getAssetUrl } from '../config'

function PromoPoster({ ad }) {
  if (!ad) return null

  const image = getAssetUrl(ad.image) || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85'
  const badge = ad.badge || 'AF WEEKLY SPECIAL'
  const title = ad.title || 'Bring comfort home.'
  const subtitle = ad.subtitle || 'Explore our latest arrivals with flexible weekly payments.'
  const buttonText = ad.button_text || 'View'
  const buttonLink = ad.button_link || '#'

  return (
    <section className="promo-poster">
      <img src={image} alt={title} />
      <div>
        <span>{badge}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <a className="primary" href={buttonLink}>{buttonText}</a>
      </div>
    </section>
  )
}

export default PromoPoster
