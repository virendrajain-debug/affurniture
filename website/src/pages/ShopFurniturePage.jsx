import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ShopFurniturePage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/shop-furniture`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85" alt="Shop Furniture" />
          <div className="terms-hero-overlay">
            <span>OUR COLLECTION</span>
            <h1>Shop Furniture</h1>
            <p>Explore our curated range of quality furniture</p>
          </div>
        </section>

        <section className="terms-section" style={{ paddingTop: '60px' }}>
          <div className="terms-content">
            <div className="terms-text">
              {data?.content || 'Shop furniture information is being updated. Please check back later.'}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ShopFurniturePage
