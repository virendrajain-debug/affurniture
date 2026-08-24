import { Link } from 'react-router-dom'

function Category({ id, title, subtitle, image, link, reverse }) {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace('suite', '').replace('--', '-')
  const categoryLink = `/category/${slug}`

  return (
    <section className={`category ${reverse ? 'reverse' : ''}`} id={id}>
      <div className="category-hero">
        <img src={image} alt={title} />
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <Link to={categoryLink} className="primary">Shop {title.toLowerCase()}</Link>
        </div>
      </div>
    </section>
  )
}

export default Category
