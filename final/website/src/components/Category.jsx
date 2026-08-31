import { Link } from 'react-router-dom'

const defaultImages = {
  'Living Room': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85',
  'Bedroom': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=85',
  'Dining': 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1800&q=85',
  'Office': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1800&q=85',
  'Outdoor': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
}

const subtitles = {
  'Living Room': 'Comfort for every day',
  'Bedroom': 'Rest beautifully',
  'Dining': 'Gather around good moments',
  'Office': 'Work in comfort',
  'Outdoor': 'Relax under the sky',
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function Category({ id, title, subtitle, image, link, reverse, apiCategory }) {
  const slug = slugify(title)
  const categoryLink = link || `/category/${slug}`
  const img = image || defaultImages[apiCategory || title] || defaultImages['Living Room']
  const sub = subtitle || subtitles[apiCategory || title] || 'Quality furniture for your home'

  return (
    <section className={`category ${reverse ? 'reverse' : ''}`} id={id || slug}>
      <div className="category-hero">
        <img src={img} alt={title} loading="lazy" />
        <div>
          <h2>{title}</h2>
          <p>{sub}</p>
          <Link to={categoryLink} className="primary">Shop {title.toLowerCase()}</Link>
        </div>
      </div>
    </section>
  )
}

export default Category
