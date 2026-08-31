import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'

function Hero({ slides: propSlides }) {
  const [current, setCurrent] = useState(0)
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API_BASE + '/api/page-banners?page_key=home')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Only active hero slides
          const activeHeroSlots = data.filter(b => (b.slot?.startsWith('hero') || b.slot === 'hero') && b.active === 1 && b.image)
          if (activeHeroSlots.length > 0) {
            setSlides(activeHeroSlots.map(s => ({
              image: getAssetUrl(s.image),
              alt: s.title || s.label || 'Furniture Hero Slide',
              tagline: s.label || 'AF FURNISHINGS',
              title: s.title || 'Comfort made for everyday living.',
              desc: s.subtitle || s.description || '',
              button_link: s.cta_link || '/category/lounge-suite',
            })))
            setLoading(false)
            return
          }
        }
        setSlides([])
        setLoading(false)
      })
      .catch(() => {
        setSlides([])
        setLoading(false)
      })
  }, [propSlides])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (loading || slides.length === 0) return null

  const curSlide = slides[current] || slides[0]

  return (
    <section className="hero" id="home">
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.image}
          alt={slide.alt}
          className={'hero-slide ' + (i === current ? 'active' : '')}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <div className="hero-content">
        <span className="hero-tagline">{curSlide.tagline}</span>
        <h1 className="hero-title">{curSlide.title}</h1>
        <p className="hero-desc">{curSlide.desc}</p>
        <Link to={curSlide.button_link || '/category/lounge-suite'} className="hero-btn">
          Explore Collection
        </Link>
      </div>

      {slides.length > 1 && (
        <div className="hero-indicators">
          {slides.map((_, i) => (
            <button
              key={i}
              className={'hero-indicator ' + (i === current ? 'active' : '')}
              onClick={() => setCurrent(i)}
              aria-label={'Slide ' + (i + 1)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Hero;
