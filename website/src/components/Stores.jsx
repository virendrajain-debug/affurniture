const stores = [
  {
    img: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80',
    city: 'Auckland',
    desc: 'Central Auckland showroom with over 200 furniture displays. Open by appointment.',
    link: 'mailto:affurniture@gmail.com',
    linkText: 'Book a visit',
  },
  {
    img: 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=900&q=80',
    city: 'Wellington',
    desc: 'Wellington design studio with curated collections. Open by appointment.',
    link: 'mailto:affurniture@gmail.com',
    linkText: 'Book a visit',
  },
  {
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=80',
    city: 'Online consultations',
    desc: 'Meet with our furnishing team from wherever you are. Virtual showroom tours available.',
    link: 'tel:12345667890',
    linkText: 'Call us',
  },
]

function Stores() {
  return (
    <section className="stores" id="living">
      <div className="section-title fade-in">
        <span>VISIT US</span>
        <h2>Our showrooms.</h2>
      </div>
      <div className="store-grid">
        {stores.map((s, i) => (
          <article key={i} className={`fade-in stagger-${i + 1}`}>
            <div className="store-img-wrap">
              <img src={s.img} alt={s.city} />
            </div>
            <div className="store-content">
              <h3>{s.city}</h3>
              <p>{s.desc}</p>
              <a href={s.link}>{s.linkText} &#8594;</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Stores
